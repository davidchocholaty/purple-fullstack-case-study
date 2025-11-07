/**
 * Zod validation schemas for frontend
 * 
 * Provides runtime validation for user inputs and API responses
 */

import { z } from "zod";

/**
 * Conversion form validation schema
 */
export const conversionFormSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)), "Amount must be a valid number")
    .refine((val) => parseFloat(val) > 0, "Amount must be greater than 0"),
  fromCurrency: z
    .string()
    .length(3, "Currency code must be 3 letters")
    .regex(/^[A-Z]{3}$/, "Currency code must be uppercase letters"),
  toCurrency: z
    .string()
    .length(3, "Currency code must be 3 letters")
    .regex(/^[A-Z]{3}$/, "Currency code must be uppercase letters"),
});

/**
 * Wallet validation schema
 */
export const walletSchema = z.record(
  z.string().length(3),
  z.number().nonnegative("Balance cannot be negative")
);

/**
 * API response validation schemas
 */
export const conversionResultSchema = z.object({
  from: z.string(),
  to: z.string(),
  amount: z.number(),
  convertedAmount: z.number(),
  rate: z.number(),
  updatedAt: z.string(),
});

export const currenciesResponseSchema = z.object({
  currencies: z.array(z.string()),
});

export const statisticsResponseSchema = z.object({
  totalConversions: z.number(),
  mostUsedCurrency: z
    .object({
      currency: z.string(),
      usage_count: z.number(),
    })
    .nullable(),
  recentConversions: z.array(
    z.object({
      id: z.number(),
      fromCurrency: z.string(),
      toCurrency: z.string(),
      amount: z.number(),
      convertedAmount: z.number(),
      rate: z.number(),
      timestamp: z.string(),
    })
  ),
  currencyPairStats: z.array(
    z.object({
      fromCurrency: z.string(),
      toCurrency: z.string(),
      conversion_count: z.number(),
      avg_amount: z.number(),
      first_conversion: z.string(),
      last_conversion: z.string(),
    })
  ),
  targetCurrencyFrequency: z.array(
    z.object({
      currency: z.string(),
      count: z.number(),
    })
  ),
});

export const walletResponseSchema = z.object({
  wallet: walletSchema,
  initialized: z.boolean(),
});

// Type exports for convenience
export type ConversionFormInput = z.infer<typeof conversionFormSchema>;
export type WalletData = z.infer<typeof walletSchema>;

