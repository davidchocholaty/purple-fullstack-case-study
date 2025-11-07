/**
 * Currency conversion routes
 * 
 * Handles currency conversion and retrieval of supported currencies
 * Uses cached exchange rates from OpenExchangeRates API
 */

import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { validateBody } from "../middleware/validation.js";
import { ExchangeRateService } from "../services/exchangeRateService.js";
import { dbOperations } from "../server/db/database.js";
import { SUPPORTED_CURRENCIES } from "../config/currencies.js";
import { convertRequestSchema } from "../validation/schemas.js";

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
  validateBody(convertRequestSchema),
  asyncHandler(async (req, res) => {
    const { from, to, amount } = req.body;

    // Convert using cached exchange rates (validation already done by middleware)
    const result = await ExchangeRateService.convert(from, to, amount);

    // Save conversion to database
    dbOperations.insertConversion({
      fromCurrency: from,
      toCurrency: to,
      amount,
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

