import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Creates Express middleware that validates request body against a Zod schema.
 * On success, replaces req.body with the parsed (and potentially transformed) value.
 * On failure, responds with 400 and structured validation errors.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = formatZodError(result.error);
      res.status(400).json({ error: 'Validation failed', details: errors });
      return;
    }
    req.body = result.data;
    next();
  };
}

/**
 * Creates Express middleware that validates request query params against a Zod schema.
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = formatZodError(result.error);
      res.status(400).json({ error: 'Validation failed', details: errors });
      return;
    }
    // Attach parsed query as a typed property
    (req as unknown as Record<string, unknown>).validatedQuery = result.data;
    next();
  };
}

function formatZodError(error: ZodError): Array<{ path: string; message: string }> {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}
