/**
 * Exchange Rate Service with caching
 * Reduces API calls to OpenExchangeRates by caching rates
 */

import axios from "axios";

const OXR_BASE_URL = "https://openexchangerates.org/api";
const OXR_APP_ID = process.env.OXR_APP_ID!;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

interface ExchangeRatesCache {
  rates: Record<string, number>;
  timestamp: number;
  expiresAt: number;
}

let cache: ExchangeRatesCache | null = null;
let pendingFetch: Promise<{ rates: Record<string, number>; timestamp: number }> | null = null;

export class ExchangeRateService {
  /**
   * Fetches exchange rates with caching and request deduplication
   * Prevents race conditions when multiple requests occur simultaneously
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
   * Converts amount from one currency to another
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
   * Clears the cache and any pending fetch (useful for testing or manual refresh)
   */
  static clearCache(): void {
    cache = null;
    pendingFetch = null;
    console.log("Exchange rate cache cleared");
  }
}

