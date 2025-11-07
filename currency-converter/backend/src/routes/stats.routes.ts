/**
 * Statistics routes
 */

import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { dbOperations } from "../server/db/database.js";

const router = Router();

router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const stats = dbOperations.getStatistics();
    res.json(stats);
  })
);

export default router;

