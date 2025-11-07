import "dotenv/config";
import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./server/routers/_app.js";
import { createContext } from "./server/context.js";
import { dbOperations } from "./server/db/database.js";

const app = express();

// Enable CORS for frontend
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );

app.post("/api/convert", async (req, res) => {
  try {
    const { from, to, amount } = req.body;

    if (!from || !to || !amount) {
      return res.status(400).json({
        error: "Missing required parameters: from, to, amount"
      });
    }

    const amountNum = typeof amount === 'number' ? amount : parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        error: "Amount must be a positive number"
      });
    }

    const caller = appRouter.createCaller(createContext());
    const result = await caller.exchange.convertCurrency({
      from: from as string,
      to: to as string,
      amount: amountNum
    });

    res.json(result);
  } catch (error) {
    console.error("Conversion error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to convert currency"
    });
  }
});

app.get("/api/currencies", async (_req, res) => {
  try {
    // Define supported currencies - could also come from database or config
    const currencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY"];
    res.json({ currencies });
  } catch (error) {
    console.error("Error fetching currencies:", error);
    res.status(500).json({ error: "Failed to fetch currencies" });
  }
});

app.get("/api/stats/count", async (_req, res) => {
  try {
    const count = dbOperations.getConversionCount();
    res.json({ count });
  } catch (error) {
    console.error("Error fetching count:", error);
    res.status(500).json({ error: "Failed to fetch conversion count" });
  }
});

app.get("/api/stats", async (_req, res) => {
  try {
    const stats = dbOperations.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

app.get("/api/wallet", async (_req, res) => {
  try {
    const wallet = dbOperations.getWallet();
    res.json({ wallet, initialized: dbOperations.isWalletInitialized() });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({ error: "Failed to fetch wallet" });
  }
});

app.post("/api/wallet/initialize", async (req, res) => {
  try {
    const { currencies } = req.body;
    if (!currencies || !Array.isArray(currencies)) {
      return res.status(400).json({ error: "Invalid currencies array" });
    }
    dbOperations.initializeWallet(currencies);
    const wallet = dbOperations.getWallet();
    res.json({ wallet });
  } catch (error) {
    console.error("Error initializing wallet:", error);
    res.status(500).json({ error: "Failed to initialize wallet" });
  }
});

app.post("/api/wallet/reset", async (req, res) => {
  try {
    const { currencies } = req.body;
    if (!currencies || !Array.isArray(currencies)) {
      return res.status(400).json({ error: "Invalid currencies array" });
    }
    dbOperations.resetWallet(currencies);
    const wallet = dbOperations.getWallet();
    res.json({ wallet });
  } catch (error) {
    console.error("Error resetting wallet:", error);
    res.status(500).json({ error: "Failed to reset wallet" });
  }
});

app.post("/api/wallet/update", async (req, res) => {
  try {
    const { wallet } = req.body;
    if (!wallet || typeof wallet !== "object") {
      return res.status(400).json({ error: "Invalid wallet data" });
    }

    for (const [currency, balance] of Object.entries(wallet)) {
      if (typeof balance !== "number" || balance < 0) {
        return res.status(400).json({ error: `Invalid balance value for currency ${currency}` });
      }
    }
    
    Object.entries(wallet).forEach(([currency, balance]) => {
      dbOperations.updateWalletBalance(currency, balance as number);
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating wallet:", error);
    res.status(500).json({ error: "Failed to update wallet" });
  }
});

app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});

app.get("/", (_req, res) => {
  res.send("Backend is running!");
});
