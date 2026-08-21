import { Router } from "express";
import { createModuleForUser, deleteModuleForUser, getModuleForUser, listModulesForUser, updateModuleForUser } from "../db/queries";
import { moduleSchema } from "../lib/schemas";
import { requireUser } from "../middleware/requireUser";

export const modulesRouter = Router();
modulesRouter.use(requireUser);

modulesRouter.get("/", async (request, response, next) => { try { response.json({ modules: await listModulesForUser(request.user!.id) }); } catch (error) { next(error); } });
modulesRouter.post("/", async (request, response, next) => { try { response.status(201).json({ module: await createModuleForUser(request.user!.id, moduleSchema.parse(request.body)) }); } catch (error) { next(error); } });
modulesRouter.get("/:moduleId", async (request, response, next) => { try { const module = await getModuleForUser(Number(request.params.moduleId), request.user!.id); if (!module) return response.status(404).json({ error: "Module not found." }); response.json({ module }); } catch (error) { next(error); } });
modulesRouter.patch("/:moduleId", async (request, response, next) => { try { const module = await updateModuleForUser(Number(request.params.moduleId), request.user!.id, moduleSchema.parse(request.body)); if (!module) return response.status(404).json({ error: "Module not found." }); response.json({ module }); } catch (error) { next(error); } });
modulesRouter.delete("/:moduleId", async (request, response, next) => { try { const deleted = await deleteModuleForUser(Number(request.params.moduleId), request.user!.id); if (!deleted) return response.status(404).json({ error: "Module not found." }); response.status(204).end(); } catch (error) { next(error); } });
