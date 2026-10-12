import { Router } from 'express';
import { loginSchema, registerSchema } from '../validation/index.js';
import type { createAuthController } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateBody } from '../middleware/validate.js';
import type { TokenService } from '../services/tokenService.js';

export function createAuthRoutes(
  controller: ReturnType<typeof createAuthController>,
  tokens: TokenService,
): Router {
  const router = Router();
  router.post('/register', validateBody(registerSchema), controller.register);
  router.post('/login', validateBody(loginSchema), controller.login);
  router.post('/refresh', controller.refresh);
  router.post('/logout', controller.logout);
  router.get('/me', authenticate(tokens), controller.me);
  return router;
}
