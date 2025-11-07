/**
 * Supported currencies configuration
 * 
 * Single source of truth for all available currencies in the application
 * 
 * @remarks
 * To add a new currency:
 * 1. Add currency code to SUPPORTED_CURRENCIES array
 * 2. No other changes needed - automatically available in all endpoints
 */

/**
 * List of supported currency codes
 * @constant
 */
export const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AUD",
  "CAD",
  "CHF",
  "CNY",
] as const;

/**
 * Type representing valid currency codes
 */
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

/**
 * Type guard to validate if a currency code is supported
 * 
 * @param currency - Currency code to validate
 * @returns True if currency is in SUPPORTED_CURRENCIES list
 * 
 * @example
 * ```typescript
 * if (isSupportedCurrency("USD")) {
 *   // TypeScript knows currency is SupportedCurrency
 * }
 * ```
 */
export function isSupportedCurrency(currency: string): currency is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency);
}

