import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSlotsForDate, BOOKING_HORIZON_DAYS } from "@/lib/slots";
import { addDays, todayStr } from "@/lib/tz";

/** GET /api/slots?serviceId=…&date=YYYY-MM-DD  →  orele libere din ziua cerută */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId") ?? "";
  const date = searchParams.get("date") ?? "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Dată invalidă." }, { status: 400 });
  }

  const today = todayStr();
  if (date < today || date > addDays(today, BOOKING_HORIZON_DAYS)) {
    return NextResponse.json({ slots: [] });
  }

  const service = await db.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) {
    return NextResponse.json({ error: "Serviciu inexistent." }, { status: 404 });
  }

  const slots = await getSlotsForDate(date, service.duration);

  return NextResponse.json({
    date,
    duration: service.duration,
    slots: slots.map((s) => ({ time: s.time, available: s.available })),
  });
}
