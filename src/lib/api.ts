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