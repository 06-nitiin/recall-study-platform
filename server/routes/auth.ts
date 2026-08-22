import { Router } from "express";
import { createSessionToken, clearSessionCookie, setSessionCookie } from "../auth/session";
import { hashPassword, verifyPassword } from "../auth/passwords";
import { createUser, findUserByEmail, findUserById, updateUserDisplayName, updateUserPassword } from "../db/queries";
import { requireUser } from "../middleware/requireUser";
import { passwordChangeSchema, profileSchema, registerSchema, signInSchema } from "../lib/schemas";

export const authRouter = Router();
const publicUser = (user: { id: number; email: string; displayName: string }) => ({ id: user.id, email: user.email, displayName: user.displayName });

authRouter.post("/register", async (request, response, next) => {
  try {
    const input = registerSchema.parse(request.body);
    if (await findUserByEmail(input.email)) return response.status(409).json({ error: "An account already uses this email address." });
    const user = await createUser({ email: input.email, displayName: input.displayName, passwordHash: await hashPassword(input.password) });
    if (!user) throw new Error("Account creation failed.");
    setSessionCookie(response, await createSessionToken(publicUser(user)));
    response.status(201).json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

authRouter.post("/sign-in", async (request, response, next) => {
  try {
    const input = signInSchema.parse(request.body);
    const user = await findUserByEmail(input.email);
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) return response.status(401).json({ error: "Email or password is incorrect." });
    setSessionCookie(response, await createSessionToken(publicUser(user)));
    response.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

authRouter.post("/sign-out", (_request, response) => { clearSessionCookie(response); response.status(204).end(); });
authRouter.get("/me", requireUser, (request, response) => response.json({ user: request.user }));
authRouter.patch("/profile", requireUser, async (request, response, next) => { try { const user = await updateUserDisplayName(request.user!.id, profileSchema.parse(request.body).displayName); if (!user) return response.status(404).json({ error: "Account not found." }); setSessionCookie(response, await createSessionToken(publicUser(user))); response.json({ user: publicUser(user) }); } catch (error) { next(error); } });
authRouter.post("/password", requireUser, async (request, response, next) => { try { const input = passwordChangeSchema.parse(request.body); const existing = await findUserById(request.user!.id); if (!existing || !(await verifyPassword(input.currentPassword, existing.passwordHash))) return response.status(401).json({ error: "Current password is incorrect." }); const user = await updateUserPassword(existing.id, await hashPassword(input.newPassword)); if (!user) return response.status(404).json({ error: "Account not found." }); setSessionCookie(response, await createSessionToken(publicUser(user))); response.json({ user: publicUser(user) }); } catch (error) { next(error); } });
