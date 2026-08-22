import { Router } from "express";
import {
  answerTutorQuestion,
  generateStudyContent,
  StudyAiError,
} from "../ai/studyAi";
import {
  addTutorMessage,
  createFocusSession,
  createManualFlashcard,
  createManualQuizQuestion,
  createQuizSession,
  deleteManualFlashcardForUser,
  deleteManualQuizQuestionForUser,
  finishFocusSession,
  getGeneratedStudyContent,
  getModuleForUser,
  listDueFlashcards,
  listReadyMaterialsForModule,
  listTutorMessages,
  recordQuizResponse,
  recordReview,
  replaceGeneratedStudyContent,
  updateManualFlashcardForUser,
  updateManualQuizQuestionForUser,
} from "../db/queries";
import {
  flashcardSchema,
  manualQuizQuestionSchema,
} from "../lib/schemas";
import { scheduleReview, type ReviewRating } from "../lib/sm2";
import { requireUser } from "../middleware/requireUser";

export const studyRouter = Router();

studyRouter.use(requireUser);

const ratings = new Set<ReviewRating>([
  "again",
  "hard",
  "good",
  "easy",
]);

async function ownedModule(moduleId: number, userId: number) {
  return getModuleForUser(moduleId, userId);
}

studyRouter.post(
  "/modules/:moduleId/generate",
  async (request, response, next) => {
    try {
      const module = await ownedModule(
        Number(request.params.moduleId),
        request.user!.id
      );

      if (!module) {
        return response
          .status(404)
          .json({ error: "Module not found." });
      }

      const generated = await generateStudyContent(
        await listReadyMaterialsForModule(module.id)
      );

      await replaceGeneratedStudyContent(
        module.id,
        generated
      );

      response.json({
        flashcardCount: generated.flashcards.length,
        quizQuestionCount: generated.quizQuestions.length,
      });
    } catch (error) {
      if (error instanceof StudyAiError) {
        return response
          .status(400)
          .json({ error: error.message });
      }

      next(error);
    }
  }
);

studyRouter.get(
  "/modules/:moduleId/study-content",
  async (request, response, next) => {
    try {
      const module = await ownedModule(
        Number(request.params.moduleId),
        request.user!.id
      );

      if (!module) {
        return response
          .status(404)
          .json({ error: "Module not found." });
      }

      response.json(
        await getGeneratedStudyContent(module.id)
      );
    } catch (error) {
      next(error);
    }
  }
);

studyRouter.get(
  "/modules/:moduleId/due-cards",
  async (request, response, next) => {
    try {
      const module = await ownedModule(
        Number(request.params.moduleId),
        request.user!.id
      );

      if (!module) {
        return response
          .status(404)
          .json({ error: "Module not found." });
      }

      response.json({
        cards: await listDueFlashcards(
          request.user!.id,
          module.id
        ),
      });
    } catch (error) {
      next(error);
    }
  }
);

studyRouter.post(
  "/modules/:moduleId/flashcards",
  async (request, response, next) => {
    try {
      const module = await ownedModule(
        Number(request.params.moduleId),
        request.user!.id
      );

      if (!module) {
        return response
          .status(404)
          .json({ error: "Module not found." });
      }

      response.status(201).json({
        flashcard: await createManualFlashcard(
          module.id,
          flashcardSchema.parse(request.body)
        ),
      });
    } catch (error) {
      next(error);
    }
  }
);

studyRouter.patch(
  "/flashcards/:flashcardId",
  async (request, response, next) => {
    try {
      const flashcard =
        await updateManualFlashcardForUser(
          Number(request.params.flashcardId),
          request.user!.id,
          flashcardSchema.parse(request.body)
        );

      if (!flashcard) {
        return response
          .status(404)
          .json({
            error: "Manual flashcard not found.",
          });
      }

      response.json({ flashcard });
    } catch (error) {
      next(error);
    }
  }
);

