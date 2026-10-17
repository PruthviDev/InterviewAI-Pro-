import { Prisma, type PrismaClient } from '@prisma/client';
import { ConflictError } from '../errors/index.js';
import type { UserRecord, UserRepository } from './types.js';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: PrismaClient) {}

  findByEmail(email: string): Promise<UserRecord | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<UserRecord | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  async create(data: { email: string; passwordHash: string; name: string }): Promise<UserRecord> {
    try {
      return await this.db.user.create({ data });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictError('Email already registered', 'EMAIL_TAKEN');
      }
      throw err;
    }
  }
}
