import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/response.util';

/**
 * Reads the results of express-validator rules placed before this
 * middleware in the route chain. Returns a 422 if any rule fails.
 */
export const validate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, 'Validation failed', 422, errors.array());
    return;
  }
  next();
};
