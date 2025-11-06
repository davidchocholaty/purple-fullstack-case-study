import { router, publicProcedure } from "../trpc.js";
import { exchangeRouter } from "./exchange.js";

export const appRouter = router({
  health: publicProcedure.query(() => ({ status: "ok", time: new Date().toISOString() })),
  ping: publicProcedure.query(() => "pong"),
  exchange: exchangeRouter,
});

export type AppRouter = typeof appRouter;