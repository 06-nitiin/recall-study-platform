export type HealthStatus = {
  status: "ok";
  service: string;
  timestamp: string;
};

export type CurrentUser = {
  id: number;
  email: string;
  displayName: string;
};

export type StudyModule = {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StudyMaterial = {
  id: number;
  moduleId: number;
  originalFilename: string;
  mimeType: string;
  byteSize: number;
  extractionStatus: "uploaded" | "ready" | "failed";
  extractionError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Flashcard = {
  id: number;
  prompt: string;
  answer: string;
  explanation: string | null;
  moduleId: number;
};

export type QuizQuestion = {
  id: number;
  prompt: string;
  optionsJson: string;
  correctOptionId: string;
  explanation: string | null;
};

async function request<T>(
  path: string,
  options: RequestInit = {},
) {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
  } & T;

  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed.");
  }

  return payload;
}

export const getHealthStatus = () =>
  request<HealthStatus>("/api/health");

export const getCurrentUser = () =>
  request<{ user: CurrentUser }>("/api/auth/me");

export const register = (input: {
  displayName: string;
  email: string;
  password: string;
}) =>
  request<{ user: CurrentUser }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const signIn = (input: {
  email: string;
  password: string;
}) =>
  request<{ user: CurrentUser }>("/api/auth/sign-in", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const signOut = () =>
  fetch("/api/auth/sign-out", {
    method: "POST",
    credentials: "include",
  });

export const listModules = () =>
  request<{ modules: StudyModule[] }>("/api/modules");

export const createModule = (input: {
  title: string;
  description: string;
}) =>
  request<{ module: StudyModule }>("/api/modules", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const updateModule = (
  id: number,
  input: {
    title: string;
    description: string;
  },
) =>
  request<{ module: StudyModule }>(`/api/modules/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

export const deleteModule = async (id: number) => {
  const response = await fetch(`/api/modules/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Could not delete this module.");
  }
};

export const listMaterials = (moduleId: number) =>
  request<{ materials: StudyMaterial[] }>(
    `/api/modules/${moduleId}/materials`,
  );

export const uploadMaterial = async (
  moduleId: number,
  file: File,
) => {
  const response = await fetch(
    `/api/modules/${moduleId}/materials/upload`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type":
          file.type ||
          (file.name.endsWith(".md")
            ? "text/markdown"
            : "text/plain"),
        "x-material-filename": encodeURIComponent(file.name),
      },
      body: file,
    },
  );

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    material?: StudyMaterial;
  };

  if (!response.ok) {
    throw new Error(
      payload.error ?? "Could not upload this material.",
    );
  }

  return payload.material!;
};

export const extractMaterial = (materialId: number) =>
  request<{
    extractedCharacterCount: number;
    status: "ready";
  }>(`/api/materials/${materialId}/extract`, {
    method: "POST",
  });

export const getMaterialText = (materialId: number) =>
  request<{
    filename: string;
    extractedText: string;
  }>(`/api/materials/${materialId}/text`);

export const deleteMaterial = async (materialId: number) => {
  const response = await fetch(
    `/api/materials/${materialId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Could not delete this material.");
  }
};

export const generateStudyContent = (moduleId: number) =>
  request<{
    flashcardCount: number;
    quizQuestionCount: number;
  }>(`/api/modules/${moduleId}/generate`, {
    method: "POST",
  });

export const getStudyContent = (moduleId: number) =>
  request<{
    guide: {
      summary: string;
      concepts: Array<{
        title: string;
        explanation: string;
      }>;
    } | null;
    flashcards: Flashcard[];
    quizQuestions: QuizQuestion[];
  }>(`/api/modules/${moduleId}/study-content`);

export const getDueCards = (moduleId: number) =>
  request<{
    cards: Array<{
      card: Flashcard;
      state: {
        repetitions: number;
        intervalDays: number;
        easeFactor: number;
      } | null;
    }>;
  }>(`/api/modules/${moduleId}/due-cards`);

export const recordCardReview = (
  flashcardId: number,
  input: {
    moduleId: number;
    rating: "again" | "hard" | "good" | "easy";
    confidence: number;
    state?: {
      repetitions: number;
      intervalDays: number;
      easeFactor: number;
    };
  },
) =>
  request<{
    intervalDays: number;
    dueAt: string;
  }>(`/api/flashcards/${flashcardId}/review`, {
    method: "POST",
    body: JSON.stringify(input),
  });

export const startQuiz = (moduleId: number) =>
  request<{
    session: {
      id: number;
    };
  }>(`/api/modules/${moduleId}/quiz-sessions`, {
    method: "POST",
  });

export const answerQuiz = (
  sessionId: number,
  input: {
    questionId: number;
    selectedOptionId: string;
    confidence: number;
  },
) =>
  request<{
    isCorrect: boolean;
    explanation: string | null;
    correctOptionId: string;
  }>(`/api/quiz-sessions/${sessionId}/responses`, {
    method: "POST",
    body: JSON.stringify(input),
  });

export const getTutorMessages = (moduleId: number) =>
  request<{
    messages: Array<{
      id: number;
      role: "user" | "assistant";
      content: string;
      citedMaterialIdsJson: string | null;
    }>;
  }>(`/api/modules/${moduleId}/tutor`);

export const sendTutorMessage = (
  moduleId: number,
  message: string,
) =>
  request<{
    message: {
      id: number;
      role: "assistant";
      content: string;
      citedMaterialIdsJson: string | null;
    };
  }>(`/api/modules/${moduleId}/tutor`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });

export const getAnalytics = () =>
  request<{
    dueCount: number;
    retentionRate: number;
    streak: number;
    heatmap: Array<{
      date: string;
      count: number;
    }>;
    moduleStats: Array<{
      id: number;
      title: string;
      reviews: number;
      sessions: number;
    }>;
  }>("/api/analytics/overview");

export const getPreferences = () =>
  request<{
    preferences: {
      dailyGoalMinutes: number;
      preferredSessionMinutes: number;
    };
  }>("/api/preferences");

export const savePreferences = (input: {
  dailyGoalMinutes: number;
  preferredSessionMinutes: number;
}) =>
  request<{
    preferences: {
      dailyGoalMinutes: number;
      preferredSessionMinutes: number;
    };
  }>("/api/preferences", {
    method: "PUT",
    body: JSON.stringify(input),
  });