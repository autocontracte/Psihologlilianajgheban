import { db } from "./db";
import { addMinutes, toDateStr, toTimeStr, weekdayOf, zonedToUtc } from "./tz";

/* Pasul grilei de ore. La 60 de minute, programările încep fix la ore rotunde,
   ceea ce lasă și o pauză firească între ședințe. */
export const SLOT_STEP_MIN = 60;

/** Cu cât timp înainte se mai poate face o programare. */
export const BOOKING_LEAD_HOURS = 4;

/** Cât de departe în viitor se poate programa. */
export const BOOKING_HORIZON_DAYS = 60;

/** Cu cât timp înainte își mai poate anula clientul singur programarea. */
export const CANCEL_LEAD_HOURS = 24;

export type Slot = {
  /** Ora de început în ora României, "HH:MM". */
  time: string;
  /** Momentul de început, în UTC. */
  startsAt: Date;
  available: boolean;
};

function minutesOf(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function timeOf(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Sloturile unei zile pentru un serviciu dat.
 *
 * Ține cont de programul săptămânal, de zilele blocate, de programările deja
 * existente și de intervalul minim până la ședință.
 */
export async function getSlotsForDate(
  dateStr: string,
  durationMin: number,
): Promise<Slot[]> {
  // Ziua blocată — nimic disponibil
  const blocked = await db.blockedDate.findUnique({ where: { date: dateStr } });
  if (blocked) return [];

  const windows = await db.availability.findMany({
    where: { weekday: weekdayOf(dateStr), active: true },
    orderBy: { startTime: "asc" },
  });
  if (windows.length === 0) return [];

  // Programările active din ziua respectivă (în ora României)
  const dayStart = zonedToUtc(dateStr, "00:00");
  const dayEnd = addMinutes(dayStart, 24 * 60 + 120); // marjă pentru schimbarea orei

  const taken = await db.appointment.findMany({
    where: {
      startsAt: { gte: dayStart, lt: dayEnd },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { startsAt: true, endsAt: true },
  });

  const earliest = Date.now() + BOOKING_LEAD_HOURS * 60 * 60 * 1000;
  const slots: Slot[] = [];

  for (const w of windows) {
    const from = minutesOf(w.startTime);
    const to = minutesOf(w.endTime);

    for (let m = from; m + durationMin <= to; m += SLOT_STEP_MIN) {
      const time = timeOf(m);
      const startsAt = zonedToUtc(dateStr, time);
      const endsAt = addMinutes(startsAt, durationMin);

      // Slotul trebuie să rămână în ziua cerută (protecție la schimbarea orei)
      if (toDateStr(startsAt) !== dateStr) continue;

      const overlaps = taken.some(
        (a) => startsAt < a.endsAt && endsAt > a.startsAt,
      );
      const tooSoon = startsAt.getTime() < earliest;

      slots.push({ time, startsAt, available: !overlaps && !tooSoon });
    }
  }

  // Elimină eventualele duplicate dintre ferestre suprapuse
  const seen = new Set<string>();
  return slots
    .filter((s) => (seen.has(s.time) ? false : (seen.add(s.time), true)))
    .sort((a, b) => a.time.localeCompare(b.time));
}

/**
 * Verificare finală, chiar înainte de salvare. Se face din nou pe server,
 * pentru că între afișarea sloturilor și apăsarea butonului poate apărea
 * altă rezervare.
 */
export async function isSlotBookable(
  startsAt: Date,
  durationMin: number,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const dateStr = toDateStr(startsAt);
  const time = toTimeStr(startsAt);

  if (startsAt.getTime() < Date.now() + BOOKING_LEAD_HOURS * 60 * 60 * 1000) {
    return {
      ok: false,
      reason: `Programările se fac cu cel puțin ${BOOKING_LEAD_HOURS} ore înainte.`,
    };
  }

  const horizon = Date.now() + BOOKING_HORIZON_DAYS * 24 * 60 * 60 * 1000;
  if (startsAt.getTime() > horizon) {
    return {
      ok: false,
      reason: `Programările se pot face cu cel mult ${BOOKING_HORIZON_DAYS} de zile înainte.`,
    };
  }

  const slots = await getSlotsForDate(dateStr, durationMin);
  const match = slots.find((s) => s.time === time);

  if (!match) return { ok: false, reason: "Intervalul ales nu este în program." };
  if (!match.available)
    return { ok: false, reason: "Intervalul tocmai a fost ocupat." };

  return { ok: true };
}

/** Zilele următoare, cu marcaj dacă au sau nu locuri libere. */
export async function getDayOverview(
  fromDateStr: string,
  days: number,
  durationMin: number,
): Promise<{ date: string; hasFree: boolean }[]> {
  const { addDays } = await import("./tz");
  const out: { date: string; hasFree: boolean }[] = [];

  for (let i = 0; i < days; i++) {
    const date = addDays(fromDateStr, i);
    const slots = await getSlotsForDate(date, durationMin);
    out.push({ date, hasFree: slots.some((s) => s.available) });
  }

  return out;
}
