import "server-only";

import { randomBytes } from "node:crypto";
import { db } from "../db";
import { toDateStr } from "../tz";
import type { ProgUser } from "./auth";
import {
  MAX_REPEAT_DAYS,
  addDays,
  daysLabel,
  longDate,
  minToTime,
  mondayOf,
  ownerDay,
  parseDays,
  validDate,
  validSlot,
  type Kind,
  type Person,
  type Reservation,
  type Room,
  type Week,
} from "./reguli";

export function todayStr(): string {
  return toDateStr(new Date());
}

export async function rooms(): Promise<Room[]> {
  const rows = await db.cabRoom.findMany({
    where: { active: true },
    orderBy: [{ position: "asc" }, { name: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    ownerId: r.ownerId,
    ownerDays: parseDays(r.ownerWeekdays),
  }));
}

export async function people(): Promise<Person[]> {
  // conturile doar de administrare nu ocupă cabinete, deci nu apar în grilă
  const rows = await db.cabPerson.findMany({
    where: { kind: { not: "ADMIN" } },
    orderBy: [{ position: "asc" }, { name: "asc" }],
  });
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    initials: p.initials,
    color: p.color,
    kind: p.kind as Kind,
    active: p.active,
  }));
}

type Row = {
  id: string;
  roomId: string;
  personId: string;
  date: string;
  startMin: number;
  endMin: number;
  series: string | null;
  note: string | null;
};

function fmt(r: Row): Reservation {
  return {
    id: r.id,
    roomId: r.roomId,
    personId: r.personId,
    date: r.date,
    start: r.startMin,
    end: r.endMin,
    series: r.series,
    note: r.note,
  };
}

/** Tot ce are nevoie grila pentru o săptămână (de luni până duminică). */
export async function week(anyDay: string): Promise<Week> {
  const start = mondayOf(validDate(anyDay) ? anyDay : todayStr());
  const [r, p, res] = await Promise.all([
    rooms(),
    people(),
    db.cabReservation.findMany({
      where: { date: { gte: start, lte: addDays(start, 6) } },
      orderBy: [{ date: "asc" }, { startMin: "asc" }],
    }),
  ]);
  return { start, today: todayStr(), rooms: r, people: p, reservations: res.map(fmt) };
}

/* ---------------------------------------------------------------- Reguli */

export class ProgError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

/** De ce nu se poate pune rezervarea aici, sau null dacă e liber. */
async function obstacle(
  room: Room,
  roomList: Room[],
  personId: string,
  date: string,
  start: number,
  end: number,
  excludeId = "",
): Promise<string | null> {
  if (ownerDay(room, date)) {
    const owner = await db.cabPerson.findUnique({ where: { id: room.ownerId! } });
    return `${room.name} este rezervat pentru ${owner?.name ?? "proprietar"} ${daysLabel(room.ownerDays)}.`;
  }

  const clash = await db.cabReservation.findFirst({
    where: {
      date,
      id: { not: excludeId },
      startMin: { lt: end },
      endMin: { gt: start },
      OR: [{ roomId: room.id }, { personId }],
    },
    include: { person: true },
  });
  if (!clash) return null;

  const when = `${longDate(date)}, ${minToTime(clash.startMin)}–${minToTime(clash.endMin)}`;
  if (clash.roomId === room.id) {
    return clash.personId === personId
      ? `Există deja o rezervare în ${room.name}: ${when}.`
      : `${room.name} este ocupat de ${clash.person.name}: ${when}.`;
  }
  const other = roomList.find((x) => x.id === clash.roomId)?.name ?? "alt cabinet";
  return `${clash.person.name} are deja ${other}: ${when}.`;
}

/** Chiriașii lucrează doar pe rezervările lor și doar de azi încolo. */
function assertMay(user: ProgUser, personId: string, date: string) {
  if (user.manager) return;
  if (personId !== user.personId) throw new ProgError("Poți modifica doar rezervările tale.", 403);
  if (date < todayStr()) throw new ProgError("Zilele trecute nu mai pot fi modificate.", 403);
}

export type NewReservation = {
  roomId: string;
  personId: string;
  date: string;
  start: number;
  end: number;
  note?: string;
  /** 0 = o singură dată, 1 = săptămânal, 2 = la două săptămâni */
  everyWeeks?: number;
  until?: string;
};

function cleanNote(note: unknown): string | null {
  const s = String(note ?? "").trim().slice(0, 200);
  return s || null;
}

