/**
 * Application configuration
 * 
 * Centralized configuration loaded from environment variables
 * All config values should be accessed through this object
 * 
 * @remarks
 * - Validates required environment variables on startup
 * - Provides sensible defaults for optional variables
 * - Single source of truth for all configuration
 */

/**
 * Application configuration object
 * 
 * @property {number} port - Server port (default: 4000)
 * @property {string} corsOrigin - Allowed CORS origin (default: http://localhost:3000)
 * @property {string} oxrApiKey - OpenExchangeRates API key (required)
 * @property {string} oxrBaseUrl - OpenExchangeRates API base URL
 * @property {number} exchangeRateCacheDuration - Cache TTL in milliseconds (default: 1 hour)
 * @property {string} dbPath - SQLite database file path
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

