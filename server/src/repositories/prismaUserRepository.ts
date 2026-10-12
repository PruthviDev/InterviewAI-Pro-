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

  findByName(name: string): Promise<UserRecord | null> {
    return this.db.user.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } });
  }

  findByIdentifier(identifier: string): Promise<UserRecord | null> {
    if (identifier.includes('@')) {
      return this.db.user.findUnique({ where: { email: identifier.toLowerCase() } });
    }
    return this.db.user.findFirst({ where: { name: { equals: identifier, mode: 'insensitive' } } });
  }

  async create(data: { email: string; passwordHash: string; name: string }): Promise<UserRecord> {
    try {
      return await this.db.user.create({ data });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const target = err.meta?.target;
        const fields = Array.isArray(target) ? target : typeof target === 'string' ? [target] : [];
        if (fields.some((f: string) => f.includes('name'))) {
          throw new ConflictError('Name already taken', 'NAME_TAKEN');
        }
        throw new ConflictError('Email already registered', 'EMAIL_TAKEN');
      }
      throw err;
    }
  }
}
