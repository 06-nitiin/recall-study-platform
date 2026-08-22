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

export type ModuleNote = {
  id: number;
  moduleId: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type ModuleTask = {
  id: number;
  moduleId: number;
  title: string;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StudySearchResult = {
  type: "module" | "note" | "task" | "material";
  moduleId: number;
  moduleTitle: string;
  title: string;
  content: string;
  excerpt: string;
};

async function request<T>(
  path: string,
  options: RequestInit = {}
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

export const updateProfile = (input: {
  displayName: string;
}) =>
  request<{ user: CurrentUser }>("/api/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(input),
  });

export const changePassword = (input: {
  currentPassword: string;
  newPassword: string;
}) =>
  request<{ user: CurrentUser }>("/api/auth/password", {
    method: "POST",
    body: JSON.stringify(input),
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
  }
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
    `/api/modules/${moduleId}/materials`
  );

export const uploadMaterial = async (
  moduleId: number,
  file: File
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
    }
  );

  const payload = (await response
    .json()
    .catch(() => ({}))) as {
    error?: string;
    material?: StudyMaterial;
  };

  if (!response.ok) {
    throw new Error(
      payload.error ?? "Could not upload this material."
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
    }
  );

  if (!response.ok) {
    throw new Error("Could not delete this material.");
  }
};

export type Flashcard = {
  id: number;
  prompt: string;
  answer: string;
  explanation: string | null;
  moduleId: number;
  isGenerated: boolean;
};

export type QuizQuestion = {
  id: number;
  prompt: string;
  optionsJson: string;
  correctOptionId: string;
  explanation: string | null;
  isGenerated: boolean;
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
  }
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
  }
) =>
  request<{
    isCorrect: boolean;
    explanation: string | null;
    correctOptionId: string;
  }>(`/api/quiz-sessions/${sessionId}/responses`, {
    method: "POST",
    body: JSON.stringify(input),
  });

export const startFocusSession = (moduleId: number) =>
  request<{
    session: {
      id: number;
      startedAt: string;
    };
  }>(`/api/modules/${moduleId}/focus-sessions`, {
    method: "POST",
  });

export const finishFocusSession = (sessionId: number) =>
  request<{
    durationSeconds: number;
    endedAt: string;
  }>(`/api/focus-sessions/${sessionId}/finish`, {
    method: "POST",
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
  message: string
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
    focusMinutesToday: number;
    openTaskCount: number;
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

export const exportModuleBackup = (moduleId: number) =>
  request<unknown>(`/api/modules/${moduleId}/backup`);

export const restoreModuleBackup = (backup: unknown) =>
  request<{ module: StudyModule }>("/api/modules/restore", {
    method: "POST",
    body: JSON.stringify(backup),
  });

export const listNotes = (moduleId: number) =>
  request<{ notes: ModuleNote[] }>(
    `/api/modules/${moduleId}/notes`
  );

export const createNote = (
  moduleId: number,
  input: {
    title: string;
    body: string;
  }
) =>
  request<{ note: ModuleNote }>(
    `/api/modules/${moduleId}/notes`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );

export const updateNote = (
  noteId: number,
  input: {
    title: string;
    body: string;
  }
) =>
  request<{ note: ModuleNote }>(
    `/api/modules/notes/${noteId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );

export const deleteNote = async (noteId: number) => {
  const response = await fetch(
    `/api/modules/notes/${noteId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Could not delete this note.");
  }
};

export const listTasks = (moduleId: number) =>
  request<{ tasks: ModuleTask[] }>(
    `/api/modules/${moduleId}/tasks`
  );

export const createTask = (
  moduleId: number,
  input: {
    title: string;
    dueDate: string | null;
  }
) =>
  request<{ task: ModuleTask }>(
    `/api/modules/${moduleId}/tasks`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );

export const setTaskComplete = (
  taskId: number,
  completed: boolean
) =>
  request<{ task: ModuleTask }>(
    `/api/modules/tasks/${taskId}/complete`,
    {
      method: "PATCH",
      body: JSON.stringify({ completed }),
    }
  );

export const deleteTask = async (taskId: number) => {
  const response = await fetch(
    `/api/modules/tasks/${taskId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Could not delete this task.");
  }
};

export const createManualFlashcard = (
  moduleId: number,
  input: {
    prompt: string;
    answer: string;
    explanation: string | null;
  }
) =>
  request<{ flashcard: Flashcard }>(
    `/api/modules/${moduleId}/flashcards`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );

export const updateManualFlashcard = (
  flashcardId: number,
  input: {
    prompt: string;
    answer: string;
    explanation: string | null;
  }
) =>
  request<{ flashcard: Flashcard }>(
    `/api/flashcards/${flashcardId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );

export const deleteManualFlashcard = async (
  flashcardId: number
) => {
  const response = await fetch(
    `/api/flashcards/${flashcardId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Could not delete this manual flashcard."
    );
  }
};

export const createManualQuizQuestion = (
  moduleId: number,
  input: {
    prompt: string;
    options: Array<{
      id: string;
      text: string;
    }>;
    correctOptionId: string;
    explanation: string | null;
  }
) =>
  request<{ question: QuizQuestion }>(
    `/api/modules/${moduleId}/quiz-questions`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );

export const updateManualQuizQuestion = (
  questionId: number,
  input: {
    prompt: string;
    options: Array<{
      id: string;
      text: string;
    }>;
    correctOptionId: string;
    explanation: string | null;
  }
) =>
  request<{ question: QuizQuestion }>(
    `/api/quiz-questions/${questionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );

export const deleteManualQuizQuestion = async (
  questionId: number
) => {
  const response = await fetch(
    `/api/quiz-questions/${questionId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Could not delete this manual quiz question."
    );
  }
};

export const searchStudy = (query: string) =>
  request<{ results: StudySearchResult[] }>(
    `/api/search?q=${encodeURIComponent(query)}`
  );