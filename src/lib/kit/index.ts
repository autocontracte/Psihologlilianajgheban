import "server-only";

import { randomBytes } from "node:crypto";
import { db } from "../db";
import { trimiteEmail, CABINET_EMAIL } from "../email";
import { compuneEmail } from "../emailSablon";
import { SITE } from "@/content/site";
import { genereazaInterpretare } from "./ai";
import { calculeaza, type Raspunsuri } from "./test";
import { genereazaRaportParte } from "../ghid/ai";
import { dateParte } from "../ghid/comanda";
import { numeParte, PRET_PARTE_BANI } from "../ghid/parti";

/* ----------------------------------------------------------------------------
   Trusa de ajutor „Cum stai, de fapt, în relația ta?": test + raport personal + ghid.

   O comandă (tabelul GuideOrder) ține tot: răspunsurile, emailul, plata și
   interpretarea. Accesul la rezultat e prin token — 32 de octeți aleatori,
   imposibil de ghicit.
   -------------------------------------------------------------------------- */

export { interpretareaActiva } from "./ai";

export { PRET_KIT_BANI, PRET_KIT_LEI, NUME_KIT } from "./pret";
import { PRET_KIT_BANI, NUME_KIT } from "./pret";

/** O comandă nouă. Cu `chestionar` (1–6): o parte a ghidului; fără: trusa veche. */
export async function creeazaComanda(chestionar?: number) {
  return db.guideOrder.create({
    data: {
      token: randomBytes(32).toString("base64url"),
      amount: chestionar ? PRET_PARTE_BANI : PRET_KIT_BANI,
      ...(chestionar ? { chestionar } : {}),
    },
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
export async function salveazaComanda(token: string, raspunsuri: Raspunsuri | undefined, email?: string) {
  const comanda = await db.guideOrder.findUnique({ where: { token } });
  if (!comanda) return null;
  // O comandă plătită nu-și mai schimbă răspunsurile.
  if (comanda.status === "PAID") return comanda;

  return db.guideOrder.update({
    where: { token },
    data: {
      ...(raspunsuri ? { answers: JSON.stringify(raspunsuri) } : {}),
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

      // Ghidul pe părți: raportul pe partea aleasă (sau, până la alegere, cea recomandată)
      const pe = dateParte(comanda);
      const rezultat = pe
        ? await genereazaRaportParte(pe.chestionar, pe.parte, pe.raspunsuri)
        : await genereazaInterpretare(raspunsuriComanda(comanda));
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

  const pe = dateParte(actualizata);
  if (pe) {
    await emailuriParte(actualizata.email, link, numeParte(pe.parte), pe.parte.pagini, pe.rezultat?.indice);
    return;
  }
  const rez = calculeaza(raspunsuriComanda(actualizata));

  if (actualizata.email) {
    await trimiteEmail({
      to: actualizata.email,
      replyTo: SITE.email,
      subject: `Trusa ta de ajutor: „${NUME_KIT}”`,
      ...compuneEmail({
        eticheta: "Trusa ta de ajutor",
        titlu: NUME_KIT,
        previzualizare: "Raportul tău personal și ghidul complet te așteaptă.",
        salut: "Bună,",
        semnatura: true,
        paragrafe: [
          `Îți mulțumesc că ai ales trusa de ajutor „${NUME_KIT}”. Raportul tău personal, ghidul complet și toate materialele sunt pe pagina ta, oricând vrei să revii la ele.`,
        ],
        buton: { text: "Deschide raportul", href: link },
        dupaDetalii: [
          "Interpretarea personală se scrie pe baza răspunsurilor tale și e gata în câteva minute. De pe aceeași pagină descarci raportul în PDF și ghidul de 79 de pagini.",
          "Păstrează acest email: linkul e doar al tău. Dacă după ce citești raportul simți nevoia să vorbim, te poți programa oricând.",
        ],
        linkuri: [{ text: "Programează o ședință", href: `${SITE.url}/programari` }],
      }),
    });
  }

  if (CABINET_EMAIL) {
    await trimiteEmail({
      to: CABINET_EMAIL,
      subject: `Trusă nouă: ${actualizata.email ?? "fără email"}${rez ? ` · indice ${rez.indice}/100` : ""}`,
      ...compuneEmail({
        intern: true,
        eticheta: "Trusă cumpărată",
        titlu: `O trusă nouă „${NUME_KIT}”`,
        detalii: [
          { eticheta: "Email", valoare: actualizata.email ?? "—" },
          ...(rez ? [{ eticheta: "Indicele relației", valoare: `${rez.indice}/100 (${rez.profil.nume})` }] : []),
        ],
        buton: { text: "Deschide în panou", href: `${SITE.url}/admin/kit` },
      }),
    });
  }
}

/** Emailurile de după cumpărarea unei părți a ghidului. */
async function emailuriParte(email: string | null, link: string, nume: string, pagini: number, indice?: number) {
  if (email) {
    await trimiteEmail({
      to: email,
      replyTo: SITE.email,
      subject: `Ghidul tău: „${nume}”`,
      ...compuneEmail({
        eticheta: "Ghidul tău",
        titlu: nume,
        previzualizare: "Raportul tău personal și partea ta din ghid te așteaptă.",
        salut: "Bună,",
        semnatura: true,
        paragrafe: [
          `Îți mulțumesc că ai ales „${nume}” din ghidul practic despre cuplu, divorț și familie. Raportul tău personal și partea ta din ghid sunt pe pagina ta, oricând vrei să revii la ele.`,
        ],
        buton: { text: "Deschide raportul", href: link },
        dupaDetalii: [
          `Raportul personal se scrie pe baza răspunsurilor tale și e gata în câteva minute. De pe aceeași pagină descarci un singur PDF: raportul tău, urmat de partea din ghid (${pagini} de pagini).`,
          "Păstrează acest email: linkul e doar al tău. Dacă după ce citești simți nevoia să vorbim, te poți programa oricând.",
        ],
        linkuri: [{ text: "Programează o ședință", href: `${SITE.url}/programari` }],
      }),
    });
  }

  if (CABINET_EMAIL) {
    await trimiteEmail({
      to: CABINET_EMAIL,
      subject: `Ghid cumpărat: ${nume} · ${email ?? "fără email"}`,
      ...compuneEmail({
        intern: true,
        eticheta: "Ghid cumpărat",
        titlu: nume,
        detalii: [
          { eticheta: "Email", valoare: email ?? "—" },
          ...(indice !== undefined ? [{ eticheta: "Cât de greu e acum", valoare: `${indice}/100` }] : []),
        ],
        buton: { text: "Deschide în panou", href: `${SITE.url}/admin/kit` },
      }),
    });
  }
}
