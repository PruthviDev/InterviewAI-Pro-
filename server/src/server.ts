import { prisma } from './lib/prisma.js';
import { Redis } from 'ioredis';
import { createApp } from './app.js';
import { loadEnv } from './config/env.js';
import { PrismaSessionRepository } from './repositories/prismaSessionRepository.js';
import { PrismaUserRepository } from './repositories/prismaUserRepository.js';
import { AuthService } from './services/authService.js';
import { PasswordService } from './services/passwordService.js';
import { TokenService } from './services/tokenService.js';
import { createLogger } from './utils/logger.js';

const env = loadEnv();
const logger = createLogger(env);
const redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: 2, lazyConnect: false });
redis.on('error', (err) => logger.warn({ err }, 'redis error'));

const tokens = new TokenService(env.JWT_SECRET, env.JWT_ACCESS_TTL_SECONDS);
const authService = new AuthService({
  users: new PrismaUserRepository(prisma),
  sessions: new PrismaSessionRepository(prisma),
  passwords: new PasswordService(),
  tokens,
  refreshTtlDays: env.REFRESH_TOKEN_TTL_DAYS,
});

const app = createApp({
  env,
  logger,
  authService,
  tokens,
  health: {
    database: async () => {
      await prisma.$queryRaw`SELECT 1`;
    },
    redis: async () => {
      await redis.ping();
    },
  },
});

const server = app.listen(env.PORT, () => logger.info({ port: env.PORT }, 'api listening'));

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'shutting down');
  server.close(async () => {
    await Promise.allSettled([prisma.$disconnect(), redis.quit()]);
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
