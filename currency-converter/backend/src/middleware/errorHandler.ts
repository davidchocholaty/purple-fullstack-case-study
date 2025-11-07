/**
 * Error handling utilities
 * 
 * Provides middleware for consistent error handling across all routes
 */

import type { Request, Response, NextFunction } from "express";

export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

/**
 * Wraps async route handlers to automatically catch and forward errors
 * 
 * @param fn - Async route handler function
 * @returns Express middleware function
 * 
 * @remarks
 * Eliminates the need for try-catch blocks in every route handler.
 * Caught errors are passed to the global error handler.
 * 
 * @example
 * ```typescript
 * router.get("/example", asyncHandler(async (req, res) => {
 *   // Any thrown error is automatically caught
 *   const data = await someAsyncOperation();
 *   res.json(data);
 * }));
 * ```
 */
export function asyncHandler(fn: AsyncRequestHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global error handler middleware
 * 
 * @param error - The error object
 * @param _req - Express request (unused)
 * @param res - Express response
 * @param _next - Express next function (unused)
 * 
 * @remarks
 * - Returns appropriate HTTP status code
 * - In development: includes stack trace
 * - In production: only returns error message
 * - Logs all errors to console
 */
export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Error:", error);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    error: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
}

