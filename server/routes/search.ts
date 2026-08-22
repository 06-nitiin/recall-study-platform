import { Router } from "express";

import { searchStudyContentForUser } from "../db/queries";
import { requireUser } from "../middleware/requireUser";

export const searchRouter = Router();

searchRouter.use(requireUser);

searchRouter.get("/search", async (request, response, next) => {
  try {
    const query = String(request.query.q ?? "").trim();

    if (query.length < 2 || query.length > 100) {
      return response
        .status(400)
        .json({ error: "Search with 2 to 100 characters." });
    }

    response.json({
      results: await searchStudyContentForUser(request.user!.id, query),
    });
  } catch (error) {
    next(error);
  }
});