studyRouter.delete(
  "/flashcards/:flashcardId",
  async (request, response, next) => {
    try {
      if (
        !(await deleteManualFlashcardForUser(
          Number(request.params.flashcardId),
          request.user!.id
        ))
      ) {
        return response
          .status(404)
          .json({
            error: "Manual flashcard not found.",
          });
      }

      response.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

studyRouter.post(
  "/modules/:moduleId/quiz-questions",
  async (request, response, next) => {
    try {
      const module = await ownedModule(
        Number(request.params.moduleId),
        request.user!.id
      );

      if (!module) {
        return response
          .status(404)
          .json({ error: "Module not found." });
      }

      response.status(201).json({
        question: await createManualQuizQuestion(
          module.id,
          manualQuizQuestionSchema.parse(
            request.body
          )
        ),
      });
    } catch (error) {
      next(error);
    }
  }
);

studyRouter.patch(
  "/quiz-questions/:questionId",
  async (request, response, next) => {
    try {
      const question =
        await updateManualQuizQuestionForUser(
          Number(request.params.questionId),
          request.user!.id,
          manualQuizQuestionSchema.parse(
            request.body
          )
        );

      if (!question) {
        return response
          .status(404)
          .json({
            error: "Manual quiz question not found.",
          });
      }

      response.json({ question });
    } catch (error) {
      next(error);
    }
  }
);

studyRouter.delete(
  "/quiz-questions/:questionId",
  async (request, response, next) => {
    try {
      if (
        !(await deleteManualQuizQuestionForUser(
          Number(request.params.questionId),
          request.user!.id
        ))
      ) {
        return response
          .status(404)
          .json({
            error: "Manual quiz question not found.",
          });
      }

      response.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

studyRouter.post(
  "/flashcards/:flashcardId/review",
  async (request, response, next) => {
    try {
      const {
        moduleId,
        rating,
        confidence,
        state,
      } = request.body as {
        moduleId: number;
        rating: ReviewRating;
        confidence: number;
        state?: {
          repetitions: number;
          intervalDays: number;
          easeFactor: number;
        };
      };

      if (
        !ratings.has(rating) ||
        !Number.isInteger(confidence) ||
        confidence < 1 ||
        confidence > 5
      ) {
        return response
          .status(400)
          .json({
            error:
              "Use a valid rating and confidence from 1 to 5.",
          });
      }

      const module = await ownedModule(
        moduleId,
        request.user!.id
      );

      if (!module) {
        return response
          .status(404)
          .json({ error: "Module not found." });
      }

      const nextReview = scheduleReview(
        state,
        rating,
        confidence
      );

      await recordReview({
        userId: request.user!.id,
        moduleId,
        flashcardId: Number(
          request.params.flashcardId
        ),
        rating,
        confidence,
        ...nextReview,
      });

      response.json(nextReview);
    } catch (error) {
      next(error);
    }
  }
);

studyRouter.post(
  "/modules/:moduleId/quiz-sessions",
  async (request, response, next) => {
    try {
      const module = await ownedModule(
        Number(request.params.moduleId),
        request.user!.id
      );

      if (!module) {
        return response
          .status(404)
          .json({ error: "Module not found." });
      }

      const session = await createQuizSession(
        request.user!.id,
        module.id
      );

      response.status(201).json({ session });
    } catch (error) {
      next(error);
    }
  }
);

studyRouter.post(
  "/modules/:moduleId/focus-sessions",
  async (request, response, next) => {
    try {
      const module = await ownedModule(
        Number(request.params.moduleId),
        request.user!.id
      );

      if (!module) {
        return response
          .status(404)
          .json({ error: "Module not found." });
      }

      response.status(201).json({
        session: await createFocusSession(
          request.user!.id,
          module.id
        ),
      });
    } catch (error) {
      next(error);
    }
  }
);

studyRouter.post(
  "/focus-sessions/:sessionId/finish",
  async (request, response, next) => {
    try {
      const finished = await finishFocusSession(
        request.user!.id,
        Number(request.params.sessionId)
      );

      if (!finished) {
        return response
          .status(404)
          .json({
            error: "Focus session not found.",
          });
      }

      response.json(finished);
    } catch (error) {
      next(error);
    }
  }
);

studyRouter.post(
  "/quiz-sessions/:sessionId/responses",
  async (request, response, next) => {
    try {
      const {
        questionId,
        selectedOptionId,
        confidence,
      } = request.body as {
        questionId: number;
        selectedOptionId: string;
        confidence: number;
      };

      if (
        !Number.isInteger(confidence) ||
        confidence < 1 ||
        confidence > 5
      ) {
        return response
          .status(400)
          .json({
            error: "Confidence must be from 1 to 5.",
          });
      }

      const result = await recordQuizResponse({
        userId: request.user!.id,
        sessionId: Number(
          request.params.sessionId
        ),
        questionId,
        selectedOptionId,
        confidence,
      });

      if (!result) {
        return response
          .status(404)
          .json({
            error: "Quiz question not found.",
          });
      }

      response.json(result);
    } catch (error) {
      next(error);
    }
  }
);

studyRouter.get(
  "/modules/:moduleId/tutor",
  async (request, response, next) => {
    try {
      const module = await ownedModule(
        Number(request.params.moduleId),
        request.user!.id
      );

      if (!module) {
        return response
          .status(404)
          .json({ error: "Module not found." });
      }

      response.json({
        messages: await listTutorMessages(
          module.id,
          request.user!.id
        ),
      });
    } catch (error) {
      next(error);
    }
  }
);

studyRouter.post(
  "/modules/:moduleId/tutor",
  async (request, response, next) => {
    try {
      const module = await ownedModule(
        Number(request.params.moduleId),
        request.user!.id
      );

      if (!module) {
        return response
          .status(404)
          .json({ error: "Module not found." });
      }

      const question = String(
        request.body?.message ?? ""
      ).trim();

      if (!question || question.length > 3000) {
        return response
          .status(400)
          .json({
            error:
              "Enter a tutor question under 3,000 characters.",
          });
      }

      const history = await listTutorMessages(
        module.id,
        request.user!.id
      );

      await addTutorMessage({
        moduleId: module.id,
        userId: request.user!.id,
        role: "user",
        content: question,
      });

      const answer = await answerTutorQuestion({
        question,
        materials: await listReadyMaterialsForModule(
          module.id
        ),
        history: history.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      });

      const message = await addTutorMessage({
        moduleId: module.id,
        userId: request.user!.id,
        role: "assistant",
        content: answer.answer,
        citedMaterialIds: answer.citedMaterialIds,
      });

      response.json({ message });
    } catch (error) {
      if (error instanceof StudyAiError) {
        return response
          .status(400)
          .json({ error: error.message });
      }

      next(error);
    }
  }
);