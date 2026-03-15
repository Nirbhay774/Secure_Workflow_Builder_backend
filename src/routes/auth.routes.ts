import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
} from '../validators/auth.validator';

const router = Router();

// ── Public routes ──────────────────────────────────────────
router.post('/register', registerValidation, validate, authController.register);
router.post('/login',    loginValidation,    validate, authController.login);
router.post('/refresh',  refreshTokenValidation, validate, authController.refresh);

// ── Protected routes ───────────────────────────────────────
router.post('/logout', authenticate, authController.logout);
router.get('/me',      authenticate, authController.me);

export default router;
