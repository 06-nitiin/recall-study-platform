import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { ZodError } from "zod";

import { MaterialError } from "./lib/materials";
import { attachUser } from "./middleware/requireUser";
import { analyticsRouter } from "./routes/analytics";
import { authRouter } from "./routes/auth";
import { materialsRouter } from "./routes/materials";
import { modulesRouter } from "./routes/modules";
import { studyRouter } from "./routes/study";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");

  app.use(
    cors({
      origin:
        process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
      credentials: true,
    }),
  );

  app.use((_request, response, next) => {
    response.setHeader(
      "X-Content-Type-Options",
      "nosniff",
    );

    response.setHeader(
      "Referrer-Policy",
      "same-origin",
    );

    response.setHeader(
      "Cross-Origin-Resource-Policy",
      "same-site",
    );

    next();
  });

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(attachUser);

  app.get("/api/health", (_request, response) => {
    response.json({
      status: "ok",
      service: "recall-api",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/modules", modulesRouter);
  app.use("/api", materialsRouter);
  app.use("/api", studyRouter);
  app.use("/api", analyticsRouter);

  app.use((_request, response) =>
    response.status(404).json({
      error: "API route not found.",
    }),
  );

  app.use(
    (
      error: unknown,
      _request: express.Request,
      response: express.Response,
      _next: express.NextFunction,
    ) => {
      if (error instanceof ZodError) {
        return response.status(400).json({
          error:
            error.issues[0]?.message ??
            "Invalid request.",
        });
      }

      if (error instanceof MaterialError) {
        return response.status(400).json({
          error: error.message,
        });
      }

      if (
        typeof error === "object" &&
        error !== null &&
        "type" in error &&
        error.type === "entity.too.large"
      ) {
        return response.status(413).json({
          error: "Each material must be 2 MB or smaller.",
        });
      }

      console.error(error);

      return response.status(500).json({
        error: "Something went wrong. Please try again.",
      });
    },
  );

  return app;
}