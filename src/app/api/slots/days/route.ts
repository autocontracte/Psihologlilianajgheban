import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SLOT_STEP_MIN, BOOKING_LEAD_HOURS, BOOKING_HORIZON_DAYS } from "@/lib/slots";
import { addDays, addMinutes, toDateStr, todayStr, weekdayOf, zonedToUtc } from "@/lib/tz";

/**
 * GET /api/slots/days?serviceId=…&from=YYYY-MM-DD&days=21
 *
 * Întoarce, pentru fiecare zi, dacă mai are intervale libere.
 * Totul se calculează din trei interogări, nu una pe zi.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId") ?? "";
  const from = searchParams.get("from") ?? todayStr();
  const days = Math.min(Math.max(Number(searchParams.get("days") ?? 21), 1), 60);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(from)) {
    return NextResponse.json({ error: "Dată invalidă." }, { status: 400 });
  }

  const service = await db.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) {
    return NextResponse.json({ error: "Serviciu inexistent." }, { status: 404 });
  }

  const to = addDays(from, days);

  const [windows, blocked, taken] = await Promise.all([
    db.availability.findMany({ where: { active: true } }),
    db.blockedDate.findMany({
      where: { date: { gte: from, lt: to } },
      select: { date: true },
    }),
    db.appointment.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        startsAt: { gte: zonedToUtc(from, "00:00"), lt: zonedToUtc(to, "23:59") },
      },
      select: { startsAt: true, endsAt: true },
    }),
  ]);

  const blockedSet = new Set(blocked.map((b) => b.date));
  const byWeekday = new Map<number, { startTime: string; endTime: string }[]>();
  for (const w of windows) {
    const list = byWeekday.get(w.weekday) ?? [];
    list.push({ startTime: w.startTime, endTime: w.endTime });
    byWeekday.set(w.weekday, list);
  }

  const minutesOf = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const timeOf = (mins: number) =>
    `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

  const earliest = Date.now() + BOOKING_LEAD_HOURS * 60 * 60 * 1000;
  const horizon = Date.now() + BOOKING_HORIZON_DAYS * 24 * 60 * 60 * 1000;

  const result: { date: string; free: number; closed: boolean }[] = [];

  for (let i = 0; i < days; i++) {
    const date = addDays(from, i);

    if (blockedSet.has(date)) {
      result.push({ date, free: 0, closed: true });
      continue;
    }

    const dayWindows = byWeekday.get(weekdayOf(date)) ?? [];
    if (dayWindows.length === 0) {
      result.push({ date, free: 0, closed: true });
      continue;
    }

    const seen = new Set<string>();
    let free = 0;

    for (const w of dayWindows) {
      const start = minutesOf(w.startTime);
      const end = minutesOf(w.endTime);

      for (let m = start; m + service.duration <= end; m += SLOT_STEP_MIN) {
        const time = timeOf(m);
        if (seen.has(time)) continue;
        seen.add(time);

        const startsAt = zonedToUtc(date, time);
        if (toDateStr(startsAt) !== date) continue;

        const endsAt = addMinutes(startsAt, service.duration);
        const ms = startsAt.getTime();

        if (ms < earliest || ms > horizon) continue;
        if (taken.some((a) => startsAt < a.endsAt && endsAt > a.startsAt)) continue;

        free++;
      }
    }

    result.push({ date, free, closed: false });
  }

  return NextResponse.json({ days: result, duration: service.duration });
}
