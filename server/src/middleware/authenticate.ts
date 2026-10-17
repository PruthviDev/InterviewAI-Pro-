import type { RequestHandler } from 'express';
import type { Role } from '../constants.js';
import { ForbiddenError, UnauthorizedError } from '../errors/index.js';
<<<<<<< HEAD
=======
import { ACCESS_COOKIE } from '../controllers/authController.js';
>>>>>>> 69790ac84eecb67513ed2092a1f6cb35277c2da6
import type { TokenService } from '../services/tokenService.js';
import '../types/express.js';

export const authenticate =
  (tokens: TokenService): RequestHandler =>
  async (req, _res, next) => {
    const header = req.headers.authorization;
<<<<<<< HEAD
    if (!header?.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Authentication required', 'MISSING_TOKEN'));
    }
    try {
      req.auth = await tokens.verifyAccessToken(header.slice(7));
=======
    const cookieToken: unknown = req.cookies?.[ACCESS_COOKIE];

    const raw = header?.startsWith('Bearer ')
      ? header.slice(7)
      : typeof cookieToken === 'string'
        ? cookieToken
        : null;

    if (!raw) {
      return next(new UnauthorizedError('Authentication required', 'MISSING_TOKEN'));
    }
    try {
      req.auth = await tokens.verifyAccessToken(raw);
>>>>>>> 69790ac84eecb67513ed2092a1f6cb35277c2da6
      next();
    } catch (err) {
      next(err);
    }
  };

export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.auth) return next(new UnauthorizedError());
    if (!roles.includes(req.auth.role)) return next(new ForbiddenError('Insufficient permissions'));
    next();
  };
