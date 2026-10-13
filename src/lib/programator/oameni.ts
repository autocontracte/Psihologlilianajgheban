import "server-only";

import { db } from "../db";
import { hashPassword, passwordProblem } from "../auth";
import { endSessionsOf, type ProgUser } from "./auth";
import { ProgError } from "./date";
import { KINDS, PALETTE, initialsOf, parseDays, type Kind } from "./reguli";

/* Administrarea oamenilor și a cabinetelor — doar pentru administratori. */

export type PersonAdmin = {
  id: string;
  name: string;
  initials: string;
  color: string;
  kind: Kind;
  manager: boolean;
  active: boolean;
  username: string | null;
  hasPassword: boolean;
};

export async function peopleAdmin(): Promise<PersonAdmin[]> {
  const rows = await db.cabPerson.findMany({ orderBy: [{ position: "asc" }, { name: "asc" }] });
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    initials: p.initials,
    color: p.color,
    kind: p.kind as Kind,
    manager: p.manager,
    active: p.active,
    username: p.username,
    hasPassword: !!p.passwordHash,
  }));
}

type Input = Record<string, unknown>;

async function fields(b: Input, currentId = "") {
  const data: {
    name?: string;
    initials?: string;
    color?: string;
    kind?: string;
    manager?: boolean;
    active?: boolean;
    username?: string | null;
    passwordHash?: string;
  } = {};

  if (b.name !== undefined) {
    const name = String(b.name).trim().replace(/\s+/g, " ").slice(0, 80);
    if (name.length < 2) throw new ProgError("Scrie numele.");
    data.name = name;
    data.initials = initialsOf(name);
  }
  if (b.initials !== undefined && String(b.initials).trim()) {
    data.initials = String(b.initials).trim().slice(0, 3).toUpperCase();
  }
  if (b.color !== undefined) {
    const color = String(b.color);
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) throw new ProgError("Culoarea nu e validă.");
    data.color = color;
  }
  if (b.kind !== undefined) {
    if (!KINDS.includes(b.kind as Kind)) throw new ProgError("Tipul nu e valid.");
    data.kind = b.kind as Kind;
  }
  if (b.manager !== undefined) data.manager = !!b.manager;
  if (data.kind === "ADMIN") data.manager = true;
  if (b.active !== undefined) data.active = !!b.active;

  if (b.username !== undefined) {
    const username = String(b.username).trim().toLowerCase();
    if (!username) {
      data.username = null;
    } else {
      if (!/^[a-z0-9._-]{3,40}$/.test(username)) {
        throw new ProgError("Utilizatorul poate avea doar litere mici, cifre, punct, liniuță (minimum 3).");
      }
      const taken = await db.cabPerson.findUnique({ where: { username } });
      if (taken && taken.id !== currentId) throw new ProgError("Există deja un cont cu acest utilizator.");
      data.username = username;
    }
  }
  if (b.password !== undefined && String(b.password)) {
    const problem = passwordProblem(String(b.password));
    if (problem) throw new ProgError(problem);
    data.passwordHash = await hashPassword(String(b.password));
  }
  return data;
}

export async function createPerson(b: Input) {
  const data = await fields(b);
  if (!data.name) throw new ProgError("Scrie numele.");
  const count = await db.cabPerson.count();
  await db.cabPerson.create({
    data: {
      name: data.name,
      initials: data.initials ?? initialsOf(data.name),
      color: data.color ?? PALETTE[count % PALETTE.length],
      kind: data.kind ?? "CHIRIAS",
      manager: data.manager ?? false,
      username: data.username ?? null,
      passwordHash: data.passwordHash,
      position: count,
    },
  });
}

export async function updatePerson(user: ProgUser, id: string, b: Input) {
  const cur = await db.cabPerson.findUnique({ where: { id } });
  if (!cur) throw new ProgError("Persoana nu mai există.", 404);
  const data = await fields(b, id);

  // nu îți poți tăia singur accesul din greșeală
  if (id === user.personId && (data.manager === false || data.active === false)) {
    throw new ProgError("Nu îți poți retrage singur drepturile. Roagă alt administrator.");
  }

  await db.cabPerson.update({ where: { id }, data });
  if (data.passwordHash || data.active === false) {
    if (id !== user.personId) await endSessionsOf(id);
  }
}

export async function updateRoom(id: string, b: Input) {
  const cur = await db.cabRoom.findUnique({ where: { id } });
  if (!cur) throw new ProgError("Cabinetul nu mai există.", 404);

  const data: { name?: string; ownerId?: string | null; ownerWeekdays?: string } = {};
  if (b.name !== undefined) {
    const name = String(b.name).trim().slice(0, 60);
    if (!name) throw new ProgError("Scrie numele cabinetului.");
    data.name = name;
  }
  if (b.ownerId !== undefined) {
    const ownerId = String(b.ownerId ?? "");
    const owner = ownerId ? await db.cabPerson.findUnique({ where: { id: ownerId } }) : null;
    if (ownerId && (!owner || owner.kind === "ADMIN")) throw new ProgError("Persoana nu există.");
    data.ownerId = ownerId || null;
  }
  if (b.ownerDays !== undefined) {
    data.ownerWeekdays = parseDays(Array.isArray(b.ownerDays) ? b.ownerDays.join(",") : "").join(",");
  }
  if (data.ownerId === null) data.ownerWeekdays = "";

  await db.cabRoom.update({ where: { id }, data });
}
