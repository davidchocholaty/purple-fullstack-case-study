/**
 * CORS middleware
 */

import type { Request, Response, NextFunction } from "express";
import { config } from "../config/index.js";

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  res.header("Access-Control-Allow-Origin", config.corsOrigin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  
  next();
}

