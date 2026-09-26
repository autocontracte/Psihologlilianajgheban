import "server-only";

import { randomBytes } from "node:crypto";
import { db } from "../db";
import { trimiteEmail, CABINET_EMAIL } from "../email";
import { SITE } from "@/content/site";
import { genereazaInterpretare } from "./ai";
import { calculeaza, type Raspunsuri } from "./test";

/* ----------------------------------------------------------------------------
   Kitul „Cum stai, de fapt, cu relația ta?": test + raport personal + ghid.

   O comandă (tabelul GuideOrder) ține tot: răspunsurile, emailul, plata și
   interpretarea. Accesul la rezultat e prin token — 32 de octeți aleatori,
   imposibil de ghicit.
   -------------------------------------------------------------------------- */

export { interpretareaActiva } from "./ai";

export { PRET_KIT_BANI, PRET_KIT_LEI, NUME_KIT } from "./pret";
import { PRET_KIT_BANI, NUME_KIT } from "./pret";

export async function creeazaComanda() {
  return db.guideOrder.create({
    data: { token: randomBytes(32).toString("base64url"), amount: PRET_KIT_BANI },
  });
}

export async function getComanda(token: string) {
  return db.guideOrder.findUnique({ where: { token } });
}

export function raspunsuriComanda(comanda: { answers: string }): Raspunsuri {
  try {
    const r = JSON.parse(comanda.answers);
    return r && typeof r === "object" ? (r as Raspunsuri) : {};
  } catch {
    return {};
  }
}

/** Salvează răspunsurile (le înlocuiește pe cele vechi) și, opțional, emailul. */
export async function salveazaComanda(token: string, raspunsuri: Raspunsuri, email?: string) {
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

/* ---------- Generarea interpretării ----------

   Durează în jur de un minut (raportul e lung), așa că rulează în fundal:
   plata se confirmă imediat, iar pagina rezultatului întreabă din câteva în
   câteva secunde dacă e gata. Lacătul (pe globalThis, ca să fie unul singur
   pe proces) împiedică două generări simultane pentru aceeași comandă. */

type Lacat = Map<string, Promise<{ ok: boolean; error?: string }>>;
const g = globalThis as unknown as { __kitGenerari?: Lacat };
const generari: Lacat = (g.__kitGenerari ??= new Map());

export const seGenereaza = (token: string) => generari.has(token);

/**
 * Generează interpretarea și o salvează. Dacă există deja, n-o mai generează
 * (doar la cererea explicită din admin: `refa`). Nu aruncă niciodată.
 */
export function genereazaSiSalveaza(token: string, refa = false) {
  const existenta = generari.get(token);
  if (existenta) return existenta;

  const lucru = (async () => {
    try {
      const comanda = await db.guideOrder.findUnique({ where: { token } });
      if (!comanda) return { ok: false, error: "Comanda nu există." };
      if (comanda.interpretation && !refa) return { ok: true };

      const rezultat = await genereazaInterpretare(raspunsuriComanda(comanda));
      if (!rezultat.ok) {
        console.error("[kit] interpretare esuata", rezultat.error);
        return { ok: false, error: rezultat.error };
      }
      await db.guideOrder.update({
        where: { token },
        data: { interpretation: JSON.stringify(rezultat.raport) },
      });
      return { ok: true };
    } catch (err) {
      console.error("[kit] interpretare esuata", err);
      return { ok: false, error: err instanceof Error ? err.message : "Eroare." };
    } finally {
      generari.delete(token);
    }
  })();

  generari.set(token, lucru);
  return lucru;
}

/* ---------- După plată ---------- */

/**
 * Marchează comanda plătită, pornește interpretarea în fundal și trimite
 * linkul pe email. Idempotentă: o a doua chemare nu mai face nimic.
 */
export async function confirmaPlata(comandaId: string, email?: string | null) {
  const comanda = await db.guideOrder.findUnique({ where: { id: comandaId } });
  if (!comanda || comanda.status === "PAID") return;

  const actualizata = await db.guideOrder.update({
    where: { id: comanda.id },
    data: { status: "PAID", paidAt: new Date(), ...(email ? { email } : {}) },
  });

  void genereazaSiSalveaza(actualizata.token);

  const link = `${SITE.url}/kit/rezultat/${actualizata.token}`;
  const rez = calculeaza(raspunsuriComanda(actualizata));

  if (actualizata.email) {
    await trimiteEmail({
      to: actualizata.email,
      replyTo: SITE.email,
      subject: `Kitul tău: „${NUME_KIT}”`,
      text:
        `Bună,\n\nÎți mulțumesc că ai ales kitul „${NUME_KIT}”.\n\n` +
        `Raportul tău personal, ghidul complet și toate materialele sunt aici, oricând vrei să revii la ele:\n${link}\n\n` +
        `Interpretarea personală se scrie pe baza răspunsurilor tale și e gata în câteva minute. ` +
        `De pe aceeași pagină descarci raportul în PDF și ghidul de 63 de pagini.\n\n` +
        `Păstrează acest email: linkul e doar al tău. Dacă după ce citești raportul simți nevoia să vorbim, ` +
        `te poți programa oricând aici: ${SITE.url}/programari\n\n` +
        `Cu drag,\nLiliana Jgheban\nPsiholog`,
    });
  }

  if (CABINET_EMAIL) {
    await trimiteEmail({
      to: CABINET_EMAIL,
      subject: `Kit nou: ${actualizata.email ?? "fără email"}${rez ? ` · indice ${rez.indice}/100` : ""}`,
      text:
        `A fost cumpărat un kit „${NUME_KIT}”.\n\n` +
        `Email: ${actualizata.email ?? "—"}\n` +
        (rez ? `Indicele relației: ${rez.indice}/100 (${rez.profil.nume})\n` : "") +
        `\nDetaliile sunt în panou: ${SITE.url}/admin/kit`,
    });
  }
}
