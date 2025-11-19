# Backend Architecture

This document describes the architecture of the Currency Converter backend.

## Overview

The backend is built with **native tRPC** using Node.js's built-in HTTP module. No Express.js or other HTTP framework is used.

## Project Structure

```
src/
├── config/                 # Configuration
│   ├── index.ts           # App config (ports, URLs, etc.)
│   └── currencies.ts      # Supported currencies
├── server/
│   ├── routers/           # tRPC routers
│   │   ├── _app.ts        # Main app router (combines all routers)
│   │   ├── conversion.ts  # Currency conversion procedures
│   │   ├── stats.ts       # Statistics procedures
│   │   └── wallet.ts      # Wallet procedures
│   ├── trpc.ts            # tRPC initialization and context
│   └── db/                # Database
│       ├── database.ts    # SQLite operations
│       └── schema.ts      # Database schema
├── services/              # Business logic
│   └── exchangeRateService.ts # Exchange rate API + caching
├── validation/            # Zod validation schemas
│   └── schemas.ts         # Request validation schemas
└── index.ts               # Main server entry point (HTTP server)
```

## Architecture Principles

### 1. **Separation of Concerns**

- **Routers**: tRPC procedures (type-safe API endpoints)
- **Services**: Business logic and external API calls
- **Database**: Data persistence and queries
- **Validation**: Zod schemas for input validation
- **Config**: Centralized configuration

### 2. **Modular tRPC Routers**

Each feature has its own tRPC router:
- `conversion.ts` - Currency conversion procedures
- `stats.ts` - Statistics procedures
- `wallet.ts` - Wallet procedures

All routers are combined in `_app.ts` to create the main app router.

### 3. **Exchange Rate Caching**

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

## Adding a New Procedure

1. Create/update router file in `server/routers/`
2. Define Zod input schema in `validation/schemas.ts`
3. Use `publicProcedure.input(schema)` for validation
4. Implement business logic in `services/` if complex
5. Export router and add to `_app.ts`

Example:
```typescript
// server/routers/example.ts
import { z } from "zod";
import { router, publicProcedure } from "../trpc.js";

export const exampleRouter = router({
  getExample: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return { message: `Hello ${input.name}` };
    }),
});

// server/routers/_app.ts
import { exampleRouter } from "./example.js";

export const appRouter = router({
  // ... other routers
  example: exampleRouter,
});
```

## Future Improvements

- Rate limiting per IP
- Request logging
- Health check endpoint
- Graceful shutdown
- Connection pooling (if switching to Postgres)
- API versioning (e.g., /api/v1)
- OpenAPI/Swagger documentation
