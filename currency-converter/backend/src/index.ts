import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc/router.js";
import { createContext } from "./trpc/context.js";

const app = express();
app.use(express.json());

app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );

app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});

app.get("/", (_req, res) => {
  res.send("Backend is running!");
});
