/**
 * tRPC client setup
 * 
 * Creates and exports the tRPC client and React hooks
 */

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../backend/src/server/routers/_app.types.js";

export const trpc = createTRPCReact<AppRouter>();

