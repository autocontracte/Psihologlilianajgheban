/* ----------------------------------------------------------------------------
   Calendarul Lilianei (aplicația de telefon de la /calendar) — tipurile și
   calculele de date folosite și pe server, și în pagină. Zilele sunt
   "YYYY-MM-DD" în ora României, orele sunt minute de la miezul nopții.
   -------------------------------------------------------------------------- */

import type { Format, Status } from "./types";

/** Un rând din calendar: o programare de pe site sau un eveniment din Google. */
export type Ev =
  | {
      kind: "prog";
      id: string;
      date: string;
      start: number;
      end: number;
      allDay: false;
      title: string;
      status: Status;
      format: Format;
      service: string;
      client: { name: string; email: string; phone: string; hasAccount: boolean };
      notes: string | null;
      adminNote: string | null;
      paymentMethod: string;
      paid: boolean;
    }
  | {
      kind: "google";
      id: string;
      date: string;
      start: number;
      end: number;
      allDay: boolean;
      title: string;
      /** linkul evenimentului în Google Calendar */
      link: string | null;
      /** marcat „Liber" în Google: nu ocupă ora */
      free: boolean;
    };

export type Serviciu = { id: string; name: string; duration: number };

/** Cele 6 săptămâni ale vederii pe lună, de la `start` (o luni) la `end`. */
export type LunaCal = {
  month: string;
  start: string;
  end: string;
  today: string;
  events: Ev[];
  services: Serviciu[];
  google: { activ: boolean; eroare: string | null };
  /** ultima sincronizare reușită cu Google (ISO) și ultima eroare, pentru semnalul din meniu */
  sync: { lastOkAt: string | null; lastError: string | null };
};

/** După atâtea minute fără o sincronizare reușită, aplicația arată un avertisment roșu. */
export const SYNC_INTARZIAT_MIN = 15;

export const ZI_START = 7 * 60;
export const ZI_END = 22 * 60;
export const PAS = 30;

export const LUNI_LUNGI = [
  "ianuarie",
  "februarie",
  "martie",
  "aprilie",
  "mai",
  "iunie",
  "iulie",
  "august",
  "septembrie",
  "octombrie",
  "noiembrie",
  "decembrie",
];
const LUNI = ["ian.", "feb.", "mar.", "apr.", "mai", "iun.", "iul.", "aug.", "sept.", "oct.", "nov.", "dec."];
const ZILE = ["luni", "marți", "miercuri", "joi", "vineri", "sâmbătă", "duminică"];
const ZILE_SCURT = ["lun.", "mar.", "mie.", "joi", "vin.", "sâm.", "dum."];

function utc(d: string): Date {
  const [y, m, z] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, z));
}

export function addDays(d: string, n: number): string {
  const dt = utc(d);
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

/** 1 = luni … 7 = duminică */
export function isoWeekday(d: string): number {
  return utc(d).getUTCDay() || 7;
}

export function mondayOf(d: string): string {
  return addDays(d, 1 - isoWeekday(d));
}

export function validDate(s: unknown): s is string {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  return utc(s).toISOString().slice(0, 10) === s;
}

/** Ziua de 1 a lunii de după (n = 1) sau de dinainte (n = -1). */
export function lunaPlus(first: string, n: number): string {
  const [y, m] = first.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 10);
}

/** „22 oct." */
export function shortDate(d: string): string {
  const dt = utc(d);
  return `${dt.getUTCDate()} ${LUNI[dt.getUTCMonth()]}`;
}

/** „joi, 22 oct. 2026" */
export function longDate(d: string): string {
  return `${ZILE[isoWeekday(d) - 1]}, ${shortDate(d)} ${d.slice(0, 4)}`;
}

/** „joi, 22 oct." — ca în calendarul telefonului. */
export function phoneDate(d: string): string {
  return `${ZILE_SCURT[isoWeekday(d) - 1]}, ${shortDate(d)}`;
}

export function minToTime(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
