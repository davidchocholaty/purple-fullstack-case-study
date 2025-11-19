/**
 * Main tRPC app router
 * 
 * Combines all sub-routers into a single app router
 */

import { router } from "../trpc.js";
import { conversionRouter } from "./conversion.js";
import { statsRouter } from "./stats.js";
import { walletRouter } from "./wallet.js";

export const appRouter = router({
  conversion: conversionRouter,
  stats: statsRouter,
  wallet: walletRouter,
});

export type AppRouter = typeof appRouter;

