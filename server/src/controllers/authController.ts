import type { CookieOptions, Request, RequestHandler, Response } from 'express';
import { UnauthorizedError } from '../errors/index.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import type { AuthResult, AuthService } from '../services/authService.js';

export const REFRESH_COOKIE = 'aip_refresh';
<<<<<<< HEAD
const COOKIE_PATH = '/api/auth';
=======
export const ACCESS_COOKIE = 'accessToken';
const REFRESH_PATH = '/api/auth';
const ACCESS_PATH = '/';
const ACCESS_TTL_MS = 15 * 60 * 1000; // 15 minutes
>>>>>>> 69790ac84eecb67513ed2092a1f6cb35277c2da6

export interface CookieConfig {
  secure: boolean;
  domain?: string;
}

export function createAuthController(auth: AuthService, cookie: CookieConfig) {
  const base = (): CookieOptions => ({
    httpOnly: true,
    sameSite: 'lax',
    secure: cookie.secure,
<<<<<<< HEAD
    path: COOKIE_PATH,
=======
>>>>>>> 69790ac84eecb67513ed2092a1f6cb35277c2da6
    ...(cookie.domain ? { domain: cookie.domain } : {}),
  });

  const respond = (res: Response, status: number, result: AuthResult): void => {
<<<<<<< HEAD
    res.cookie(REFRESH_COOKIE, result.refreshToken, { ...base(), expires: result.refreshExpiresAt });
=======
    res.cookie(REFRESH_COOKIE, result.refreshToken, {
      ...base(),
      path: REFRESH_PATH,
      expires: result.refreshExpiresAt,
    });
    res.cookie(ACCESS_COOKIE, result.accessToken, {
      ...base(),
      path: ACCESS_PATH,
      expires: new Date(Date.now() + ACCESS_TTL_MS),
    });
>>>>>>> 69790ac84eecb67513ed2092a1f6cb35277c2da6
    res.status(status).json({
      success: true,
      data: { user: result.user, accessToken: result.accessToken },
    });
  };

<<<<<<< HEAD
=======
  const clearAuth = (res: Response): void => {
    res.clearCookie(REFRESH_COOKIE, { ...base(), path: REFRESH_PATH });
    res.clearCookie(ACCESS_COOKIE, { ...base(), path: ACCESS_PATH });
  };

>>>>>>> 69790ac84eecb67513ed2092a1f6cb35277c2da6
  const refreshTokenFrom = (req: Request): string | undefined => {
    const value: unknown = req.cookies?.[REFRESH_COOKIE];
    return typeof value === 'string' ? value : undefined;
  };

  const register: RequestHandler = asyncHandler(async (req, res) => {
    respond(res, 201, await auth.register(req.body));
  });

  const login: RequestHandler = asyncHandler(async (req, res) => {
    respond(res, 200, await auth.login(req.body));
  });

  const refresh: RequestHandler = asyncHandler(async (req, res) => {
    try {
      respond(res, 200, await auth.refresh(refreshTokenFrom(req)));
    } catch (err) {
<<<<<<< HEAD
      res.clearCookie(REFRESH_COOKIE, base());
=======
      clearAuth(res);
>>>>>>> 69790ac84eecb67513ed2092a1f6cb35277c2da6
      throw err;
    }
  });

  const logout: RequestHandler = asyncHandler(async (req, res) => {
    await auth.logout(refreshTokenFrom(req));
<<<<<<< HEAD
    res.clearCookie(REFRESH_COOKIE, base());
=======
    clearAuth(res);
>>>>>>> 69790ac84eecb67513ed2092a1f6cb35277c2da6
    res.json({ success: true, data: { loggedOut: true } });
  });

  const me: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw new UnauthorizedError();
    res.json({ success: true, data: { user: await auth.me(req.auth.userId) } });
  });

  return { register, login, refresh, logout, me };
}
