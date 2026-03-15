import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { successResponse } from '../utils/response.util';
import { UnauthorizedError } from '../errors/AppError';

class AuthController {
  /**
   * POST /api/auth/register
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body as {
        name: string;
        email: string;
        password: string;
      };

      const result = await authService.register({ name, email, password });

      successResponse(
        res,
        {
          user: result.user,
          token: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        },
        'Account created successfully',
        201,
      );
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/auth/login
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body as { email: string; password: string };

      const result = await authService.login({ email, password });

      successResponse(res, {
        user: result.user,
        token: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      }, 'Logged in successfully');
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/auth/refresh
   * Body: { refreshToken: string }
   */
  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body as { refreshToken: string };
      const tokens = await authService.refreshTokens(refreshToken);

      successResponse(res, tokens, 'Tokens refreshed');
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/auth/logout  (requires authentication)
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError();

      await authService.logout(userId);
      successResponse(res, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/auth/me  (requires authentication)
   */
  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      successResponse(res, req.user, 'User profile');
    } catch (err) {
      next(err);
    }
  };
}

export default new AuthController();
