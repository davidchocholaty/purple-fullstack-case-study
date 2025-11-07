/**
 * Zod validation schemas for frontend
 * 
 * Provides runtime validation for user inputs
 * 
 * @remarks
 * API response validation is handled by TypeScript types since we trust our own backend.
 * If integrating with third-party APIs, consider adding response validation.
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

// Type exports for convenience
export type ConversionFormInput = z.infer<typeof conversionFormSchema>;

