/**
 * Stub type declarations for backend modules with external dependencies
 * 
 * These stubs prevent TypeScript from trying to resolve backend modules
 * that have dependencies not available in the frontend workspace.
 * TypeScript will use these stubs instead of following the actual imports.
 */

// Stub for better-sqlite3 - prevents TypeScript from checking database.ts
declare module "../../../backend/src/server/db/database.js" {
  export const dbOperations: {
    insertConversion: (data: unknown) => void;
    getStatistics: () => unknown;
    getWallet: () => Record<string, number>;
    isWalletInitialized: () => boolean;
    initializeWallet: (currencies: string[]) => void;
    resetWallet: (currencies: string[]) => void;
    updateWalletBalance: (currency: string, balance: number) => void;
  };
}

// Stub for axios - prevents TypeScript from checking exchangeRateService.ts
declare module "../../../backend/src/services/exchangeRateService.js" {
  export class ExchangeRateService {
    static convert(from: string, to: string, amount: number): Promise<{
      convertedAmount: number;
      rate: number;
      updatedAt: string;
    }>;
  }
}

