import { NextResponse } from "next/server";

/* ----------------------------------------------------------------------------
   Rută pentru formularul de contact.

   În acest moment mesajul este validat și scris în log-ul serverului.
   PENTRU PRODUCȚIE: conectează un serviciu de email (Resend, SMTP, Nodemailer)
   în locul marcat mai jos cu „TODO livrare”.
   -------------------------------------------------------------------------- */

const MAX_LEN = {
  name: 100,
  email: 150,
  phone: 30,
  subject: 120,
  message: 2000,
};

// Limitare simplă în memorie: max 5 mesaje / IP / 10 minute.
// La rulare cu mai multe instanțe, mută limitarea în Redis.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  // Curăță intrările vechi ca să nu crească memoria la nesfârșit
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
      { error: "Prea multe mesaje trimise. Încearcă din nou peste câteva minute." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  // Capcană anti-spam: botii completează câmpul ascuns „website”
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const subject = String(body.subject ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Completează numele, adresa de email și mesajul." },
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
    name.length > MAX_LEN.name ||
    email.length > MAX_LEN.email ||
    phone.length > MAX_LEN.phone ||
    subject.length > MAX_LEN.subject ||
    message.length > MAX_LEN.message
  ) {
    return NextResponse.json(
      { error: "Unul dintre câmpuri depășește lungimea permisă." },
      { status: 400 },
    );
  }

  /* TODO livrare — înlocuiește cu trimiterea reală a emailului.

     Exemplu cu Resend:
       import { Resend } from "resend";
       const resend = new Resend(process.env.RESEND_API_KEY);
       await resend.emails.send({
         from: "Site <no-reply@psihologlilianajgheban.ro>",
         to: process.env.CONTACT_EMAIL!,
         replyTo: email,
         subject: `Mesaj nou de la ${name} — ${subject || "contact site"}`,
         text: `Nume: ${name}\nEmail: ${email}\nTelefon: ${phone}\n\n${message}`,
       });
  */
  console.log("[contact] mesaj nou", {
    name,
    email,
    phone,
    subject,
    length: message.length,
    ip,
  });

  return NextResponse.json({ ok: true });
}
