import { Response } from 'express';

/**
 * Builds a standardised JSON success response.
 */
export const successResponse = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Builds a standardised JSON error response.
 */
export const errorResponse = (
  res: Response,
  message = 'An error occurred',
  statusCode = 500,
  errors?: unknown,
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};
