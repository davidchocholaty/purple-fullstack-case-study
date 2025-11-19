/**
 * Currency Converter Backend Server
 */

import "dotenv/config";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import { config } from "./config/index.js";
import { appRouter } from "./server/routers/_app.js";
import { createContext } from "./server/trpc.js";

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  // Handle CORS
  const origin = req.headers.origin;
  if (origin === config.corsOrigin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check endpoint
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Currency Converter API",
        version: "1.0.0",
        status: "running",
      })
    );
    return;
  }

  // tRPC endpoint
  if (req.url?.startsWith("/trpc")) {
    // Extract path from URL (remove /trpc prefix and query string)
    const urlPath = req.url.split("?")[0]; // Remove query string
    let path = urlPath.replace(/^\/trpc\/?/, ""); // Remove /trpc prefix
    
    // Debug logging
    // console.log(`[tRPC] ${req.method} ${req.url} -> path: "${path}"`);
    
    nodeHTTPRequestHandler({
      router: appRouter,
      createContext,
      req,
      res,
      path,
    });
    return;
  }

  // 404 for other routes
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

// Start server
server.listen(config.port, () => {
  console.log(`- Server running on http://localhost:${config.port}`);
  console.log(`- CORS enabled for: ${config.corsOrigin}`);
  console.log(`- tRPC endpoint: http://localhost:${config.port}/trpc`);
});
