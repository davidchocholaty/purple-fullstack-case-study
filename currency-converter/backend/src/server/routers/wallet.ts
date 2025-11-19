/**
 * Wallet router
 * 
 * Manages user virtual wallet for Budget Mode feature
 */

import { z } from "zod";
import { router, publicProcedure } from "../trpc.js";
import { dbOperations } from "../../server/db/database.js";
import { SUPPORTED_CURRENCIES } from "../../config/currencies.js";
import { updateWalletRequestSchema } from "../../validation/schemas.js";

export const walletRouter = router({
  /**
   * Get wallet balances and initialization status
   */
  getWallet: publicProcedure.query(() => {
    return {
      wallet: dbOperations.getWallet(),
      initialized: dbOperations.isWalletInitialized(),
    };
  }),

  /**
   * Initialize wallet with random balances
   */
  initialize: publicProcedure.mutation(() => {
    dbOperations.initializeWallet([...SUPPORTED_CURRENCIES]);
    return { wallet: dbOperations.getWallet() };
  }),

  /**
   * Reset wallet with new random balances
   */
  reset: publicProcedure.mutation(() => {
    dbOperations.resetWallet([...SUPPORTED_CURRENCIES]);
    return { wallet: dbOperations.getWallet() };
  }),

  /**
   * Update wallet balances
   */
  update: publicProcedure
    .input(updateWalletRequestSchema)
    .mutation(({ input }) => {
      const { wallet } = input;

      // Update wallet balances
      Object.entries(wallet).forEach(([currency, balance]) => {
        dbOperations.updateWalletBalance(currency, balance as number);
      });

      return { success: true };
    }),
});

