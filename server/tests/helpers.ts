import { randomUUID } from 'node:crypto';
import { createApp } from '../src/app.js';
import { loadEnv } from '../src/config/env.js';
import { ConflictError } from '../src/errors/index.js';
import type {
  NewSession,
  SessionRecord,
  SessionRepository,
  UserRecord,
  UserRepository,
} from '../src/repositories/types.js';
import { AuthService } from '../src/services/authService.js';
import type { HealthChecks } from '../src/services/healthService.js';
import { PasswordService } from '../src/services/passwordService.js';
import { TokenService } from '../src/services/tokenService.js';
import { createLogger } from '../src/utils/logger.js';

export class InMemoryUserRepository implements UserRepository {
  users: UserRecord[] = [];

  async findByEmail(email: string) {
    return this.users.find((u) => u.email === email) ?? null;
  }
  async findById(id: string) {
    return this.users.find((u) => u.id === id) ?? null;
  }
  async findByName(name: string) {
    return this.users.find((u) => u.name.toLowerCase() === name.toLowerCase()) ?? null;
  }
  async findByIdentifier(identifier: string) {
    if (identifier.includes('@')) return this.findByEmail(identifier.toLowerCase());
    return this.findByName(identifier);
  }
  async create(data: { email: string; passwordHash: string; name: string }) {
    if (this.users.some((u) => u.email === data.email)) {
      throw new ConflictError('Email already registered', 'EMAIL_TAKEN');
    }
    if (this.users.some((u) => u.name.toLowerCase() === data.name.toLowerCase())) {
      throw new ConflictError('Name already taken', 'NAME_TAKEN');
    }
    const user: UserRecord = {
      id: randomUUID(),
      role: 'USER',
      isActive: true,
      createdAt: new Date(),
      ...data,
    };
    this.users.push(user);
    return user;
  }
}

export class InMemorySessionRepository implements SessionRepository {
  sessions: SessionRecord[] = [];

  async create(data: NewSession) {
    const session: SessionRecord = { id: randomUUID(), revokedAt: null, ...data };
    this.sessions.push(session);
    return session;
  }
  async findByTokenHash(tokenHash: string) {
    return this.sessions.find((s) => s.tokenHash === tokenHash) ?? null;
  }
  async rotate(oldId: string, next: NewSession) {
    const old = this.sessions.find((s) => s.id === oldId);
    if (!old || old.revokedAt) return null;
    old.revokedAt = new Date();
    return this.create(next);
  }
  async revoke(id: string) {
    const s = this.sessions.find((x) => x.id === id);
    if (s && !s.revokedAt) s.revokedAt = new Date();
  }
  async revokeFamily(familyId: string) {
    for (const s of this.sessions) if (s.familyId === familyId && !s.revokedAt) s.revokedAt = new Date();
  }
}

const up = async () => {};

export function buildTestApp(health: HealthChecks = { database: up, redis: up }) {
  const env = loadEnv({
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    DATABASE_URL: 'postgresql://x',
    REDIS_URL: 'redis://x',
    JWT_SECRET: 'a'.repeat(32),
  });
  const logger = createLogger(env);
  const users = new InMemoryUserRepository();
  const sessions = new InMemorySessionRepository();
  const tokens = new TokenService(env.JWT_SECRET, env.JWT_ACCESS_TTL_SECONDS);
  const authService = new AuthService({
    users,
    sessions,
    // Cheap Argon2 parameters keep tests fast; production uses the defaults.
    passwords: new PasswordService({ memoryCost: 1024, timeCost: 1, parallelism: 1 }),
    tokens,
    refreshTtlDays: env.REFRESH_TOKEN_TTL_DAYS,
  });
  const app = createApp({ env, logger, health, authService, tokens });
  return { app, env, logger, users, sessions, tokens };
}
