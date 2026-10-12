import type { PrismaClient } from '@prisma/client';
import type { NewSession, SessionRecord, SessionRepository } from './types.js';

export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly db: PrismaClient) {}

  create(data: NewSession): Promise<SessionRecord> {
    return this.db.session.create({ data });
  }

  findByTokenHash(tokenHash: string): Promise<SessionRecord | null> {
    return this.db.session.findUnique({ where: { tokenHash } });
  }

  async rotate(oldId: string, next: NewSession): Promise<SessionRecord | null> {
    return this.db.$transaction(async (tx) => {
      // The revokedAt guard makes this a compare-and-set: only one concurrent caller wins.
      const claimed = await tx.session.updateMany({
        where: { id: oldId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      if (claimed.count !== 1) return null;
      return tx.session.create({ data: next });
    });
  }

  async revoke(id: string): Promise<void> {
    await this.db.session.updateMany({ where: { id, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.db.session.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
