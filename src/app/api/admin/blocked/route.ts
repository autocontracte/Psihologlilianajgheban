import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

async function guard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

/** POST — blochează o zi (concediu, sărbătoare). */
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

  const date = String(body.date ?? "");
  const reason = String(body.reason ?? "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Dată invalidă." }, { status: 400 });
  }

  if (reason.length > 200) {
    return NextResponse.json({ error: "Motivul este prea lung." }, { status: 400 });
  }

  const existing = await db.blockedDate.findUnique({ where: { date } });
  if (existing) {
    return NextResponse.json({ error: "Ziua este deja blocată." }, { status: 409 });
  }

  // Avertizează dacă în ziua respectivă există deja programări active
  const active = await db.appointment.count({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
      startsAt: {
        gte: new Date(`${date}T00:00:00.000Z`),
        lt: new Date(`${date}T23:59:59.999Z`),
      },
    },
  });

  const created = await db.blockedDate.create({
    data: { date, reason: reason || null },
  });

  return NextResponse.json({
    ok: true,
    blocked: created,
    warning:
      active > 0
        ? `Atenție: în această zi există ${active} programare(ări) activă(e). Blocarea nu le anulează automat.`
        : null,
  });
}

/** DELETE /api/admin/blocked?id=… */
export async function DELETE(request: Request) {
  if (!(await guard())) {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Lipsește identificatorul." }, { status: 400 });
  }

  await db.blockedDate.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
