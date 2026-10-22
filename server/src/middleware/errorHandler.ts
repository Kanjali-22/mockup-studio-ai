import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  // Log error without exposing sensitive data
  const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.path} - ${statusCode} ${code}: ${err.message}`;
  if (statusCode >= 500) {
    console.error(logMessage);
  } else {
    console.warn(logMessage);
  }

  // Never expose stack traces or internal details to client
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: err.message || 'An unexpected error occurred.',
    },
  });
}

export function createError(message: string, statusCode: number, code: string): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}
