import type { Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import { env } from "../env";

const SESSION_COOKIE = "recall_session";
const secret = new TextEncoder().encode(env.SESSION_SECRET);

export type SessionUser = { id: number; email: string; displayName: string };

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({ email: user.email, displayName: user.displayName })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function readSessionToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  const id = Number(payload.sub);
  if (!Number.isInteger(id) || id <= 0 || typeof payload.email !== "string" || typeof payload.displayName !== "string") return undefined;
  return { id, email: payload.email, displayName: payload.displayName } satisfies SessionUser;
}

export function setSessionCookie(response: Response, token: string) {
  response.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearSessionCookie(response: Response) {
  response.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "lax", secure: env.NODE_ENV === "production", path: "/" });
}

export { SESSION_COOKIE };
