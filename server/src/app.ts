import { randomUUID } from 'node:crypto';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { Logger } from 'pino';
import type { Env } from './config/env.js';
import { createErrorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { createRouter } from './routes/index.js';
import type { AuthService } from './services/authService.js';
import type { HealthChecks } from './services/healthService.js';
import type { TokenService } from './services/tokenService.js';

export interface AppDeps {
  env: Env;
  logger: Logger;
  health: HealthChecks;
  authService: AuthService;
  tokens: TokenService;
}

export function createApp({ env, logger, health, authService, tokens }: AppDeps): Express {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    pinoHttp({
      logger,
      genReqId: (req, res) => {
        const incoming = req.headers['x-request-id'];
        const id = typeof incoming === 'string' && incoming.length <= 100 ? incoming : randomUUID();
        res.setHeader('x-request-id', id);
        return id;
      },
      serializers: {
        req: (req) => ({ id: req.id, method: req.method, url: req.url }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
    }),
  );
  app.use(helmet());
  app.use(cors({ origin: env.WEB_URL, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: env.BODY_LIMIT }));
  app.use(cookieParser());
  app.use((req, res, next) => {
    req.setTimeout(env.REQUEST_TIMEOUT_MS);
    res.setTimeout(env.REQUEST_TIMEOUT_MS);
    next();
  });

  app.use(
    '/api',
    createRouter({
      health,
      authService,
      tokens,
      cookie: { secure: env.NODE_ENV === 'production', domain: env.COOKIE_DOMAIN },
    }),
  );
  app.use(notFoundHandler);
  app.use(createErrorHandler(logger, env.NODE_ENV === 'production'));
  return app;
}
