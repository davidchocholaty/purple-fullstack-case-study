/**
 * Zod validation schemas for backend API
 * 
 * Provides type-safe request validation for all endpoints
 */

import { z } from "zod";
import { SUPPORTED_CURRENCIES, isSupportedCurrency } from "../config/currencies.js";

/**
 * Currency code validator
 */
const currencyCodeSchema = z
  .string()
  .length(3, "Currency code must be 3 letters")
  .refine(isSupportedCurrency, {
    message: `Currency must be one of: ${SUPPORTED_CURRENCIES.join(", ")}`,
  });

/**
 * POST /api/convert request body schema
 */
export const convertRequestSchema = z.object({
  from: currencyCodeSchema,
  to: currencyCodeSchema,
  amount: z.number().positive("Amount must be greater than 0"),
});

/**
 * POST /api/wallet/update request body schema
 */
export const updateWalletRequestSchema = z.object({
  wallet: z.record(
    z.string().refine(isSupportedCurrency, "Unsupported currency"),
    z.number().nonnegative("Balance cannot be negative")
  ),
});

// Type exports
export type ConvertRequest = z.infer<typeof convertRequestSchema>;
export type UpdateWalletRequest = z.infer<typeof updateWalletRequestSchema>;

