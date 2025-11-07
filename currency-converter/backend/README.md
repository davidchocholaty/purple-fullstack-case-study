# Backend Architecture

This document describes the architecture of the Currency Converter backend.

## Overview

The backend is built with **Express.js**.

## Project Structure

```
src/
├── config/                 # Configuration
│   ├── index.ts           # App config (ports, URLs, etc.)
│   └── currencies.ts      # Supported currencies
├── middleware/            # Express middleware
│   ├── cors.ts           # CORS configuration
│   └── errorHandler.ts   # Error handling & async wrapper
├── routes/               # Route modules
│   ├── conversion.routes.ts  # Currency conversion
│   ├── stats.routes.ts       # Statistics
│   └── wallet.routes.ts      # Wallet management
├── services/             # Business logic
│   └── exchangeRateService.ts # Exchange rate API + caching
├── server/
│   └── db/              # Database
│       ├── database.ts  # SQLite operations
│       └── schema.ts    # Database schema
└── index.ts             # Main server entry point
```

## Architecture Principles

### 1. **Separation of Concerns**

- **Routes**: Handle HTTP requests/responses
- **Services**: Business logic and external API calls
- **Database**: Data persistence and queries
- **Middleware**: Cross-cutting concerns (CORS, errors)
- **Config**: Centralized configuration

### 2. **Modular Routes**

Each feature has its own route module:
- `conversion.routes.ts` - Currency conversions
- `stats.routes.ts` - Statistics
- `wallet.routes.ts` - Wallet operations

### 3. **Exchange Rate Caching** ⚡

The `ExchangeRateService` caches exchange rates for 1 hour:

```typescript
// First request - fetches from API
await ExchangeRateService.convert("USD", "EUR", 100);

// Subsequent requests within 1 hour - uses cache
await ExchangeRateService.convert("USD", "GBP", 50);
```

**Cache invalidation:**
- Automatic: After 1 hour
- Manual: `ExchangeRateService.clearCache()`

## Database

### Technology
- **SQLite** with `better-sqlite3`
- WAL mode for better concurrency
- Prepared statements for performance

### Tables
1. `conversions` - Conversion history
2. `wallet` - User wallet balances
3. `wallet_resets` - Wallet reset history

### Operations
All database operations in `server/db/database.ts`:
- Prepared statements initialized once
- Synchronous operations (SQLite is fast enough)
- Type-safe with TypeScript interfaces

## Environment Variables

Required:
- `OXR_APP_ID` - OpenExchangeRates API key

Optional:
- `PORT` - Server port (default: 4000)
- `CORS_ORIGIN` - CORS origin (default: http://localhost:3000)
- `NODE_ENV` - Environment (development/production)

## Adding a New Endpoint

1. Create/update route file in `routes/`
2. Use `asyncHandler` wrapper
3. Implement business logic in `services/` if complex
4. Update `API.md` documentation

Example:
```typescript
// routes/example.routes.ts
import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.get("/example", asyncHandler(async (req, res) => {
  // Your logic here
  res.json({ message: "Hello" });
}));

export default router;
```

## Future Improvements

- Rate limiting per IP
- Request logging
- Health check endpoint
- Graceful shutdown
- Connection pooling (if switching to Postgres)
- API versioning (e.g., /api/v1)
- OpenAPI/Swagger documentation
