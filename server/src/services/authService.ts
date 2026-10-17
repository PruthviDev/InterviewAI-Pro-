import { randomUUID } from 'node:crypto';
import type { LoginInput, RegisterInput } from '../validation/index.js';
import type { Role } from '../constants.js';
import { ConflictError, ForbiddenError, UnauthorizedError } from '../errors/index.js';
import type { SessionRepository, UserRecord, UserRepository } from '../repositories/types.js';
import type { PasswordService } from './passwordService.js';
import { TokenService } from './tokenService.js';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
}

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

export interface AuthDeps {
  users: UserRepository;
  sessions: SessionRepository;
  passwords: PasswordService;
  tokens: TokenService;
  refreshTtlDays: number;
}

const toPublic = (u: UserRecord): PublicUser => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
  createdAt: u.createdAt,
});

export class AuthService {
  private dummyHash?: Promise<string>;

  constructor(private readonly deps: AuthDeps) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await this.deps.users.findByName(input.name);
    if (existing) throw new ConflictError('Name already taken', 'NAME_TAKEN');
    const passwordHash = await this.deps.passwords.hash(input.password);
    const user = await this.deps.users.create({
      email: input.email,
      passwordHash,
      name: input.name,
    });
    return this.issue(user, randomUUID());
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.deps.users.findByIdentifier(input.loginIdentifier);
    // Verify against a dummy hash when the user is unknown so timing doesn't reveal it.
    const hash = user?.passwordHash ?? (await this.getDummyHash());
    const valid = await this.deps.passwords.verify(hash, input.password);
    if (!user || !valid) {
      throw new UnauthorizedError('Incorrect name/email or password', 'INVALID_CREDENTIALS');
    }
    if (!user.isActive) throw new ForbiddenError('This account is disabled', 'ACCOUNT_DISABLED');
    return this.issue(user, randomUUID());
  }

  async refresh(rawToken: string | undefined): Promise<AuthResult> {
    if (!rawToken) throw new UnauthorizedError('Session expired', 'INVALID_REFRESH_TOKEN');
    const session = await this.deps.sessions.findByTokenHash(TokenService.hashRefreshToken(rawToken));
    if (!session) throw new UnauthorizedError('Session expired', 'INVALID_REFRESH_TOKEN');

    if (session.revokedAt) {
      // A rotated token was presented again: assume theft and kill the whole family.
      await this.deps.sessions.revokeFamily(session.familyId);
      throw new UnauthorizedError('Session expired', 'REFRESH_TOKEN_REUSED');
    }
    if (session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedError('Session expired', 'INVALID_REFRESH_TOKEN');
    }

    const user = await this.deps.users.findById(session.userId);
    if (!user || !user.isActive) {
      await this.deps.sessions.revokeFamily(session.familyId);
      throw new UnauthorizedError('Session expired', 'INVALID_REFRESH_TOKEN');
    }
    return this.issue(user, session.familyId, session.id);
  }

  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    const session = await this.deps.sessions.findByTokenHash(TokenService.hashRefreshToken(rawToken));
    if (session) await this.deps.sessions.revokeFamily(session.familyId);
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.deps.users.findById(userId);
    if (!user || !user.isActive) throw new UnauthorizedError('Account unavailable', 'INVALID_TOKEN');
    return toPublic(user);
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= this.deps.passwords.hash(randomUUID());
    return this.dummyHash;
  }

  private async issue(user: UserRecord, familyId: string, rotateFromId?: string): Promise<AuthResult> {
    const refresh = this.deps.tokens.generateRefreshToken();
    const refreshExpiresAt = new Date(Date.now() + this.deps.refreshTtlDays * 86_400_000);
    const next = { userId: user.id, tokenHash: refresh.hash, familyId, expiresAt: refreshExpiresAt };

    if (rotateFromId) {
      const created = await this.deps.sessions.rotate(rotateFromId, next);
      if (!created) {
        await this.deps.sessions.revokeFamily(familyId);
        throw new UnauthorizedError('Session expired', 'REFRESH_TOKEN_REUSED');
      }
    } else {
      await this.deps.sessions.create(next);
    }

    const accessToken = await this.deps.tokens.signAccessToken({ userId: user.id, role: user.role });
    return { user: toPublic(user), accessToken, refreshToken: refresh.token, refreshExpiresAt };
  }
}
