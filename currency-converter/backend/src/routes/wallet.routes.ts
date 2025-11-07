/**
 * Wallet routes
 * 
 * Manages user virtual wallet for Budget Mode feature
 * Handles wallet initialization, reset, and balance updates
 */

import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { dbOperations } from "../server/db/database.js";
import { SUPPORTED_CURRENCIES, isSupportedCurrency } from "../config/currencies.js";

const router = Router();

/**
 * GET /api/wallet
 * Retrieves current wallet balances and initialization status
 * 
 * @returns {object} Wallet balances for all currencies and initialized flag
 */
router.get(
  "/wallet",
  asyncHandler(async (_req, res) => {
    const wallet = dbOperations.getWallet();
    res.json({ wallet, initialized: dbOperations.isWalletInitialized() });
  })
);

/**
 * POST /api/wallet/initialize
 * Initializes wallet with random balances for all supported currencies
 * 
 * @returns {object} Newly initialized wallet balances
 * @remarks Balances are randomly generated within configured min/max range
 */
router.post(
  "/wallet/initialize",
  asyncHandler(async (_req, res) => {
    dbOperations.initializeWallet([...SUPPORTED_CURRENCIES]);
    const wallet = dbOperations.getWallet();
    res.json({ wallet });
  })
);

/**
 * POST /api/wallet/reset
 * Resets wallet with new random balances for all supported currencies
 * 
 * @returns {object} New wallet balances after reset
 * @remarks Previous balances are discarded and regenerated
 */
router.post(
  "/wallet/reset",
  asyncHandler(async (_req, res) => {
    dbOperations.resetWallet([...SUPPORTED_CURRENCIES]);
    const wallet = dbOperations.getWallet();
    res.json({ wallet });
  })
);

/**
 * POST /api/wallet/update
 * Updates wallet balances (used after conversions in Budget Mode)
 * 
 * @body {object} wallet - Object mapping currency codes to new balances
 * @returns {object} Success status
 * @throws {400} Invalid wallet data or unsupported currency
 * 
 * @remarks
 * - Only supported currencies are accepted
 * - Balances must be non-negative numbers
 */
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

