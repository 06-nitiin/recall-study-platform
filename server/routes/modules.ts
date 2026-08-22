import { Router } from "express";

import {
  createModuleForUser,
  createNoteForModule,
  createTaskForModule,
  deleteModuleForUser,
  deleteNoteForUser,
  deleteTaskForUser,
  exportModuleBackupForUser,
  getModuleForUser,
  listModulesForUser,
  listNotesForModuleUser,
  listTasksForModuleUser,
  restoreModuleBackupForUser,
  setTaskCompleteForUser,
  updateModuleForUser,
  updateNoteForUser,
} from "../db/queries";

import { moduleBackupSchema } from "../lib/backup";
import {
  moduleSchema,
  noteSchema,
  taskSchema,
} from "../lib/schemas";

import { requireUser } from "../middleware/requireUser";

export const modulesRouter = Router();

modulesRouter.use(requireUser);

modulesRouter.get("/", async (request, response, next) => {
  try {
    response.json({
      modules: await listModulesForUser(request.user!.id),
    });
  } catch (error) {
    next(error);
  }
});

modulesRouter.post("/", async (request, response, next) => {
  try {
    response.status(201).json({
      module: await createModuleForUser(
        request.user!.id,
        moduleSchema.parse(request.body),
      ),
    });
  } catch (error) {
    next(error);
  }
});

modulesRouter.post(
  "/restore",
  async (request, response, next) => {
    try {
      response.status(201).json({
        module: await restoreModuleBackupForUser(
          request.user!.id,
          moduleBackupSchema.parse(request.body),
        ),
      });
    } catch (error) {
      next(error);
    }
  },
);

modulesRouter.get(
  "/:moduleId/backup",
  async (request, response, next) => {
    try {
      const backup = await exportModuleBackupForUser(
        Number(request.params.moduleId),
        request.user!.id,
      );

      if (!backup) {
        return response.status(404).json({
          error: "Module not found.",
        });
      }

      response.setHeader(
        "Content-Disposition",
        `attachment; filename="recall-module-${request.params.moduleId}.json"`,
      );

      response.json(backup);
    } catch (error) {
      next(error);
    }
  },
);

modulesRouter.get(
  "/:moduleId/notes",
  async (request, response, next) => {
    try {
      const module = await getModuleForUser(
        Number(request.params.moduleId),
        request.user!.id,
      );

      if (!module) {
        return response.status(404).json({
          error: "Module not found.",
        });
      }

      response.json({
        notes: await listNotesForModuleUser(
          module.id,
          request.user!.id,
        ),
      });
    } catch (error) {
      next(error);
    }
  },
);

modulesRouter.post(
  "/:moduleId/notes",
  async (request, response, next) => {
    try {
      const module = await getModuleForUser(
        Number(request.params.moduleId),
        request.user!.id,
      );

      if (!module) {
        return response.status(404).json({
          error: "Module not found.",
        });
      }

      response.status(201).json({
        note: await createNoteForModule(
          module.id,
          noteSchema.parse(request.body),
        ),
      });
    } catch (error) {
      next(error);
    }
  },
);

modulesRouter.patch(
  "/notes/:noteId",
  async (request, response, next) => {
    try {
      const note = await updateNoteForUser(
        Number(request.params.noteId),
        request.user!.id,
        noteSchema.parse(request.body),
      );

      if (!note) {
        return response.status(404).json({
          error: "Note not found.",
        });
      }

      response.json({ note });
    } catch (error) {
      next(error);
    }
  },
);

modulesRouter.delete(
  "/notes/:noteId",
  async (request, response, next) => {
    try {
      const deleted = await deleteNoteForUser(
        Number(request.params.noteId),
        request.user!.id,
      );

      if (!deleted) {
        return response.status(404).json({
          error: "Note not found.",
        });
      }

      response.status(204).end();
    } catch (error) {
      next(error);
    }
  },
);

modulesRouter.get(
  "/:moduleId/tasks",
  async (request, response, next) => {
    try {
      const module = await getModuleForUser(
        Number(request.params.moduleId),
        request.user!.id,
      );

      if (!module) {
        return response.status(404).json({
          error: "Module not found.",
        });
      }

      response.json({
        tasks: await listTasksForModuleUser(
          module.id,
          request.user!.id,
        ),
      });
    } catch (error) {
      next(error);
    }
  },
);

modulesRouter.post(
  "/:moduleId/tasks",
  async (request, response, next) => {
    try {
      const module = await getModuleForUser(
        Number(request.params.moduleId),
        request.user!.id,
      );

      if (!module) {
        return response.status(404).json({
          error: "Module not found.",
        });
      }

      response.status(201).json({
        task: await createTaskForModule(
          module.id,
          taskSchema.parse(request.body),
        ),
      });
    } catch (error) {
      next(error);
    }
  },
);

modulesRouter.patch(
  "/tasks/:taskId/complete",
  async (request, response, next) => {
    try {
      if (typeof request.body?.completed !== "boolean") {
        return response.status(400).json({
          error: "Provide a completion state.",
        });
      }

      const task = await setTaskCompleteForUser(
        Number(request.params.taskId),
        request.user!.id,
        request.body.completed,
      );

      if (!task) {
        return response.status(404).json({
          error: "Task not found.",
        });
      }

      response.json({ task });
    } catch (error) {
      next(error);
    }
  },
);

modulesRouter.delete(
  "/tasks/:taskId",
  async (request, response, next) => {
    try {
      const deleted = await deleteTaskForUser(
        Number(request.params.taskId),
        request.user!.id,
      );

      if (!deleted) {
        return response.status(404).json({
          error: "Task not found.",
        });
      }

      response.status(204).end();
    } catch (error) {
      next(error);
    }
  },
);

modulesRouter.get(
  "/:moduleId",
  async (request, response, next) => {
    try {
      const module = await getModuleForUser(
        Number(request.params.moduleId),
        request.user!.id,
      );

      if (!module) {
        return response.status(404).json({
          error: "Module not found.",
        });
      }

      response.json({ module });
    } catch (error) {
      next(error);
    }
  },
);

modulesRouter.patch(
  "/:moduleId",
  async (request, response, next) => {
    try {
      const module = await updateModuleForUser(
        Number(request.params.moduleId),
        request.user!.id,
        moduleSchema.parse(request.body),
      );

      if (!module) {
        return response.status(404).json({
          error: "Module not found.",
        });
      }

      response.json({ module });
    } catch (error) {
      next(error);
    }
  },
);

modulesRouter.delete(
  "/:moduleId",
  async (request, response, next) => {
    try {
      const deleted = await deleteModuleForUser(
        Number(request.params.moduleId),
        request.user!.id,
      );

      if (!deleted) {
        return response.status(404).json({
          error: "Module not found.",
        });
      }

      response.status(204).end();
    } catch (error) {
      next(error);
    }
  },
);