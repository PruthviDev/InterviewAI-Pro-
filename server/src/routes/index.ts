import { Router } from 'express';
import { createAuthController, type CookieConfig } from '../controllers/authController.js';
import { healthController } from '../controllers/healthController.js';
import type { AuthService } from '../services/authService.js';
import type { HealthChecks } from '../services/healthService.js';
import type { TokenService } from '../services/tokenService.js';
import { createAuthRoutes } from './authRoutes.js';

export interface RouterDeps {
  health: HealthChecks;
  authService: AuthService;
  tokens: TokenService;
  cookie: CookieConfig;
}

export function createRouter(deps: RouterDeps): Router {
  const router = Router();
  router.get('/health', healthController(deps.health));
  router.use('/auth', createAuthRoutes(createAuthController(deps.authService, deps.cookie), deps.tokens));
  return router;
}
