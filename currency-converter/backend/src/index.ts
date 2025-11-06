import "dotenv/config";
import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./server/routers/_app.js";
import { createContext } from "./server/context.js";

const app = express();
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

app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});

app.get("/", (_req, res) => {
  res.send("Backend is running!");
});
