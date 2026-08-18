import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { clientIp } from "@/lib/request";

/* ----------------------------------------------------------------------------
   Salvarea răspunsurilor din chestionar.

   Linkul e privat, dar nu e protejat cu parolă — clienta nu trebuie să își facă
   un cont ca să răspundă. De aceea cheile sunt dintr-o listă închisă: nimeni nu
   poate folosi ruta ca să depoziteze date arbitrare în baza de date.
   -------------------------------------------------------------------------- */

const ALLOWED_KEYS = new Set([
  "respondent",
  "paleta",
  "paleta_comentariu",
  "font",
  "font_comentariu",
  "calendar",
  "calendar_altul",
  "contract",
  "contract_detalii",
  "contabilitate",
  "contabilitate_altul",
  "stripe",
  "stripe_email",
  "seo_varianta",
  "seo_comentariu",
  "intrebari_geo",
  "automatizari",
  "observatii",
]);

const MAX_LEN = 8000;

/* Limitare blândă: chestionarul se completează pe îndelete, cu multe salvări
   automate, deci pragul e generos. */
const WINDOW_MS = 60 * 1000;
const MAX_WRITES = 90;
const writes = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (writes.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  writes.set(ip, recent);

  if (writes.size > 2000) {
    for (const [k, times] of writes) {
      if (times.every((t) => now - t >= WINDOW_MS)) writes.delete(k);
    }
  }
  return recent.length > MAX_WRITES;
}

/** POST — salvează un singur răspuns. Se apelează la fiecare modificare. */
export async function POST(request: Request) {
  if (rateLimited(clientIp(request))) {
    return NextResponse.json(
      { error: "Prea multe salvări. Așteaptă un moment." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const key = String(body.key ?? "");
  const value = String(body.value ?? "");

  if (!ALLOWED_KEYS.has(key)) {
    return NextResponse.json({ error: "Întrebare necunoscută." }, { status: 400 });
  }

  if (value.length > MAX_LEN) {
    return NextResponse.json({ error: "Răspunsul este prea lung." }, { status: 400 });
  }

  const saved = await db.briefAnswer.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  return NextResponse.json({ ok: true, updatedAt: saved.updatedAt });
}

/** GET — toate răspunsurile. Doar pentru administrator. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  const [answers, files] = await Promise.all([
    db.briefAnswer.findMany({ orderBy: { updatedAt: "desc" } }),
    db.briefFile.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return NextResponse.json({ answers, files });
}
