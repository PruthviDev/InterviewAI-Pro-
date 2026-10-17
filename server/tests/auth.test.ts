import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createErrorHandler } from '../src/middleware/errorHandler.js';
import { authenticate, requireRole } from '../src/middleware/authenticate.js';
import { buildTestApp } from './helpers.js';

const creds = { name: 'Ada Lovelace', email: 'ada@example.com', password: 'Str0ngPassw0rd' };

function refreshCookie(res: request.Response): string {
  const header = res.headers['set-cookie'] as unknown as string[] | undefined;
  const cookie = header?.find((c) => c.startsWith('aip_refresh='));
  if (!cookie) throw new Error('no refresh cookie');
  return cookie.split(';')[0] as string;
}

describe('register', () => {
  it('creates a user, hashes the password and sets an httpOnly refresh cookie', async () => {
    const { app, users } = buildTestApp();
    const res = await request(app).post('/api/auth/register').send(creds);
    expect(res.status).toBe(201);
    expect(res.body.data.user).toMatchObject({ email: creds.email, role: 'USER' });
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.accessToken).toBeTruthy();
    expect(users.users[0]?.passwordHash).toMatch(/^\$argon2id\$/);
    const raw = (res.headers['set-cookie'] as unknown as string[]).join(';');
    expect(raw).toMatch(/HttpOnly/i);
    expect(raw).toMatch(/Path=\/api\/auth/);
  });

  it('rejects a duplicate email regardless of case', async () => {
    const { app } = buildTestApp();
    await request(app).post('/api/auth/register').send(creds);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...creds, email: 'ADA@Example.com' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('rejects a weak password with a validation error', async () => {
    const { app } = buildTestApp();
    const res = await request(app).post('/api/auth/register').send({ ...creds, password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('login', () => {
  it('logs in with correct credentials', async () => {
    const { app } = buildTestApp();
    await request(app).post('/api/auth/register').send(creds);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: creds.email, password: creds.password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
  });

  it('gives the same error for a wrong password and an unknown email', async () => {
    const { app } = buildTestApp();
    await request(app).post('/api/auth/register').send(creds);
    const wrong = await request(app)
      .post('/api/auth/login')
      .send({ email: creds.email, password: 'Wrong-Passw0rd' });
    const unknown = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Wrong-Passw0rd' });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.error).toEqual(unknown.body.error);
  });

  it('blocks a disabled account', async () => {
    const { app, users } = buildTestApp();
    await request(app).post('/api/auth/register').send(creds);
    users.users[0]!.isActive = false;
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: creds.email, password: creds.password });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('ACCOUNT_DISABLED');
  });
});

describe('GET /api/auth/me', () => {
  it('requires a token', async () => {
    const { app } = buildTestApp();
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('MISSING_TOKEN');
  });

  it('rejects a malformed token', async () => {
    const { app } = buildTestApp();
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer nope');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  it('returns the current user for a valid token', async () => {
    const { app } = buildTestApp();
    const reg = await request(app).post('/api/auth/register').send(creds);
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${reg.body.data.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(creds.email);
  });
});

describe('refresh token rotation', () => {
  it('issues a new token and a different cookie on refresh', async () => {
    const { app } = buildTestApp();
    const reg = await request(app).post('/api/auth/register').send(creds);
    const first = refreshCookie(reg);
    const res = await request(app).post('/api/auth/refresh').set('Cookie', first);
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(refreshCookie(res)).not.toBe(first);
  });

  it('revokes the whole family when a rotated token is reused', async () => {
    const { app } = buildTestApp();
    const reg = await request(app).post('/api/auth/register').send(creds);
    const first = refreshCookie(reg);
    const rotated = await request(app).post('/api/auth/refresh').set('Cookie', first);
    const second = refreshCookie(rotated);

    const replay = await request(app).post('/api/auth/refresh').set('Cookie', first);
    expect(replay.status).toBe(401);
    expect(replay.body.error.code).toBe('REFRESH_TOKEN_REUSED');

    const legit = await request(app).post('/api/auth/refresh').set('Cookie', second);
    expect(legit.status).toBe(401);
  });

  it('rejects a missing cookie', async () => {
    const { app } = buildTestApp();
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });

  it('logout invalidates the session', async () => {
    const { app } = buildTestApp();
    const reg = await request(app).post('/api/auth/register').send(creds);
    const cookie = refreshCookie(reg);
    const out = await request(app).post('/api/auth/logout').set('Cookie', cookie);
    expect(out.status).toBe(200);
    const after = await request(app).post('/api/auth/refresh').set('Cookie', cookie);
    expect(after.status).toBe(401);
  });
});

describe('role-based authorization', () => {
  it('allows ADMIN and forbids USER', async () => {
    const { tokens, logger } = buildTestApp();
    const app = express();
    app.get('/admin', authenticate(tokens), requireRole('ADMIN'), (_req, res) => {
      res.json({ ok: true });
    });
    app.use(createErrorHandler(logger, false));

    const userToken = await tokens.signAccessToken({ userId: crypto.randomUUID(), role: 'USER' });
    const adminToken = await tokens.signAccessToken({ userId: crypto.randomUUID(), role: 'ADMIN' });

    const forbidden = await request(app).get('/admin').set('Authorization', `Bearer ${userToken}`);
    expect(forbidden.status).toBe(403);
    const allowed = await request(app).get('/admin').set('Authorization', `Bearer ${adminToken}`);
    expect(allowed.status).toBe(200);
  });
});
