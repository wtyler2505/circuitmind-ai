import type { Request, Response, NextFunction } from 'express';

/**
 * Security headers middleware.
 *
 * Adds standard security headers to all responses:
 * - X-Content-Type-Options: prevents MIME-type sniffing
 * - X-Frame-Options: prevents clickjacking
 * - X-XSS-Protection: legacy XSS filter (still useful for older browsers)
 * - Referrer-Policy: limits referrer information leakage
 * - Permissions-Policy: restricts browser feature access
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(self), geolocation=(), payment=()'
  );
  next();
}
