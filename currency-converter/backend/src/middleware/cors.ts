/**
 * CORS (Cross-Origin Resource Sharing) middleware
 * 
 * Configures CORS headers to allow frontend access from configured origin
 */

import type { Request, Response, NextFunction } from "express";
import { config } from "../config/index.js";

/**
 * Express middleware that adds CORS headers to responses
 * 
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 * 
 * @remarks
 * - Origin is configured via CORS_ORIGIN env variable (default: http://localhost:3000)
 * - Handles OPTIONS preflight requests
 * - Allows standard HTTP methods and headers
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  res.header("Access-Control-Allow-Origin", config.corsOrigin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  
  next();
}

