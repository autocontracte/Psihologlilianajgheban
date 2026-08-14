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

/** POST — creează o programare nouă. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Trebuie să fii autentificat pentru a te programa." },
      { status: 401 },
    );
  }

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

  const service = await db.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) {
    return NextResponse.json({ error: "Serviciu inexistent." }, { status: 404 });
  }

  const startsAt = zonedToUtc(date, time);
  const endsAt = addMinutes(startsAt, service.duration);

  // Un client nu poate avea două programări active în același timp
  const own = await db.appointment.findFirst({
    where: {
      userId: user.id,
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
          userId: user.id,
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

    /* TODO livrare — trimite email de confirmare clientului și înștiințare
       către cabinet. Vezi README, secțiunea „Activarea formularelor". */
    console.log("[programare] creată", {
      id: created.id,
      user: user.email,
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
