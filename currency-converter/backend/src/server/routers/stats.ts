/**
 * Statistics router
 * 
 * Provides conversion statistics and analytics
 */

import { router, publicProcedure } from "../trpc.js";
import { dbOperations } from "../../server/db/database.js";

export const statsRouter = router({
  /**
   * Get comprehensive conversion statistics
   */
  getStats: publicProcedure.query(() => {
    return dbOperations.getStatistics();
  }),
});

