import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, tooManyAttempts, verifyPassword } from "@/lib/auth";
import { clientIp } from "@/lib/request";

export async function POST(request: Request) {
  if (tooManyAttempts(`login:${clientIp(request)}`)) {
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

  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body.password ?? "");

  const user = await db.user.findUnique({ where: { email } });

  /* Același mesaj și aceeași muncă indiferent dacă adresa există sau nu,
     ca să nu se poată afla ce conturi sunt înregistrate. */
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !valid) {
    return NextResponse.json(
      { error: "Email sau parolă greșite." },
      { status: 401 },
    );
  }

  await createSession(user.id);

  return NextResponse.json({ ok: true, role: user.role });
}
