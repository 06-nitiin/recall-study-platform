# Recall — Adaptive Study Platform

Recall is a standalone, local-first TypeScript study application. It combines user-owned modules and materials with adaptive flashcard review, quiz sessions, a module-specific AI tutor, progress signals, and private study preferences. The repository does not depend on a platform runtime, hosted authentication product, or injected credentials.

## Technology and local boundaries

| Area | Implementation |
|---|---|
| Client | React, TypeScript, Vite, and Tailwind CSS |
| API | Express with signed HTTP-only session cookies |
| Persistence | SQLite with Drizzle ORM and committed SQL migrations |
| Passwords | bcryptjs password hashes; plaintext passwords are never stored |
| AI | Optional server-side OpenAI-compatible API integration |
| Material storage | Private `uploads/` directory for development only |

All user-facing module, material, study, tutor, preference, and analytics reads are scoped to the authenticated user. The local `data/`, `uploads/`, `dist/`, and `.env` directories are intentionally ignored by Git.

## Local setup

Install a current Node.js LTS release and pnpm, then run the following commands from the project root.

```bash
pnpm install
cp .env.example .env
mkdir -p data uploads
pnpm db:migrate
pnpm dev
```

Open the web client at `http://localhost:5173`. Vite proxies API requests to the Express API at `http://localhost:8787` during development. The `CLIENT_ORIGIN` value in `.env` should remain `http://localhost:5173` unless the client is deliberately hosted elsewhere.

## Optional AI configuration

AI generation and tutor responses are disabled until `OPENAI_API_KEY` is set in `.env`. The default model name is `gpt-4o-mini`, but any OpenAI-compatible provider and model can be used by changing `OPENAI_BASE_URL` and `OPENAI_MODEL`. Never expose this key to the browser or commit `.env`.

The generator uses only ready, extracted materials belonging to the selected module. The tutor similarly receives context only from that module’s ready materials and records only that user’s private conversation.

## Study workflow

Create a module, upload a `.txt` or `.md` material, and run extraction. Once at least one material is ready, use **Generate** to create a study guide, flashcards, and multiple-choice questions. Flashcard ratings feed a deterministic SM-2-style scheduler. Quiz responses are checked server-side.

The progress panel displays only records already created by the signed-in user: cards due, retention from review quality, a review heatmap, a consecutive-review streak, and per-module activity. A user can choose daily and preferred-session minute targets; these settings are persisted privately.

## Focus sessions

Open a module and use **Start focus** to begin a focused study timer. The browser displays the live elapsed time, but the completed duration is calculated from the API’s start and finish timestamps before it is saved. Finished focus time appears in the **Focus today** metric. A focus session belongs only to the signed-in user and selected module.

## Private study notes

Each open module has a **Study notes** area for concise personal notes, questions, and reminders. Notes can be created, edited, and deleted by the signed-in owner of that module only. These notes are stored separately from uploaded materials and are not sent to the AI generator or tutor.

## Module study tasks

Each module also has a private task checklist. A task can have an optional due date and can be marked complete or incomplete without being deleted. The progress summary reports the total number of open tasks across the signed-in user’s modules. Tasks are owner-scoped and no task data is shared with the AI features.

## Private study search

Use the search field at the top of the workspace to search across your own module titles, notes, tasks, and ready extracted materials. Search results identify their content type and module. Choosing a result opens its owning module. The search API only collects data belonging to the signed-in user.

## Portable module backup and restore

With a module open, choose **Export module** to download a versioned JSON backup containing that module’s title, description, study guide, flashcards, and quiz questions. The backup deliberately excludes uploaded source files, extracted material text, tutor chat, review history, sessions, preferences, and account information.

Choose **Restore backup** and select a previously exported JSON file to add its contents as a new private module. The file is validated by the API before any data is written. Restoring does not overwrite an existing module, and imported cards begin without an existing review schedule.

## Validation

Run these commands before committing a milestone:

```bash
pnpm db:migrate
pnpm test && pnpm check && pnpm build
```

The tests cover authentication, protected ownership boundaries, material handling, scheduling, AI context isolation, and deterministic analytics calculations.

## Project structure

```text
src/                  React application and reusable UI components
server/               Express API, protected route handlers, and business logic
server/ai/            Optional server-side OpenAI-compatible integration
server/lib/           Deterministic extraction, scheduling, and analytics helpers
server/routes/        Authentication, modules, materials, study, and analytics routes
server/tests/         Vitest specifications
drizzle/              SQLite schema and sequential migrations
data/                 Local SQLite database (ignored)
uploads/              Local development-only material storage (ignored)
```

## Portfolio and deployment notes

The repository is intentionally runnable without a managed backend. For a production deployment, replace local file storage with an object-storage adapter, set a strong `JWT_SECRET`, configure a single HTTPS `CLIENT_ORIGIN`, provide a managed SQLite-compatible or relational database strategy, and add operational monitoring and backups. These choices are deployment concerns rather than hidden runtime dependencies.
