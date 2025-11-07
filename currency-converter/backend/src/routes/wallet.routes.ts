/**
 * Wallet routes
 */

import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { validateBody } from "../middleware/validation.js";
import { dbOperations } from "../server/db/database.js";
import { SUPPORTED_CURRENCIES } from "../config/currencies.js";
import { updateWalletRequestSchema } from "../validation/schemas.js";

const router = Router();

router.get(
  "/wallet",
  asyncHandler(async (_req, res) => {
    const wallet = dbOperations.getWallet();
    res.json({ wallet, initialized: dbOperations.isWalletInitialized() });
  })
);

router.post(
  "/wallet/initialize",
  asyncHandler(async (_req, res) => {
    dbOperations.initializeWallet([...SUPPORTED_CURRENCIES]);
    const wallet = dbOperations.getWallet();
    res.json({ wallet });
  })
);

router.post(
  "/wallet/reset",
  asyncHandler(async (_req, res) => {
    dbOperations.resetWallet([...SUPPORTED_CURRENCIES]);
    const wallet = dbOperations.getWallet();
    res.json({ wallet });
  })
);

router.post(
  "/wallet/update",
  validateBody(updateWalletRequestSchema),
  asyncHandler(async (req, res) => {
    const { wallet } = req.body;

    // Update wallet balances (validation already done by middleware)
    Object.entries(wallet).forEach(([currency, balance]) => {
      dbOperations.updateWalletBalance(currency, balance as number);
    });

    res.json({ success: true });
  })
);

export default router;

