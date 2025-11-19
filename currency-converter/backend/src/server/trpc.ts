/**
 * tRPC server setup
 * 
 * Initializes tRPC with context and procedures
 */

import { initTRPC } from "@trpc/server";

/**
 * tRPC context (empty for now, can be extended with auth, etc.)
 */
export interface Context {}

/**
 * Create tRPC context
 */
const createContext = (): Context => {
  return {};
};

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create();

/**
 * Base router and procedure exports
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export { createContext };

