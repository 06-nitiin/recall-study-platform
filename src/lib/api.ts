export type HealthStatus = { status: "ok"; service: string; timestamp: string };
export type CurrentUser = { id: number; email: string; displayName: string };
export type StudyModule = { id: number; title: string; description: string | null; createdAt: string; updatedAt: string };

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(path, { credentials: "include", headers: { "Content-Type": "application/json", ...options.headers }, ...options });
  const payload = await response.json().catch(() => ({})) as { error?: string } & T;
  if (!response.ok) throw new Error(payload.error ?? "Request failed.");
  return payload;
}

export const getHealthStatus = () => request<HealthStatus>("/api/health");
export const getCurrentUser = () => request<{ user: CurrentUser }>("/api/auth/me");
export const register = (input: { displayName: string; email: string; password: string }) => request<{ user: CurrentUser }>("/api/auth/register", { method: "POST", body: JSON.stringify(input) });
export const signIn = (input: { email: string; password: string }) => request<{ user: CurrentUser }>("/api/auth/sign-in", { method: "POST", body: JSON.stringify(input) });
export const signOut = () => fetch("/api/auth/sign-out", { method: "POST", credentials: "include" });
export const listModules = () => request<{ modules: StudyModule[] }>("/api/modules");
export const createModule = (input: { title: string; description: string }) => request<{ module: StudyModule }>("/api/modules", { method: "POST", body: JSON.stringify(input) });
export const updateModule = (id: number, input: { title: string; description: string }) => request<{ module: StudyModule }>(`/api/modules/${id}`, { method: "PATCH", body: JSON.stringify(input) });
export const deleteModule = async (id: number) => { const response = await fetch(`/api/modules/${id}`, { method: "DELETE", credentials: "include" }); if (!response.ok) throw new Error("Could not delete this module."); };
