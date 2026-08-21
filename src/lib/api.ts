export type HealthStatus = { status: "ok"; service: string; timestamp: string };

export async function getHealthStatus(): Promise<HealthStatus> {
  const response = await fetch("/api/health");
  if (!response.ok) throw new Error("The local API is not responding.");
  return response.json() as Promise<HealthStatus>;
}
