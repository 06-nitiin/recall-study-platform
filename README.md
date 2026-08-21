# Recall — Adaptive Study Platform

Recall is a standalone TypeScript foundation for an adaptive study platform. It uses a React/Vite frontend, an Express API, SQLite through Drizzle ORM, and Vitest. There is no platform-specific runtime, injected credential, or managed authentication dependency.

## Local setup

```bash
pnpm install
mkdir -p data
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Open the client at `http://localhost:5173`. The Vite development server proxies API requests to the Express server at `http://localhost:8787`.

## Validation

```bash
pnpm test
pnpm check
pnpm build
```

## Project structure

```text
src/        React application and reusable client components
server/     Express API, environment validation, and database access
drizzle/    Drizzle schema and generated migrations
shared/     Types shared by future client and server features
```

Copy `.env.example` to `.env` and keep `.env` out of Git. Future milestones will add optional environment variables for conventional authentication, AI, and S3-compatible storage.
