/**
 * Wallet routes
 */

import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { dbOperations } from "../server/db/database.js";
import { SUPPORTED_CURRENCIES, isSupportedCurrency } from "../config/currencies.js";

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
  asyncHandler(async (req, res) => {
    const { wallet } = req.body;
    
    if (!wallet || typeof wallet !== "object" || Array.isArray(wallet)) {
      res.status(400);
      throw new Error("Invalid wallet data");
    }

    for (const [currency, balance] of Object.entries(wallet)) {
      // Validate currency is supported
      if (!isSupportedCurrency(currency)) {
        res.status(400);
        throw new Error(`Unsupported currency: ${currency}. Supported currencies: ${SUPPORTED_CURRENCIES.join(", ")}`);
      }
      
      // Validate balance is a valid number
      if (typeof balance !== "number" || balance < 0) {
        res.status(400);
        throw new Error(`Invalid balance value for currency ${currency}`);
      }

      dbOperations.updateWalletBalance(currency, balance as number);
    }

    res.json({ success: true });
  })
);

export default router;

