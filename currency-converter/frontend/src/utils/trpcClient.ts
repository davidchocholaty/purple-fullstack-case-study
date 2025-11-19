/**
 * tRPC HTTP client
 * 
 * Creates the tRPC client instance for React Query
 */

import { httpBatchLink } from "@trpc/client";
import { trpc } from "./trpc";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${API_BASE_URL}/trpc`,
    }),
  ],
});

