// Database schema for conversion history
export interface ConversionRecord {
  id: number;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  timestamp: string;
}

export const createTableSQL = `
  CREATE TABLE IF NOT EXISTS conversions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fromCurrency TEXT NOT NULL,
    toCurrency TEXT NOT NULL,
    amount REAL NOT NULL,
    convertedAmount REAL NOT NULL,
    rate REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

export const createIndexSQL = `
  CREATE INDEX IF NOT EXISTS idx_currencies ON conversions(fromCurrency, toCurrency);
  CREATE INDEX IF NOT EXISTS idx_timestamp ON conversions(timestamp);
`;

