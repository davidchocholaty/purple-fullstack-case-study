/**
 * tRPC client setup
 * 
 * Creates and exports the tRPC client and React hooks
 */

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/types/backend.js";

export const trpc = createTRPCReact<AppRouter>();

