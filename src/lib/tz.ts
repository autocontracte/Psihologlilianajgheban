/* ----------------------------------------------------------------------------
   Fus orar.

   Programările se păstrează în baza de date în UTC, dar sunt gândite și afișate
   în ora României. VPS-ul rulează de regulă pe UTC, deci nu ne putem baza pe
   ora locală a serverului — toate conversiile se fac explicit, cu Intl.
   -------------------------------------------------------------------------- */

export const TZ = "Europe/Bucharest";

/** Decalajul fusului față de UTC, în milisecunde, la momentul dat. */
function tzOffsetMs(date: Date, tz: string = TZ): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts: Record<string, string> = {};
  for (const { type, value } of dtf.formatToParts(date)) parts[type] = value;

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return asUtc - date.getTime();
}

/**
 * Transformă o dată și o oră din ora României într-un moment UTC.
 *
 * @param dateStr "YYYY-MM-DD"
 * @param timeStr "HH:MM"
 *
 * A doua trecere corectează zilele în care se schimbă ora: prima aproximare
 * poate folosi decalajul greșit exact în jurul tranziției.
 */
export function zonedToUtc(dateStr: string, timeStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const naive = Date.UTC(y, m - 1, d, hh, mm, 0, 0);

  let utc = new Date(naive - tzOffsetMs(new Date(naive)));
  utc = new Date(naive - tzOffsetMs(utc));
  return utc;
}

/** Data în ora României, ca "YYYY-MM-DD". */
export function toDateStr(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Ora în ora României, ca "HH:MM". */
export function toTimeStr(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

/** Ziua săptămânii pentru un "YYYY-MM-DD": 0 = duminică … 6 = sâmbătă. */
export function weekdayOf(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Adună zile peste un "YYYY-MM-DD" și întoarce tot un "YYYY-MM-DD". */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + days));
  return next.toISOString().slice(0, 10);
}

/** Ziua de azi în ora României, ca "YYYY-MM-DD". */
export function todayStr(): string {
  return toDateStr(new Date());
}

/* ------------------------------------------------------------------ Afișare */

export function formatDateLong(date: Date): string {
  return new Intl.DateTimeFormat("ro-RO", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat("ro-RO", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatTime(date: Date): string {
  return toTimeStr(date);
}

export function formatDateTime(date: Date): string {
  return `${formatDateShort(date)}, ${toTimeStr(date)}`;
}

/** Etichetă prietenoasă pentru un "YYYY-MM-DD" (ex. „Joi, 20 august"). */
export function labelForDateStr(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("ro-RO", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Adună minute peste un moment. */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}
