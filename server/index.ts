import express from "express";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createApp } from "./app";
import { env } from "./env";

const app = createApp();
if (env.NODE_ENV === "production") {
  const clientDirectory = join(dirname(fileURLToPath(import.meta.url)), "..", "client");
  if (existsSync(clientDirectory)) {
    app.use(express.static(clientDirectory));
    app.get("*", (_request, response) => response.sendFile(join(clientDirectory, "index.html")));
  }
}
app.listen(env.PORT, () => console.log(`Recall API listening on port ${env.PORT}`));
