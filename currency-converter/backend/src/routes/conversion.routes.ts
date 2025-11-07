/**
 * Currency conversion routes
 * 
 * Handles currency conversion and retrieval of supported currencies
 * Uses cached exchange rates from OpenExchangeRates API
 */

import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { ExchangeRateService } from "../services/exchangeRateService.js";
import { dbOperations } from "../server/db/database.js";
import { isSupportedCurrency, SUPPORTED_CURRENCIES } from "../config/currencies.js";

const router = Router();

/**
 * POST /api/convert
 * Converts an amount from one currency to another
 * 
 * @body {string} from - Source currency code (3 letters)
 * @body {string} to - Target currency code (3 letters)
 * @body {number} amount - Amount to convert (positive number)
 * 
 * @returns {object} Conversion result with rate and converted amount
 * @throws {400} Missing or invalid parameters
 * @throws {500} API or server error
 */
router.post(
  "/convert",
  asyncHandler(async (req, res) => {
    const { from, to, amount } = req.body;

    if (!from || !to || !amount || typeof from !== "string" || typeof to !== "string") {
      res.status(400);
      throw new Error("Missing required parameters: from, to, amount");
    }

    if (!isSupportedCurrency(from) || !isSupportedCurrency(to)) {
      res.status(400);
      throw new Error(`Currency must be one of: ${SUPPORTED_CURRENCIES.join(", ")}`);
    }

    const amountNum = typeof amount === "number" ? amount : parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      res.status(400);
      throw new Error("Amount must be a positive number");
    }

    // Convert using cached exchange rates
    const result = await ExchangeRateService.convert(from, to, amountNum);

    // Save conversion to database
    dbOperations.insertConversion({
      fromCurrency: from,
      toCurrency: to,
      amount: amountNum,
      convertedAmount: result.convertedAmount,
      rate: result.rate,
    });

    res.json(result);
  })
);

/**
 * GET /api/currencies
 * Returns the list of all supported currencies
 * 
 * @returns {object} Object containing array of currency codes
 */
router.get(
  "/currencies",
  asyncHandler(async (_req, res) => {
    res.json({ currencies: SUPPORTED_CURRENCIES });
  })
);

export default router;

