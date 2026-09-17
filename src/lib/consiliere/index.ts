import "server-only";

import { randomBytes } from "node:crypto";
import { db } from "../db";
import { genereazaInterpretare } from "./ai";
import type { Raspunsuri } from "./intrebari";

export { interpretareaActiva } from "./ai";
export const PRET_GHID_BANI = 5000; // 50 lei

function tokenNou(): string {
  return randomBytes(32).toString("base64url");
}

/** Creează o comandă nouă (la începutul chestionarului). */
export async function creeazaComanda() {
  return db.guideOrder.create({
    data: { token: tokenNou(), amount: PRET_GHID_BANI },
  });
}

export async function getComanda(token: string) {
  return db.guideOrder.findUnique({ where: { token } });
}

/** Salvează răspunsurile (le înlocuiește pe cele vechi) și, opțional, emailul. */
export async function salveazaComanda(
  token: string,
  raspunsuri: Raspunsuri,
  email?: string,
) {
  const comanda = await db.guideOrder.findUnique({ where: { token } });
  if (!comanda) return null;
  // O comandă plătită nu-și mai schimbă răspunsurile.
  if (comanda.status === "PAID") return comanda;

  return db.guideOrder.update({
    where: { token },
    data: {
      answers: JSON.stringify(raspunsuri),
      ...(email !== undefined ? { email: email.trim().toLowerCase() || null } : {}),
    },
  });
}

/**
 * Generează interpretarea și o salvează în comandă.
 *
 * Se cheamă după confirmarea plății (din webhook) sau manual, din admin.
 * Prins în try/catch de apelanți — o eroare de AI nu trebuie să blocheze
 * confirmarea plății.
 */
export async function genereazaSiSalveaza(token: string) {
  const comanda = await db.guideOrder.findUnique({ where: { token } });
  if (!comanda) return { ok: false as const, error: "Comanda nu există." };

  let raspunsuri: Raspunsuri = {};
  try {
    raspunsuri = JSON.parse(comanda.answers) as Raspunsuri;
  } catch {
    /* rămâne gol */
  }

  const rezultat = await genereazaInterpretare(raspunsuri);
  if (!rezultat.ok) return rezultat;

  await db.guideOrder.update({
    where: { token },
    data: { interpretation: rezultat.text },
  });
  return { ok: true as const };
}
