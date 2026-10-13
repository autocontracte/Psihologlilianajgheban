import "server-only";

import { db } from "../db";
import { todayStr } from "./date";

/* Situația lunară a chiriașilor: câte ore au rezervat și câte ședințe au
   anulat târziu. Ședințele anulate din timp nu apar — se șterg la anulare. */

export type SituatieItem = {
  id: string;
  date: string;
  room: string;
  start: number;
  end: number;
  /** 0 pentru o ședință obișnuită; altfel cât la sută se plătește din cea anulată */
  cancelFee: number;
  cancelled: boolean;
};

export type SituatieRand = {
  personId: string;
  name: string;
  color: string;
  /** ședințe rezervate (neanulate) și minutele lor */
  sessions: number;
  minutes: number;
  /** ședințe anulate târziu și minutele lor */
  cancelled: number;
  cancelledMinutes: number;
  /** minutele de plată: cele rezervate plus partea plătită din cele anulate */
  payableMinutes: number;
  items: SituatieItem[];
};

export function validMonth(m: unknown): m is string {
  return typeof m === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(m);
}

export function currentMonth(): string {
  return todayStr().slice(0, 7);
}

export function shiftMonth(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7);
}

export async function situatie(month: string): Promise<SituatieRand[]> {
  const rows = await db.cabReservation.findMany({
    where: { date: { startsWith: `${month}-` }, person: { kind: "CHIRIAS" } },
    include: { person: true, room: true },
    orderBy: [{ date: "asc" }, { startMin: "asc" }],
  });

  const byPerson = new Map<string, SituatieRand>();
  for (const r of rows) {
    let rand = byPerson.get(r.personId);
    if (!rand) {
      rand = {
        personId: r.personId,
        name: r.person.name,
        color: r.person.color,
        sessions: 0,
        minutes: 0,
        cancelled: 0,
        cancelledMinutes: 0,
        payableMinutes: 0,
        items: [],
      };
      byPerson.set(r.personId, rand);
    }
    const len = r.endMin - r.startMin;
    const isCancelled = !!r.cancelledAt;
    if (isCancelled) {
      rand.cancelled++;
      rand.cancelledMinutes += len;
      rand.payableMinutes += (len * r.cancelFee) / 100;
    } else {
      rand.sessions++;
      rand.minutes += len;
      rand.payableMinutes += len;
    }
    rand.items.push({
      id: r.id,
      date: r.date,
      room: r.room.name,
      start: r.startMin,
      end: r.endMin,
      cancelFee: isCancelled ? r.cancelFee : 0,
      cancelled: isCancelled,
    });
  }

  return [...byPerson.values()].sort((a, b) => a.name.localeCompare(b.name, "ro"));
}
