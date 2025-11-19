/**
 * Type declarations for backend tRPC router
 * 
 * This file provides type-only declarations to prevent TypeScript from
 * following imports into backend implementation files that have dependencies
 * not available in the frontend workspace.
 * 
 * NOTE: This file imports from _app.types.ts which imports from _app.ts.
 * The exclude pattern in tsconfig.json should prevent TypeScript from
 * type-checking the implementation files, but it may still resolve them
 * to extract type information.
 */

// Import the type from backend - TypeScript will extract only the type
// The exclude pattern in tsconfig.json should prevent checking implementation
// @ts-expect-error - Backend dependencies not available in frontend, but we only need the type
import type { AppRouter } from "../../../backend/src/server/routers/_app.types.js";

// Re-export for use in frontend
export type { AppRouter };

