import { createHash, randomBytes } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import { z } from 'zod';
import { ROLES, type Role } from '../constants.js';
import { UnauthorizedError } from '../errors/index.js';

const ISSUER = 'ai-interviewpro';
const claimsSchema = z.object({ sub: z.string().uuid(), role: z.enum(ROLES) });

export interface AccessClaims {
  userId: string;
  role: Role;
}

export class TokenService {
  private readonly key: Uint8Array;

  constructor(
    secret: string,
    private readonly accessTtlSeconds: number,
  ) {
    this.key = new TextEncoder().encode(secret);
  }

  signAccessToken(claims: AccessClaims): Promise<string> {
    return new SignJWT({ role: claims.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(claims.userId)
      .setIssuer(ISSUER)
      .setIssuedAt()
      .setExpirationTime(`${this.accessTtlSeconds}s`)
      .sign(this.key);
  }

  async verifyAccessToken(token: string): Promise<AccessClaims> {
    try {
      const { payload } = await jwtVerify(token, this.key, {
        issuer: ISSUER,
        algorithms: ['HS256'],
      });
      const claims = claimsSchema.parse(payload);
      return { userId: claims.sub, role: claims.role };
    } catch {
      throw new UnauthorizedError('Invalid or expired token', 'INVALID_TOKEN');
    }
  }

  /** Opaque 256-bit refresh token. Only its SHA-256 hash is persisted. */
  generateRefreshToken(): { token: string; hash: string } {
    const token = randomBytes(32).toString('base64url');
    return { token, hash: TokenService.hashRefreshToken(token) };
  }

  static hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
