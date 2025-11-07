/**
 * Currency conversion routes
 */

import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { ExchangeRateService } from "../services/exchangeRateService.js";
import { dbOperations } from "../server/db/database.js";
import { isSupportedCurrency, SUPPORTED_CURRENCIES } from "../config/currencies.js";

const router = Router();

router.post(
  "/convert",
  asyncHandler(async (req, res) => {
    const { from, to, amount } = req.body;

    if (!from || !to || !amount) {
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

router.get(
  "/currencies",
  asyncHandler(async (_req, res) => {
    res.json({ currencies: SUPPORTED_CURRENCIES });
  })
);

export default router;

