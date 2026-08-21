import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { ZodError } from "zod";
import { attachUser } from "./middleware/requireUser";
import { authRouter } from "./routes/auth";
import { modulesRouter } from "./routes/modules";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(attachUser);
  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok", service: "recall-api", timestamp: new Date().toISOString() });
  });
  app.use("/api/auth", authRouter);
  app.use("/api/modules", modulesRouter);
  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    if (error instanceof ZodError) return response.status(400).json({ error: error.issues[0]?.message ?? "Invalid request." });
    console.error(error);
    return response.status(500).json({ error: "Something went wrong. Please try again." });
  });
  return app;
}
