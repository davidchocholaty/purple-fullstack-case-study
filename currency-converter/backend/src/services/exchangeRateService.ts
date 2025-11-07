/**
 * Exchange Rate Service with caching
 * Reduces API calls to OpenExchangeRates by caching rates
 */

import axios from "axios";
import { config } from "../config/index.js";

const OXR_BASE_URL = config.oxrBaseUrl;
const OXR_APP_ID = config.oxrApiKey;
const CACHE_DURATION_MS = config.exchangeRateCacheDuration;

interface ExchangeRatesCache {
  rates: Record<string, number>;
  timestamp: number;
  expiresAt: number;
}

let cache: ExchangeRatesCache | null = null;
let pendingFetch: Promise<{ rates: Record<string, number>; timestamp: number }> | null = null;

/**
 * Service for fetching and caching exchange rates from OpenExchangeRates API
 * 
 * Features:
 * - Automatic caching with configurable TTL (default: 1 hour)
 * - Request deduplication to prevent concurrent API calls
 * - Fallback to stale cache on API failure
 * 
 * @example
 * ```typescript
 * // Convert currency
 * const result = await ExchangeRateService.convert("USD", "EUR", 100);
 * console.log(result.convertedAmount); // 92.50
 * 
 * // Get raw rates
 * const { rates } = await ExchangeRateService.getRates();
 * console.log(rates.EUR); // 0.925
 * ```
 */
export class ExchangeRateService {
  /**
   * Fetches exchange rates with caching and request deduplication
   * 
   * @returns Promise containing exchange rates and timestamp
   * @throws Error if API fails and no cached data is available
   * 
   * @remarks
   * - Returns cached data if still valid (within TTL)
   * - Deduplicates concurrent requests (only one API call per cache expiry)
   * - Falls back to stale cache if API fails
   * - Cache expires after 1 hour (configurable via config)
   */
  static async getRates(): Promise<{ rates: Record<string, number>; timestamp: number }> {
    const now = Date.now();

    // Return cached rates if still valid
    if (cache && now < cache.expiresAt) {
      console.log("Using cached exchange rates");
      return {
        rates: cache.rates,
        timestamp: cache.timestamp,
      };
    }

    // If a fetch is already in progress, wait for it instead of making a new request
    if (pendingFetch) {
      console.log("Waiting for in-flight exchange rate fetch");
      return pendingFetch;
    }

    // Start a new fetch and store the promise to deduplicate concurrent requests
    pendingFetch = (async () => {
      try {
        console.log("Fetching fresh exchange rates from API");
        const response = await axios.get(`${OXR_BASE_URL}/latest.json`, {
          params: { app_id: OXR_APP_ID },
        });

        // Update cache
        cache = {
          rates: response.data.rates,
          timestamp: response.data.timestamp * 1000, // Convert to milliseconds
          expiresAt: Date.now() + CACHE_DURATION_MS,
        };

        return {
          rates: cache.rates,
          timestamp: cache.timestamp,
        };
      } catch (error) {
        console.error("Failed to fetch exchange rates from API:", error);
        
        // If we have stale cache, return it as fallback
        if (cache) {
          console.warn("Returning stale cached exchange rates due to API failure");
          return {
            rates: cache.rates,
            timestamp: cache.timestamp,
          };
        }
        
        throw new Error("Unable to fetch exchange rates and no cached data available.");
      } finally {
        // Clear the pending fetch so future requests can start a new fetch if needed
        pendingFetch = null;
      }
    })();

    return pendingFetch;
  }

  /**
   * Converts an amount from one currency to another using current exchange rates
   * 
   * @param from - Source currency code (e.g., "USD")
   * @param to - Target currency code (e.g., "EUR")
   * @param amount - Amount to convert (must be positive)
   * @returns Conversion result with rate and converted amount
   * @throws Error if currency codes are invalid or API fails
   * 
   * @example
   * ```typescript
   * const result = await ExchangeRateService.convert("USD", "EUR", 100);
   * // {
   * //   from: "USD",
   * //   to: "EUR",
   * //   amount: 100,
   * //   convertedAmount: 92.50,
   * //   rate: 0.925,
   * //   updatedAt: Date(...)
   * // }
   * ```
   */
  static async convert(from: string, to: string, amount: number) {
    const { rates, timestamp } = await this.getRates();

    if (!rates[from] || !rates[to]) {
      throw new Error(`Invalid currency codes: ${from} or ${to}`);
    }

    const conversionRate = rates[to] / rates[from];
    const convertedAmount = amount * conversionRate;

    return {
      from,
      to,
      amount,
      convertedAmount,
      rate: conversionRate,
      updatedAt: new Date(timestamp),
    };
  }

  /**
   * Clears the exchange rate cache and any pending fetch
   * 
   * @remarks
   * Useful for testing or forcing a fresh API call on the next request.
   * In production, cache expires automatically after the configured TTL.
   * 
   * @example
   * ```typescript
   * // Force fresh data on next request
   * ExchangeRateService.clearCache();
   * const rates = await ExchangeRateService.getRates(); // Fetches from API
   * ```
   */
  static clearCache(): void {
    cache = null;
    pendingFetch = null;
    console.log("Exchange rate cache cleared");
  }
}

