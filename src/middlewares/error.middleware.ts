import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { errorResponse } from '../utils/response.util';
import config from '../config/config';

/**
 * Global error handling middleware.
 * Must be registered LAST with 4 parameters so Express recognises it.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Known operational errors (thrown intentionally)
  if (err instanceof AppError) {
    errorResponse(res, err.message, err.statusCode);
    return;
  }

  // Mongoose duplicate key error
  if ((err as NodeJS.ErrnoException).name === 'MongoServerError' && (err as { code?: number }).code === 11000) {
    errorResponse(res, 'A record with that value already exists', 409);
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    errorResponse(res, err.message, 400);
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    errorResponse(res, 'Invalid token', 401);
    return;
  }
  if (err.name === 'TokenExpiredError') {
    errorResponse(res, 'Token has expired', 401);
    return;
  }

  // Unknown / programmer errors – log full error in dev only
  if (config.server.nodeEnv === 'development') {
    console.error('UNHANDLED ERROR:', err);
    errorResponse(res, err.message, 500);
    return;
  }

  // Production: hide internal details
  errorResponse(res, 'An unexpected error occurred', 500);
};

/**
 * 404 handler — must be placed after all routes.
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  errorResponse(res, 'Route not found', 404);
};
