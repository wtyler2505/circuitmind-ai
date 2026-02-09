import type { Request, Response, NextFunction } from 'express';

/**
 * Global error handler. Must be registered last in the middleware chain.
 * Catches both synchronous throws and errors passed via next(err).
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[ERROR] ${err.message}`, err.stack);

  const status = (err as unknown as Record<string, unknown>).status as number | undefined;
  res.status(status ?? 500).json({
    error: err.message || 'Internal server error',
  });
}
