import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { createTableSQL, createIndexSQL } from "./schema.js";
import type { ConversionRecord } from "./schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
const dbPath = path.join(__dirname, "../../../data/conversions.db");
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for better performance
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

// Initialize tables
db.exec(createTableSQL);
db.exec(createIndexSQL);

// Prepared statements
const insertConversionStmt = db.prepare(`
  INSERT INTO conversions (fromCurrency, toCurrency, amount, convertedAmount, rate)
  VALUES (?, ?, ?, ?, ?)
`);

const getConversionCountStmt = db.prepare(`
  SELECT COUNT(*) as count FROM conversions
`);

const getMostUsedCurrencyStmt = db.prepare(`
  SELECT 
    currency,
    COUNT(*) as usage_count
  FROM (
    SELECT fromCurrency as currency FROM conversions
    UNION ALL
    SELECT toCurrency as currency FROM conversions
  )
  GROUP BY currency
  ORDER BY usage_count DESC
  LIMIT 1
`);

const getRecentConversionsStmt = db.prepare(`
  SELECT * FROM conversions
  ORDER BY timestamp DESC
  LIMIT ?
`);

const getCurrencyPairStatsStmt = db.prepare(`
  SELECT 
    fromCurrency,
    toCurrency,
    COUNT(*) as conversion_count,
    AVG(amount) as avg_amount,
    MIN(timestamp) as first_conversion,
    MAX(timestamp) as last_conversion
  FROM conversions
  GROUP BY fromCurrency, toCurrency
  ORDER BY conversion_count DESC
`);

// Database operations
export const dbOperations = {
  // Insert a new conversion record
  insertConversion(data: Omit<ConversionRecord, "id" | "timestamp">) {
    return insertConversionStmt.run(
      data.fromCurrency,
      data.toCurrency,
      data.amount,
      data.convertedAmount,
      data.rate
    );
  },

  // Get total number of conversions
  getConversionCount(): number {
    const result = getConversionCountStmt.get() as { count: number };
    return result.count;
  },

  // Get the most frequently used currency
  getMostUsedCurrency(): { currency: string; usage_count: number } | null {
    return getMostUsedCurrencyStmt.get() as { currency: string; usage_count: number } | null;
  },

  // Get recent conversion history
  getRecentConversions(limit: number = 10): ConversionRecord[] {
    return getRecentConversionsStmt.all(limit) as ConversionRecord[];
  },

  // Get statistics by currency pairs
  getCurrencyPairStats() {
    return getCurrencyPairStatsStmt.all() as Array<{
      fromCurrency: string;
      toCurrency: string;
      conversion_count: number;
      avg_amount: number;
      first_conversion: string;
      last_conversion: string;
    }>;
  },

  // Get all statistics
  getStatistics() {
    const totalConversions = this.getConversionCount();
    const mostUsedCurrency = this.getMostUsedCurrency();
    const recentConversions = this.getRecentConversions(5);
    const currencyPairStats = this.getCurrencyPairStats();

    return {
      totalConversions,
      mostUsedCurrency,
      recentConversions,
      currencyPairStats,
    };
  },
};

// Graceful shutdown
process.on("exit", () => db.close());
process.on("SIGINT", () => {
  db.close();
  process.exit(0);
});

export default db;

