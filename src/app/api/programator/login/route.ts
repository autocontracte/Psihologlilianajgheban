import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tooManyAttempts, verifyPassword } from "@/lib/auth";
import { clientIp } from "@/lib/request";
import { createProgSession } from "@/lib/programator/auth";

/* Hash de rezervă, ca verificarea să dureze la fel și când contul nu există. */
const DUMMY = "$2b$12$CwTycUXWue0Thq9StjUM0uJ8rP1r0s3uG8Yq3j9bq7p1eJ2m3n4o6";

export async function POST(request: Request) {
  if (tooManyAttempts(`prog-login:${clientIp(request)}`)) {
    return NextResponse.json(
      { error: "Prea multe încercări. Reîncearcă peste câteva minute." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const login = String(body.utilizator ?? "").trim().toLowerCase();
  const password = String(body.parola ?? "");

  /* Cu „@" e administratorul site-ului, care intră cu contul lui de acolo;
     altfel e un cont din programator. */
  if (login.includes("@")) {
    const admin = await db.user.findUnique({ where: { email: login } });
    const ok = await verifyPassword(password, admin?.passwordHash ?? DUMMY);
    if (admin && ok && admin.role === "ADMIN") {
      await createProgSession({ adminUserId: admin.id });
      return NextResponse.json({ ok: true });
    }
  } else {
    const person = await db.cabPerson.findUnique({ where: { username: login } });
    const ok = await verifyPassword(password, person?.passwordHash ?? DUMMY);
    if (person && ok && person.active && person.passwordHash) {
      await createProgSession({ personId: person.id });
      return NextResponse.json({ ok: true });
    }
  }

  return NextResponse.json({ error: "Utilizator sau parolă greșite." }, { status: 401 });
}
