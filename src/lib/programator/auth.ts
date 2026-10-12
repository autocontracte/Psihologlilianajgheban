import "server-only";

import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { db } from "../db";
import type { Kind } from "./reguli";

/* Conturile programatorului sunt separate de cele ale site-ului: alt tabel,
   alt cookie. Cookie-ul se pune pe gazda programatorului, deci nu ajunge
   niciodată la site-ul principal. */
const COOKIE = "prog_session";
const SESSION_DAYS = 90;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type ProgUser = {
  /** null pentru administratorul site-ului, care nu e o persoană din grilă */
  personId: string | null;
  name: string;
  kind: Kind | null;
  manager: boolean;
};

export async function createProgSession(who: { personId: string } | { adminUserId: string }): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.cabSession.create({ data: { tokenHash: hashToken(token), expiresAt, ...who } });
  await db.cabSession.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(() => {});

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroyProgSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    await db.cabSession.deleteMany({ where: { tokenHash: hashToken(token) } }).catch(() => {});
  }
  store.delete(COOKIE);
}

/** Cine e autentificat în programator, sau null. */
export async function getProgUser(): Promise<ProgUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;

  const session = await db.cabSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { person: true },
  });
  if (!session || session.expiresAt.getTime() < Date.now()) return null;

  if (session.person) {
    // un cont dezactivat pierde accesul imediat, nu la expirarea sesiunii
    if (!session.person.active) return null;
    return {
      personId: session.person.id,
      name: session.person.name,
      kind: session.person.kind as Kind,
      manager: session.person.manager,
    };
  }

  if (session.adminUserId) {
    const admin = await db.user.findUnique({ where: { id: session.adminUserId } });
    if (admin?.role === "ADMIN") {
      return { personId: null, name: admin.name, kind: null, manager: true };
    }
  }
  return null;
}

/** Închide toate sesiunile unei persoane (la schimbarea parolei sau dezactivare). */
export async function endSessionsOf(personId: string): Promise<void> {
  await db.cabSession.deleteMany({ where: { personId } }).catch(() => {});
}
