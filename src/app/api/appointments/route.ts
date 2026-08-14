import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isSlotBookable } from "@/lib/slots";
import { addMinutes, zonedToUtc } from "@/lib/tz";
import { isFormat } from "@/lib/types";

/** GET — programările utilizatorului autentificat. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Neautentificat." }, { status: 401 });
  }

  const appointments = await db.appointment.findMany({
    where: { userId: user.id },
    include: { service: true },
    orderBy: { startsAt: "desc" },
  });

  return NextResponse.json({ appointments });
}

/* Programările fără cont nu trec prin autentificare, deci au nevoie de o
   limitare proprie.

   Se numără doar rezervările *reușite*, nu și încercările respinse de
   validare: altfel o greșeală de tastare ar consuma din cotă. Pragul este
   larg pentru că mai multe persoane pot împărți același IP — o familie, un
   birou sau o rețea mobilă. */
const GUEST_WINDOW_MS = 30 * 60 * 1000;
const GUEST_MAX = 5;
const guestBookings = new Map<string, number[]>();

function recentGuestBookings(ip: string): number[] {
  const now = Date.now();
  return (guestBookings.get(ip) ?? []).filter((t) => now - t < GUEST_WINDOW_MS);
}

function guestRateLimited(ip: string): boolean {
  return recentGuestBookings(ip).length >= GUEST_MAX;
}

function recordGuestBooking(ip: string): void {
  const now = Date.now();
  guestBookings.set(ip, [...recentGuestBookings(ip), now]);

  if (guestBookings.size > 5000) {
    for (const [key, times] of guestBookings) {
      if (times.every((t) => now - t >= GUEST_WINDOW_MS))
        guestBookings.delete(key);
    }
  }
}

/** POST — creează o programare, cu sau fără cont. */
export async function POST(request: Request) {
  const user = await getCurrentUser();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const serviceId = String(body.serviceId ?? "");
  const date = String(body.date ?? "");
  const time = String(body.time ?? "");
  const format = String(body.format ?? "CABINET");
  const notes = String(body.notes ?? "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json(
      { error: "Data sau ora sunt invalide." },
      { status: 400 },
    );
  }

  if (!isFormat(format)) {
    return NextResponse.json({ error: "Format invalid." }, { status: 400 });
  }

  if (notes.length > 2000) {
    return NextResponse.json({ error: "Mesajul este prea lung." }, { status: 400 });
  }

  /* ---------------------------------------------- cine face programarea */
  let guestName = "";
  let guestEmail = "";
  let guestPhone = "";
  let guestIp = "";

  if (!user) {
    guestIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (guestRateLimited(guestIp)) {
      return NextResponse.json(
        {
          error:
            "Prea multe programări trimise de pe această conexiune. Încearcă mai târziu sau sună-mă.",
        },
        { status: 429 },
      );
    }

    guestName = String(body.name ?? "").trim();
    guestEmail = String(body.email ?? "")
      .trim()
      .toLowerCase();
    guestPhone = String(body.phone ?? "").trim();

    if (guestName.length < 2 || guestName.length > 100) {
      return NextResponse.json(
        { error: "Completează numele tău." },
        { status: 400 },
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(guestEmail) ||
      guestEmail.length > 150
    ) {
      return NextResponse.json(
        { error: "Adresa de email nu pare validă." },
        { status: 400 },
      );
    }

    if (guestPhone.replace(/\D/g, "").length < 9 || guestPhone.length > 30) {
      return NextResponse.json(
        { error: "Numărul de telefon nu pare valid." },
        { status: 400 },
      );
    }
  }

  const service = await db.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) {
    return NextResponse.json({ error: "Serviciu inexistent." }, { status: 404 });
  }

  const startsAt = zonedToUtc(date, time);
  const endsAt = addMinutes(startsAt, service.duration);

  // Aceeași persoană nu poate avea două programări active în același interval
  const own = await db.appointment.findFirst({
    where: {
      ...(user ? { userId: user.id } : { guestEmail }),
      status: { in: ["PENDING", "CONFIRMED"] },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
  });
  if (own) {
    return NextResponse.json(
      { error: "Ai deja o programare în acest interval." },
      { status: 409 },
    );
  }

  /* Validarea se face înainte de salvare: intervalul trebuie să fie în program,
     în ziua nu blocată, destul de departe în viitor și încă liber. */
  const check = await isSlotBookable(startsAt, service.duration);
  if (!check.ok) {
    return NextResponse.json({ error: check.reason }, { status: 409 });
  }

  /* Verificarea se reia în tranzacție: între momentul în care clientul a văzut
     orele libere și cel în care a apăsat butonul, slotul poate fi luat. */
  try {
    const created = await db.$transaction(async (tx) => {
      const clash = await tx.appointment.findFirst({
        where: {
          status: { in: ["PENDING", "CONFIRMED"] },
          startsAt: { lt: endsAt },
          endsAt: { gt: startsAt },
        },
      });
      if (clash) throw new Error("SLOT_TAKEN");

      return tx.appointment.create({
        data: {
          userId: user?.id ?? null,
          guestName: user ? null : guestName,
          guestEmail: user ? null : guestEmail,
          guestPhone: user ? null : guestPhone,
          serviceId: service.id,
          startsAt,
          endsAt,
          format,
          status: "PENDING",
          notes: notes || null,
        },
        include: { service: true },
      });
    });

    // Cota se consumă abia acum, când chiar s-a creat o programare
    if (!user) recordGuestBooking(guestIp);

    /* TODO livrare — trimite email de confirmare clientului și înștiințare
       către cabinet. Vezi README, secțiunea „Activarea formularelor". */
    console.log("[programare] creată", {
      id: created.id,
      client: user?.email ?? `${guestName} <${guestEmail}> (fără cont)`,
      service: service.name,
      startsAt: startsAt.toISOString(),
    });

    return NextResponse.json({ ok: true, appointment: created });
  } catch (err) {
    if (err instanceof Error && err.message === "SLOT_TAKEN") {
      return NextResponse.json(
        { error: "Intervalul tocmai a fost ocupat. Alege altă oră." },
        { status: 409 },
      );
    }
    console.error("[programare] eroare", err);
    return NextResponse.json(
      { error: "Programarea nu a putut fi salvată." },
      { status: 500 },
    );
  }
}
