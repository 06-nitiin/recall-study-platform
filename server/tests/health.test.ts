import { describe, expect, it } from "vitest";
import { createApp } from "../app";

describe("GET /api/health", () => {
  it("reports that the standalone API is reachable", async () => {
    const server = createApp().listen();
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("Test server did not start");
      const response = await fetch(`http://127.0.0.1:${address.port}/api/health`);
      await expect(response.json()).resolves.toMatchObject({ status: "ok", service: "recall-api" });
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
