import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

async function guard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** POST — adaugă un interval în programul săptămânal. */
export async function POST(request: Request) {
  if (!(await guard())) {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const weekday = Number(body.weekday);
  const startTime = String(body.startTime ?? "");
  const endTime = String(body.endTime ?? "");

  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    return NextResponse.json({ error: "Zi invalidă." }, { status: 400 });
  }

  if (!TIME.test(startTime) || !TIME.test(endTime)) {
    return NextResponse.json(
      { error: "Orele trebuie scrise în formatul HH:MM." },
      { status: 400 },
    );
  }

  if (startTime >= endTime) {
    return NextResponse.json(
      { error: "Ora de început trebuie să fie înaintea celei de sfârșit." },
      { status: 400 },
    );
  }

  const existing = await db.availability.findUnique({
    where: { weekday_startTime_endTime: { weekday, startTime, endTime } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Intervalul există deja." },
      { status: 409 },
    );
  }

  const created = await db.availability.create({
    data: { weekday, startTime, endTime },
  });

  return NextResponse.json({ ok: true, availability: created });
}

/** DELETE /api/admin/availability?id=… */
export async function DELETE(request: Request) {
  if (!(await guard())) {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Lipsește identificatorul." }, { status: 400 });
  }

  await db.availability.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
