import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  createSession,
  hashPassword,
  passwordProblem,
  pruneExpiredSessions,
  tooManyAttempts,
} from "@/lib/auth";
import { clientIp } from "@/lib/request";

export async function POST(request: Request) {
  if (tooManyAttempts(`register:${clientIp(request)}`)) {
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

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const phone = String(body.phone ?? "").trim();
  const password = String(body.password ?? "");

  if (name.length < 2 || name.length > 100) {
    return NextResponse.json(
      { error: "Numele trebuie să aibă între 2 și 100 de caractere." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 150) {
    return NextResponse.json(
      { error: "Adresa de email nu pare validă." },
      { status: 400 },
    );
  }

  if (phone.replace(/\D/g, "").length < 9 || phone.length > 30) {
    return NextResponse.json(
      { error: "Numărul de telefon nu pare valid." },
      { status: 400 },
    );
  }

  const pwError = passwordProblem(password);
  if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Există deja un cont cu această adresă de email." },
      { status: 409 },
    );
  }

  const user = await db.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash: await hashPassword(password),
      role: "CLIENT",
    },
  });

  await createSession(user.id);
  await pruneExpiredSessions();

  return NextResponse.json({ ok: true });
}
