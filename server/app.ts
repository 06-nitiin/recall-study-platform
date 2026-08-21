import cors from "cors";
import express from "express";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok", service: "recall-api", timestamp: new Date().toISOString() });
  });
  return app;
}