/**
 * Creează o rezervare, opțional repetată până la `until`. Zilele în care
 * intervalul e ocupat sunt sărite și raportate, ca în vechiul programator.
 */
export async function createReservation(user: ProgUser, a: NewReservation) {
  if (!validDate(a.date) || !validSlot(a.start, a.end)) {
    throw new ProgError("Data sau orele nu sunt valide.");
  }
  const personId = user.manager ? a.personId : (user.personId ?? "");
  assertMay(user, personId, a.date);

  const roomList = await rooms();
  const room = roomList.find((r) => r.id === a.roomId);
  if (!room) throw new ProgError("Cabinetul nu există.");
  const person = await db.cabPerson.findUnique({ where: { id: personId } });
  if (!person || !person.active || person.kind === "ADMIN") {
    throw new ProgError("Alege cine ocupă cabinetul.");
  }

  const every = a.everyWeeks === 1 || a.everyWeeks === 2 ? a.everyWeeks : 0;
  const dates = [a.date];
  let series: string | null = null;
  if (every && validDate(a.until) && a.until > a.date) {
    const limit = addDays(a.date, MAX_REPEAT_DAYS);
    const until = a.until < limit ? a.until : limit;
    for (let d = addDays(a.date, 7 * every); d <= until; d = addDays(d, 7 * every)) dates.push(d);
    if (dates.length > 1) series = randomBytes(9).toString("base64url");
  }

  const created: string[] = [];
  const skipped: { date: string; reason: string }[] = [];
  for (const date of dates) {
    const why = await obstacle(room, roomList, personId, date, a.start, a.end);
    if (why) {
      skipped.push({ date, reason: why });
      continue;
    }
    const row = await db.cabReservation.create({
      data: {
        roomId: room.id,
        personId,
        date,
        startMin: a.start,
        endMin: a.end,
        series,
        note: cleanNote(a.note),
        createdBy: user.name,
      },
    });
    created.push(row.id);
  }

  if (created.length === 0) throw new ProgError(skipped[0]?.reason ?? "Intervalul este ocupat.", 409);
  return { created: created.length, skipped };
}

export async function updateReservation(
  user: ProgUser,
  id: string,
  a: Partial<Pick<NewReservation, "roomId" | "personId" | "date" | "start" | "end" | "note">>,
) {
  const cur = await db.cabReservation.findUnique({ where: { id } });
  if (!cur) throw new ProgError("Rezervarea nu mai există.", 404);
  assertMay(user, cur.personId, cur.date);

  const n = {
    roomId: a.roomId ?? cur.roomId,
    personId: user.manager ? (a.personId ?? cur.personId) : cur.personId,
    date: a.date ?? cur.date,
    start: a.start ?? cur.startMin,
    end: a.end ?? cur.endMin,
  };
  if (!validDate(n.date) || !validSlot(n.start, n.end)) {
    throw new ProgError("Data sau orele nu sunt valide.");
  }
  assertMay(user, n.personId, n.date);

  const roomList = await rooms();
  const room = roomList.find((r) => r.id === n.roomId);
  if (!room) throw new ProgError("Cabinetul nu există.");
  if (n.personId !== cur.personId) {
    const person = await db.cabPerson.findUnique({ where: { id: n.personId } });
    if (!person || !person.active || person.kind === "ADMIN") {
      throw new ProgError("Alege cine ocupă cabinetul.");
    }
  }

  const why = await obstacle(room, roomList, n.personId, n.date, n.start, n.end, id);
  if (why) throw new ProgError(why, 409);

  await db.cabReservation.update({
    where: { id },
    data: {
      roomId: n.roomId,
      personId: n.personId,
      date: n.date,
      startMin: n.start,
      endMin: n.end,
      ...(a.note !== undefined ? { note: cleanNote(a.note) } : {}),
    },
  });
}

/** `following`: șterge și repetările de după aceasta, din aceeași serie. */
export async function deleteReservation(user: ProgUser, id: string, following: boolean) {
  const cur = await db.cabReservation.findUnique({ where: { id } });
  if (!cur) return 0;
  assertMay(user, cur.personId, cur.date);

  if (following && cur.series) {
    const res = await db.cabReservation.deleteMany({
      where: { series: cur.series, date: { gte: cur.date } },
    });
    return res.count;
  }
  await db.cabReservation.delete({ where: { id } });
  return 1;
}
