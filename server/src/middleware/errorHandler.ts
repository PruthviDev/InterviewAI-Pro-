import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import type { Logger } from 'pino';
import { AppError, NotFoundError } from '../errors/index.js';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.path} not found`, 'ROUTE_NOT_FOUND'));
};

export function createErrorHandler(logger: Logger, isProduction: boolean): ErrorRequestHandler {
  return (err, req, res, _next) => {
    if (err instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request', details: err.flatten() },
      });
      return;
    }
    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        success: false,
        error: { code: err.code, message: err.message, details: err.details },
      });
      return;
    }
    logger.error({ err, requestId: req.id }, 'unhandled error');
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong',
        ...(isProduction ? {} : { details: err instanceof Error ? err.message : String(err) }),
      },
    });
  };
}
