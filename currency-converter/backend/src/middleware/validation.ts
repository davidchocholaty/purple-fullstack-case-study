/**
 * Zod validation middleware
 * 
 * Provides request validation middleware for Express routes
 */

import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ZodError } from "zod";

/**
 * Shared error handler for validation errors
 * 
 * @param error - The error object
 * @param res - Express response
 * @param next - Express next function
 */
function handleValidationError(error: unknown, res: Response, next: NextFunction): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: error.issues.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      })),
    });
    return; // Explicit return to prevent further execution
  }
  next(error);
}

/**
 * Creates middleware that validates request body against a Zod schema
 * 
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 * 
 * @example
 * ```typescript
 * const schema = z.object({ amount: z.number().positive() });
 * router.post("/convert", validateBody(schema), async (req, res) => {
 *   // req.body is validated and typed
 * });
 * ```
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      handleValidationError(error, res, next);
    }
  };
}

/**
 * Creates middleware that validates request query parameters against a Zod schema
 * 
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      handleValidationError(error, res, next);
    }
  };
}

/**
 * Creates middleware that validates request params against a Zod schema
 * 
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      handleValidationError(error, res, next);
    }
  };
}

