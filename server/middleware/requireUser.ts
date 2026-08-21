import type { NextFunction, Request, Response } from "express";
import { readSessionToken, SESSION_COOKIE } from "../auth/session";

export async function attachUser(request: Request, _response: Response, next: NextFunction) {
  const token = request.cookies?.[SESSION_COOKIE];
  if (typeof token === "string") {
    try { request.user = await readSessionToken(token); } catch { request.user = undefined; }
  }
  next();
}

export function requireUser(request: Request, response: Response, next: NextFunction) {
  if (!request.user) return response.status(401).json({ error: "Sign in to continue." });
  next();
}
