/**
 * Currency conversion routes
 */

import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { validateBody } from "../middleware/validation.js";
import { ExchangeRateService } from "../services/exchangeRateService.js";
import { dbOperations } from "../server/db/database.js";
import { SUPPORTED_CURRENCIES } from "../config/currencies.js";
import { convertRequestSchema } from "../validation/schemas.js";

const router = Router();

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

router.get(
  "/currencies",
  asyncHandler(async (_req, res) => {
    res.json({ currencies: SUPPORTED_CURRENCIES });
  })
);

export default router;

