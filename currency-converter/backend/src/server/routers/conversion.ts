/**
 * Conversion router
 * 
 * Handles currency conversion and retrieval of supported currencies
 */

import { router, publicProcedure } from "../trpc.js";
import { ExchangeRateService } from "../../services/exchangeRateService.js";
import { dbOperations } from "../../server/db/database.js";
import { SUPPORTED_CURRENCIES } from "../../config/currencies.js";
import { convertRequestSchema } from "../../validation/schemas.js";

export const conversionRouter = router({
  /**
   * Convert currency
   */
  convert: publicProcedure
    .input(convertRequestSchema)
    .mutation(async ({ input }) => {
      const { from, to, amount } = input;

      // Convert using cached exchange rates
      const result = await ExchangeRateService.convert(from, to, amount);

      // Save conversion to database
      dbOperations.insertConversion({
        fromCurrency: from,
        toCurrency: to,
        amount,
        convertedAmount: result.convertedAmount,
        rate: result.rate,
      });

      return result;
    }),

  /**
   * Get supported currencies
   */
  getCurrencies: publicProcedure.query(() => {
    return { currencies: SUPPORTED_CURRENCIES };
  }),
});

