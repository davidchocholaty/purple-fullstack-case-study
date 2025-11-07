/**
 * Currency Converter Backend Server
 */

import "dotenv/config";
import express from "express";
import { config } from "./config/index.js";
import { corsMiddleware } from "./middleware/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import conversionRoutes from "./routes/conversion.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import walletRoutes from "./routes/wallet.routes.js";

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Routes
app.get("/", (_req, res) => {
  res.json({
    message: "Currency Converter API",
    version: "1.0.0",
    status: "running",
  });
});

app.use("/api", conversionRoutes);
app.use("/api", statsRoutes);
app.use("/api", walletRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`- Server running on http://localhost:${config.port}`);
  console.log(`- CORS enabled for: ${config.corsOrigin}`);
});
