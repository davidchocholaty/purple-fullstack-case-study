import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";
import { createTableSQL, createIndexSQL } from "./schema.js";
import type { ConversionRecord } from "./schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
const dbPath = path.join(__dirname, "../../../data/conversions.db");
const dbDir = path.dirname(dbPath);

// Create data directory if it doesn't exist
try {
  mkdirSync(dbDir, { recursive: true });
} catch {
  // Directory already exists or other error - SQLite will handle it
}

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

const getTargetCurrencyFrequencyStmt = db.prepare(`
  SELECT 
    toCurrency as currency,
    COUNT(*) as count
  FROM conversions
  GROUP BY toCurrency
  ORDER BY count DESC
`);

// Wallet statements
const getWalletStmt = db.prepare(`
  SELECT currency, balance FROM wallet
`);

const getWalletBalanceStmt = db.prepare(`
  SELECT balance FROM wallet WHERE currency = ?
`);

const upsertWalletBalanceStmt = db.prepare(`
  INSERT INTO wallet (currency, balance, updated_at)
  VALUES (?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(currency) DO UPDATE SET 
    balance = excluded.balance,
    updated_at = CURRENT_TIMESTAMP
`);

const deleteAllWalletStmt = db.prepare(`
  DELETE FROM wallet
`);

const insertWalletResetStmt = db.prepare(`
  INSERT INTO wallet_resets (reset_at) VALUES (CURRENT_TIMESTAMP)
`);

// Constants for wallet balance generation
const MIN_INITIAL_BALANCE = 1000;
const MAX_INITIAL_BALANCE = 10999;

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

  // Get target currency frequency
  getTargetCurrencyFrequency(): Array<{ currency: string; count: number }> {
    return getTargetCurrencyFrequencyStmt.all() as Array<{ currency: string; count: number }>;
  },

  // Wallet operations
  getWallet(): Record<string, number> {
    const rows = getWalletStmt.all() as Array<{ currency: string; balance: number }>;
    const wallet: Record<string, number> = {};
    rows.forEach((row) => {
      wallet[row.currency] = row.balance;
    });
    return wallet;
  },

  getWalletBalance(currency: string): number {
    const result = getWalletBalanceStmt.get(currency) as { balance: number } | undefined;
    return result?.balance ?? 0;
  },

  updateWalletBalance(currency: string, balance: number) {
    return upsertWalletBalanceStmt.run(currency, balance);
  },

  initializeWallet(currencies: string[]) {
    const generateRandomBalance = () => 
      Math.floor(Math.random() * (MAX_INITIAL_BALANCE - MIN_INITIAL_BALANCE + 1)) + MIN_INITIAL_BALANCE;
    currencies.forEach((currency) => {
      upsertWalletBalanceStmt.run(currency, generateRandomBalance());
    });
    insertWalletResetStmt.run();
  },

  resetWallet(currencies: string[]) {
    deleteAllWalletStmt.run();
    this.initializeWallet(currencies);
  },

  isWalletInitialized(): boolean {
    const wallet = this.getWallet();
    return Object.keys(wallet).length > 0;
  },

  // Get all statistics
  getStatistics() {
    const totalConversions = this.getConversionCount();
    const mostUsedCurrency = this.getMostUsedCurrency();
    const recentConversions = this.getRecentConversions(5);
    const currencyPairStats = this.getCurrencyPairStats();
    const targetCurrencyFrequency = this.getTargetCurrencyFrequency();

    return {
      totalConversions,
      mostUsedCurrency,
      recentConversions,
      currencyPairStats,
      targetCurrencyFrequency,
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

