/**
 * Application configuration
 * Centralized configuration from environment variables
 */

export const config = {
  // Server
  port: parseInt(process.env.PORT || "4000", 10),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",

  // OpenExchangeRates API
  oxrApiKey: process.env.OXR_APP_ID!,
  oxrBaseUrl: "https://openexchangerates.org/api",
  
  // Cache
  exchangeRateCacheDuration: 60 * 60 * 1000, // 1 hour

  // Database
  dbPath: "./data/conversions.db",
} as const;

// Validate required environment variables
if (!config.oxrApiKey) {
  throw new Error("Missing required environment variable: OXR_APP_ID");
}

