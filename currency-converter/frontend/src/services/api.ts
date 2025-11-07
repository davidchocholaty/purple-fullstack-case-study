import type { ConversionResult, Statistics, Wallet } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // General endpoints
  async getCurrencies(): Promise<{ currencies: string[] }> {
    return fetchApi<{ currencies: string[] }>("/api/currencies");
  },

  // Conversion endpoints
  async convertCurrency(from: string, to: string, amount: number): Promise<ConversionResult> {
    return fetchApi<ConversionResult>("/api/convert", {
      method: "POST",
      body: JSON.stringify({ from, to, amount }),
    });
  },

  // Statistics endpoints
  async getStatistics(): Promise<Statistics> {
    return fetchApi<Statistics>("/api/stats");
  },

  // Wallet endpoints
  async getWallet(): Promise<{ wallet: Wallet; initialized: boolean }> {
    return fetchApi<{ wallet: Wallet; initialized: boolean }>("/api/wallet");
  },

  async initializeWallet(currencies: string[]): Promise<{ wallet: Wallet }> {
    return fetchApi<{ wallet: Wallet }>("/api/wallet/initialize", {
      method: "POST",
      body: JSON.stringify({ currencies }),
    });
  },

  async resetWallet(currencies: string[]): Promise<{ wallet: Wallet }> {
    return fetchApi<{ wallet: Wallet }>("/api/wallet/reset", {
      method: "POST",
      body: JSON.stringify({ currencies }),
    });
  },

  async updateWallet(wallet: Wallet): Promise<{ success: boolean }> {
    return fetchApi<{ success: boolean }>("/api/wallet/update", {
      method: "POST",
      body: JSON.stringify({ wallet }),
    });
  },
};

