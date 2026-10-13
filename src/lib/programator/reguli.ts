/* ----------------------------------------------------------------------------
   Programatorul cabinetelor — constante și calcule folosite și pe server, și
   în grilă. Fără acces la baza de date, ca să poată fi importat de oriunde.

   Zilele sunt "YYYY-MM-DD" în ora României, iar orele sunt minute de la miezul
   nopții (540 = 09:00). O rezervare e deci o celulă din grilă, fără fus orar.
   -------------------------------------------------------------------------- */

/** Grila merge de la 08:00 la 22:00, din 30 în 30 de minute. */
export const DAY_START = 8 * 60;
export const DAY_END = 22 * 60;
export const STEP = 30;
export const ROWS = (DAY_END - DAY_START) / STEP;

/** Cât de departe poate merge o repetare. */
export const MAX_REPEAT_DAYS = 366;

/* ADMIN = cont doar de administrare: nu ocupă cabinete, deci nu apare în grilă. */
export const KINDS = ["CENTRU", "CHIRIAS", "ADMIN"] as const;
export type Kind = (typeof KINDS)[number];

export const KIND_LABEL: Record<Kind, string> = {
  CENTRU: "Therapy Home",
  CHIRIAS: "Chiriaș",
  ADMIN: "Administrator",
};

/** Culori calde, lizibile cu text închis — aceleași ca în vechiul programator. */
export const PALETTE = [
  "#9ED8F0",
  "#BFE3C0",
  "#F4B6C2",
  "#D9C6F0",
  "#F7E3A1",
  "#F6C6A8",
  "#A9D3C9",
  "#C9D6EA",
  "#E8C9A0",
  "#B8E0F6",
];

export const ZILE = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];
const LUNI = ["ian.", "feb.", "mar.", "apr.", "mai", "iun.", "iul.", "aug.", "sept.", "oct.", "nov.", "dec."];

export type Room = {
  id: string;
  name: string;
  ownerId: string | null;
  /** 1 = luni … 7 = duminică */
  ownerDays: number[];
};

export type Person = {
  id: string;
  name: string;
  initials: string;
  color: string;
  kind: Kind;
  active: boolean;
};

export type Reservation = {
  id: string;
  roomId: string;
  personId: string;
  date: string;
  start: number;
  end: number;
  series: string | null;
  note: string | null;
};

export type Week = {
  start: string;
  today: string;
  rooms: Room[];
  people: Person[];
  reservations: Reservation[];
};

/* --------------------------------------------------------------------- Date */

export function validDate(s: unknown): s is string {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function utc(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(dateStr: string, n: number): string {
  const dt = utc(dateStr);
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

/** 1 = luni … 7 = duminică */
export function isoWeekday(dateStr: string): number {
  return utc(dateStr).getUTCDay() || 7;
}

export function mondayOf(dateStr: string): string {
  return addDays(dateStr, 1 - isoWeekday(dateStr));
}

/** „12 oct." */
export function shortDate(dateStr: string): string {
  const dt = utc(dateStr);
  return `${dt.getUTCDate()} ${LUNI[dt.getUTCMonth()]}`;
}

/** „luni, 12 oct. 2026" */
export function longDate(dateStr: string): string {
  return `${ZILE[isoWeekday(dateStr) - 1].toLowerCase()}, ${shortDate(dateStr)} ${dateStr.slice(0, 4)}`;
}

export function weekLabel(start: string): string {
  const end = addDays(start, 6);
  return `${shortDate(start)} – ${shortDate(end)} ${end.slice(0, 4)}`;
}

/* --------------------------------------------------------------------- Ore */

export function minToTime(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export function validSlot(start: unknown, end: unknown): boolean {
  return (
    Number.isInteger(start) &&
    Number.isInteger(end) &&
    (start as number) >= DAY_START &&
    (end as number) <= DAY_END &&
    (end as number) > (start as number) &&
    (start as number) % STEP === 0 &&
    (end as number) % STEP === 0
  );
}

/* ---------------------------------------------------------------- Cabinete */

export function parseDays(csv: string): number[] {
  return [
    ...new Set(
      csv
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isInteger(n) && n >= 1 && n <= 7),
    ),
  ].sort((a, b) => a - b);
}

/** Cabinetul e al proprietarului în ziua aceea, deci nu se poate rezerva. */
export function ownerDay(room: Room, dateStr: string): boolean {
  return !!room.ownerId && room.ownerDays.includes(isoWeekday(dateStr));
}

/** „luni–joi", „luni, miercuri" — pentru mesaje și pentru pagina cabinetelor. */
export function daysLabel(days: number[]): string {
  if (days.length === 0) return "";
  const consecutive = days.every((d, i) => i === 0 || d === days[i - 1] + 1);
  const name = (d: number) => ZILE[d - 1].toLowerCase();
  if (consecutive && days.length > 2) return `${name(days[0])}–${name(days[days.length - 1])}`;
  return days.map(name).join(", ");
}

export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 3)
    .toUpperCase();
}
