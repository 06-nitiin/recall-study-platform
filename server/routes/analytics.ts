import { Router } from "express";

import { getAnalyticsData, getPreferences, updatePreferences } from "../db/queries";

import { buildHeatmap, currentStreak, retentionRate } from "../lib/analytics";

import { requireUser } from "../middleware/requireUser";

export const analyticsRouter = Router();

analyticsRouter.use(requireUser);

analyticsRouter.get("/analytics/overview", async (request, response, next) => {
  try {
    const data = await getAnalyticsData(request.user!.id);
    const now = new Date();

    const dueCount = data.states.filter(
      (state) => state.dueAt <= now,
    ).length;

    const today = now.toISOString().slice(0, 10);

    const focusMinutesToday = Math.floor(
      data.sessions
        .filter(
          (session) =>
            session.kind === "focus" &&
            session.endedAt &&
            session.endedAt.toISOString().slice(0, 10) === today,
        )
        .reduce(
          (total, session) => total + session.durationSeconds,
          0,
        ) / 60,
    );

    const openTaskCount = data.tasks.filter(
      (task) => !task.completedAt,
    ).length;

    response.json({
      dueCount,
      retentionRate: retentionRate(data.events),
      streak: currentStreak(data.events, now),
      focusMinutesToday,
      openTaskCount,
      heatmap: buildHeatmap(data.events, 28, now),
      moduleStats: data.modules.map((module) => ({
        id: module.id,
        title: module.title,
        reviews: data.events.filter(
          (event) => event.moduleId === module.id,
        ).length,
        sessions: data.sessions.filter(
          (session) => session.moduleId === module.id,
        ).length,
      })),
    });
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get("/preferences", async (request, response, next) => {
  try {
    response.json({
      preferences: await getPreferences(request.user!.id),
    });
  } catch (error) {
    next(error);
  }
});

analyticsRouter.put("/preferences", async (request, response, next) => {
  try {
    const {
      dailyGoalMinutes,
      preferredSessionMinutes,
    } = request.body as {
      dailyGoalMinutes: number;
      preferredSessionMinutes: number;
    };

    if (
      ![dailyGoalMinutes, preferredSessionMinutes].every(
        (value) =>
          Number.isInteger(value) &&
          value >= 5 &&
          value <= 180,
      )
    ) {
      return response.status(400).json({
        error: "Preferences must be whole minutes from 5 to 180.",
      });
    }

    response.json({
      preferences: await updatePreferences(request.user!.id, {
        dailyGoalMinutes,
        preferredSessionMinutes,
      }),
    });
  } catch (error) {
    next(error);
  }
});