import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/AppError';
import logger from '@/config/logger';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.statusCode,
        details: err.details,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token',
        code: 401,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        message: 'Token expired',
        code: 401,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    res.status(422).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 422,
        details: (err as { details?: unknown }).details,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Handle unknown errors (mask in production)
  const isProduction = process.env.NODE_ENV === 'production';
  const message = isProduction ? 'Internal server error' : err.message;
  const stack = isProduction ? undefined : err.stack;

  res.status(500).json({
    success: false,
    error: {
      message,
      code: 500,
      stack,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * 404 Not Found middleware
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      message: `Cannot ${req.method} ${req.path}`,
      code: 404,
      timestamp: new Date().toISOString(),
    },
  });
};