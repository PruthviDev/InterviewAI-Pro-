import pino, { type Logger } from 'pino';
import type { Env } from '../config/env.js';

export function createLogger(env: Pick<Env, 'LOG_LEVEL' | 'NODE_ENV'>): Logger {
  return pino({
    level: env.LOG_LEVEL,
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'res.headers["set-cookie"]',
        'req.body.password',
        'req.body.refreshToken',
        '*.password',
        '*.passwordHash',
        '*.token',
        '*.accessToken',
        '*.refreshToken',
        '*.apiKey',
        '*.*.password',        // catches one more nesting level
        '*.*.accessToken',     // e.g. data.accessToken in logged responses
      ],
      censor: '[redacted]',
    },
    // pretty output only in development (npm i -D pino-pretty)
    ...(env.NODE_ENV === 'development'
      ? { transport: { target: 'pino-pretty' } }
      : {}),
  });
}