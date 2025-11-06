// src/server/routers/exchange.ts
import { publicProcedure, router } from "../trpc.js";
import { z } from "zod";
import axios from "axios";
import { dbOperations } from "../db/database.js";

const OXR_BASE_URL = "https://openexchangerates.org/api";
const OXR_APP_ID = process.env.OXR_APP_ID!;

const exchangeInputSchema = z.object({
  from: z.string().length(3),
  to: z.string().length(3),
});

const convertInputSchema = z.object({
  from: z.string().length(3),
  to: z.string().length(3),
  amount: z.number().positive(),
});

export const exchangeRouter = router({
  getConversionRate: publicProcedure
    .input(exchangeInputSchema)
    .query(async ({ input }: { input: z.infer<typeof exchangeInputSchema> }) => {
      const { from, to } = input;

      const response = await axios.get(`${OXR_BASE_URL}/latest.json`, {
        params: { app_id: OXR_APP_ID },
      });

      const rates = response.data.rates;
      if (!rates[from] || !rates[to]) {
        throw new Error(`Invalid currency codes: ${from} or ${to}`);
      }

      const conversionRate = rates[to] / rates[from];

      return {
        from,
        to,
        rate: conversionRate,
        updatedAt: new Date(response.data.timestamp * 1000),
      };
    }),

  convertCurrency: publicProcedure
    .input(convertInputSchema)
    .query(async ({ input }: { input: z.infer<typeof convertInputSchema> }) => {
      const { from, to, amount } = input;

      const response = await axios.get(`${OXR_BASE_URL}/latest.json`, {
        params: { app_id: OXR_APP_ID },
      });

      const rates = response.data.rates;
      if (!rates[from] || !rates[to]) {
        throw new Error(`Invalid currency codes: ${from} or ${to}`);
      }

      const conversionRate = rates[to] / rates[from];
      const convertedAmount = amount * conversionRate;

      // Save conversion to database
      dbOperations.insertConversion({
        fromCurrency: from,
        toCurrency: to,
        amount,
        convertedAmount,
        rate: conversionRate,
      });

      return {
        from,
        to,
        amount,
        convertedAmount,
        rate: conversionRate,
        updatedAt: new Date(response.data.timestamp * 1000),
      };
    }),

  getStatistics: publicProcedure
    .query(() => {
      return dbOperations.getStatistics();
    }),

  getConversionCount: publicProcedure
    .query(() => {
      return { count: dbOperations.getConversionCount() };
    }),
});
