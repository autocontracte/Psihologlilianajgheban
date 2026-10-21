/* Bucăți comune vederilor în stil „calendarul telefonului" (lună, zi, an,
   program) și formularului de adăugare. */

import {
  DAY_END,
  DAY_START,
  STEP,
  minToTime,
  mondayOf,
  ownerSegments,
  type Month,
  type Person,
  type Reservation,
  type Room,
  type Span,
  type Week,
} from "@/lib/programator/reguli";

export type Vedere = "an" | "luna" | "saptamana" | "zi" | "program";

/** Ce e ascuns din meniul lateral: cabinete și oameni. */
export type Ascunse = { rooms: string[]; people: string[] };

/** Culoarea omului, mai închisă: bara din stânga trebuie să se vadă pe fundalul deschis. */
export function bara(color: string | undefined): string {
  return `color-mix(in srgb, ${color ?? "#c9d6ea"} 70%, #363c45)`;
}

/** „Cabinet 1" → „C1". */
export function cabScurt(room: Room | undefined): string {
  return room ? room.name.replace(/^cabinet(ul)?\s*/i, "C") : "";
}

export function prenume(p: Person | undefined): string {
  return p?.name.trim().split(/\s+/)[0] ?? "";
}

/** O fereastră care primește o săptămână găsește în datele lunii ziua aleasă. */
export function caSaptamana(data: Month, date: string): Week {
  return { ...data, start: mondayOf(date) };
}

/** Rezervările unei zile, în ordinea orelor, fără cele ascunse din meniu. */
export function aleZilei(data: Month, date: string, ascunse: Ascunse): Reservation[] {
  return data.reservations
    .filter((r) => r.date === date && !ascunse.rooms.includes(r.roomId) && !ascunse.people.includes(r.personId))
    .sort((a, b) => a.start - b.start || a.roomId.localeCompare(b.roomId));
}

/** Ce ține proprietarul dintr-un cabinet într-o zi (minus ce a eliberat). */
export function aleProprietarului(data: Month, room: Room, date: string): Span[] {
  return ownerSegments(
    room,
    date,
    data.releases.filter((x) => x.roomId === room.id && x.date === date),
  );
}

/** De ce nu se poate rezerva intervalul în cabinet, sau null dacă e liber. */
export function ocupat(
  data: Month,
  room: Room,
  date: string,
  start: number,
  end: number,
  personId: string,
): string | null {
  const people = new Map(data.people.map((p) => [p.id, p]));
  const held = aleProprietarului(data, room, date).find((s) => s.start < end && s.end > start);
  if (held) {
    const who = people.get(room.ownerId ?? "")?.name ?? "proprietar";
    return held.start === DAY_START && held.end === DAY_END
      ? `Rezervat toată ziua pentru ${who}`
      : `Ținut de ${who}, ${minToTime(held.start)}–${minToTime(held.end)}`;
  }
  const clash = data.reservations.find(
    (r) =>
      r.date === date &&
      !r.cancelledAt &&
      r.start < end &&
      r.end > start &&
      (r.roomId === room.id || (!!personId && r.personId === personId)),
  );
  if (!clash) return null;
  const who = people.get(clash.personId)?.name ?? "altcineva";
  const ore = `${minToTime(clash.start)}–${minToTime(clash.end)}`;
  if (clash.roomId === room.id) return `Ocupat: ${who}, ${ore}`;
  const alt = data.rooms.find((r) => r.id === clash.roomId);
  return `${who} are deja ${alt?.name ?? "alt cabinet"}, ${ore}`;
}

/** Prima jumătate de oră care n-a trecut încă (azi) sau 10:00 (altă zi). */
export function oraImplicita(date: string, today: string): number {
  if (date !== today) return 10 * 60;
  const [h, m] = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Bucharest",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .format(new Date())
    .split(":")
    .map(Number);
  const next = Math.ceil((h * 60 + m) / STEP) * STEP;
  return Math.min(Math.max(next, DAY_START), DAY_END - 2 * STEP);
}

/** Orele din grilă, din 30 în 30 de minute, între `from` și `to` inclusiv. */
export function ore(from: number, to: number): number[] {
  const out: number[] = [];
  for (let m = from; m <= to; m += STEP) out.push(m);
  return out;
}
