// Shared types for the application

export interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  updatedAt: string;
}

export interface ConversionRecord {
  id: number;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  timestamp: string;
}

export interface CurrencyPairStat {
  fromCurrency: string;
  toCurrency: string;
  conversion_count: number;
  avg_amount: number;
  first_conversion: string;
  last_conversion: string;
}

export interface CurrencyFrequency {
  currency: string;
  count: number;
}

export interface Statistics {
  totalConversions: number;
  mostUsedCurrency: { currency: string; usage_count: number } | null;
  recentConversions: ConversionRecord[];
  currencyPairStats: CurrencyPairStat[];
  targetCurrencyFrequency: CurrencyFrequency[];
}

export interface Wallet {
  [currency: string]: number;
}

export type AppMode = "basic" | "budget";

