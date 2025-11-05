import { initTRPC } from "@trpc/server";
import type { Context } from "./context.js";

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  health: t.procedure.query(() => ({ status: "ok", time: new Date().toISOString() })),
  ping: t.procedure.query(() => "pong")
});

export type AppRouter = typeof appRouter;
export { t };