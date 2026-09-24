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

/**
 * Creează o comandă nouă (la începutul chestionarului).
 * Evaluarea psihologică gratuită folosește același chestionar, cu suma 0 —
 * așa se deosebește în admin de o comandă a ghidului.
 */
export async function creeazaComanda(suma: number = PRET_GHID_BANI) {
  return db.guideOrder.create({
    data: { token: tokenNou(), amount: suma },
  });
}

/** O comandă cu suma 0 e o evaluare gratuită, nu o comandă a ghidului. */
export const eEvaluareGratuita = (comanda: { amount: number }) => comanda.amount === 0;

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
 *
 * Dacă interpretarea există deja (de exemplu, omul a făcut întâi evaluarea
 * gratuită și apoi a cumpărat ghidul), n-o mai generăm din nou — doar la
 * cererea explicită din admin (`refa`).
 */
export async function genereazaSiSalveaza(token: string, refa = false) {
  const comanda = await db.guideOrder.findUnique({ where: { token } });
  if (!comanda) return { ok: false as const, error: "Comanda nu există." };
  if (comanda.interpretation && !refa) return { ok: true as const };

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
