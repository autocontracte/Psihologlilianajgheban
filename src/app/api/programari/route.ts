import { NextResponse } from "next/server";

/* ----------------------------------------------------------------------------
   Rută pentru cererile de programare.

   Etapa curentă: validare + log. Cererea ajunge la Liliana prin email.
   Etapa următoare (sistemul de programări propriu-zis):
     1. Adaugă o bază de date (ex. PostgreSQL + Prisma) cu tabelele
        `appointments` și `availability`.
     2. Expune GET /api/programari/disponibilitate care întoarce sloturile libere.
     3. Transformă acest POST în creare de rezervare cu status `pending`.
     4. Trimite email de confirmare + fișier .ics către client.
   -------------------------------------------------------------------------- */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }

  return recent.length > MAX_REQUESTS;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Prea multe cereri trimise. Încearcă din nou peste câteva minute." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const service = String(body.service ?? "").trim();
  const format = String(body.format ?? "").trim();
  const message = String(body.message ?? "").trim();
  const slots = Array.isArray(body.slots) ? body.slots.map(String) : [];

  if (!name || !email || !phone) {
    return NextResponse.json(
      { error: "Completează numele, telefonul și adresa de email." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Adresa de email nu pare validă." },
      { status: 400 },
    );
  }

  if (
    name.length > 100 ||
    email.length > 150 ||
    phone.length > 30 ||
    service.length > 150 ||
    message.length > 2000 ||
    slots.length > 10
  ) {
    return NextResponse.json(
      { error: "Unul dintre câmpuri depășește lungimea permisă." },
      { status: 400 },
    );
  }

  /* TODO livrare — trimite emailul către Liliana și confirmarea către client. */
  console.log("[programari] cerere nouă", {
    name,
    email,
    phone,
    service,
    format,
    slots,
    length: message.length,
    ip,
  });

  return NextResponse.json({ ok: true });
}
