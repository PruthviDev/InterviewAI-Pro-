import type { Role } from '../constants.js';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
}

export interface NewSession {
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
}

export interface SessionRecord extends NewSession {
  id: string;
  revokedAt: Date | null;
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  /** Throws ConflictError('EMAIL_TAKEN') when the email already exists. */
  create(data: { email: string; passwordHash: string; name: string }): Promise<UserRecord>;
}

export interface SessionRepository {
  create(data: NewSession): Promise<SessionRecord>;
  findByTokenHash(tokenHash: string): Promise<SessionRecord | null>;
  /**
   * Atomically revokes `oldId` and creates `next`. Returns null, creating nothing,
   * if `oldId` was already revoked (a concurrent or replayed refresh).
   */
  rotate(oldId: string, next: NewSession): Promise<SessionRecord | null>;
  revoke(id: string): Promise<void>;
  revokeFamily(familyId: string): Promise<void>;
}
