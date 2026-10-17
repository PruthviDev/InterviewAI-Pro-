import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { loadEnv } from '../src/config/env.js';
import { buildTestApp } from './helpers.js';

const up = async () => {};
const down = async () => {
  throw new Error('down');
};

describe('GET /api/health', () => {
  it('returns 200 when dependencies are up', async () => {
    const { app } = buildTestApp({ database: up, redis: up });
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: { status: 'ok', checks: { database: 'up', redis: 'up' } },
    });
    expect(res.headers['x-request-id']).toBeTruthy();
  });

  it('returns 503 when a dependency is down', async () => {
    const { app } = buildTestApp({ database: up, redis: down });
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(503);
    expect(res.body.data.checks.redis).toBe('down');
  });

  it('returns the standard error shape for unknown routes', async () => {
    const { app } = buildTestApp();
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
  });
});

describe('loadEnv', () => {
  it('rejects a short JWT secret', () => {
    expect(() => loadEnv({ DATABASE_URL: 'x', REDIS_URL: 'x', JWT_SECRET: 'short' })).toThrow(
      /JWT_SECRET/,
    );
  });
});
