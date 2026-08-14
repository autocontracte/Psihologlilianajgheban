import "server-only";

import { cookies } from "next/headers";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";
import type { Role } from "./types";

const COOKIE = "lj_session";
const SESSION_DAYS = 30;
const BCRYPT_ROUNDS = 12;

/* ------------------------------------------------------------------- Parole */

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Cerințe minime, verificate și în interfață. */
export function passwordProblem(pw: string): string | null {
  if (pw.length < 8) return "Parola trebuie să aibă cel puțin 8 caractere.";
  if (pw.length > 200) return "Parola este prea lungă.";
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw))
    return "Parola trebuie să conțină cel puțin o literă și o cifră.";
  return null;
}

/* ------------------------------------------------------------------ Sesiuni */

/* În cookie ajunge tokenul brut, în baza de date doar hash-ul lui. Astfel,
   cine ar citi baza de date nu poate reconstitui sesiuni valide. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.session.create({
    data: { tokenHash: hashToken(token), userId, expiresAt },
  });

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;

  if (token) {
    await db.session
      .deleteMany({ where: { tokenHash: hashToken(token) } })
      .catch(() => {});
  }

  store.delete(COOKIE);
}

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
};

/** Utilizatorul sesiunii curente, sau null dacă nu e autentificat. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    phone: session.user.phone,
    role: session.user.role as Role,
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

/** Șterge sesiunile expirate. Apelat ocazional, la autentificare. */
export async function pruneExpiredSessions(): Promise<void> {
  await db.session
    .deleteMany({ where: { expiresAt: { lt: new Date() } } })
    .catch(() => {});
}

/* ------------------------------------------------------- Limitare încercări */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const attempts = new Map<string, number[]>();

export function tooManyAttempts(key: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  attempts.set(key, recent);

  if (attempts.size > 5000) {
    for (const [k, times] of attempts) {
      if (times.every((t) => now - t >= WINDOW_MS)) attempts.delete(k);
    }
  }

  return recent.length > MAX_ATTEMPTS;
}

/** Comparație în timp constant, pentru valori scurte. */
export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}
