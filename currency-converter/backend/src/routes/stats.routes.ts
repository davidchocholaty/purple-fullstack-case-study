/**
 * Statistics routes
 * 
 * Provides conversion statistics and analytics
 */

import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { dbOperations } from "../server/db/database.js";

const router = Router();

/**
 * GET /api/stats
 * Returns comprehensive conversion statistics
 * 
 * @returns {object} Statistics including total conversions, most used currency,
 *                   recent conversions, currency pair stats, and target currency frequency
 */
router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const stats = dbOperations.getStatistics();
    res.json(stats);
  })
);

export default router;

