import "server-only";

import { db } from "@/lib/db";

/* ============================================================================
   Calculele pentru panoul „Vizite”: de unde vin oamenii, ce pagini deschid,
   cât stau pe fiecare, pe ce apasă și câți ajung la o programare.

   Datele vin din tabelele Visit și VisitEvent, scrise de /api/urmarire.
   ========================================================================== */

export type Vizita = {
  id: string;
  startedAt: Date;
  lastSeenAt: Date;
  referrer: string;
  source: string;
  medium: string;
  campaign: string;
  landing: string;
  device: string;
  browser: string;
  country: string;
  city: string;
  userId: string | null;
  pages: number;
  events: number;
  booked: boolean;
};

export type Eveniment = {
  visitId: string;
  at: Date;
  type: string;
  path: string;
  detail: string;
};

/* Praguri, ca o lună cu mult trafic să nu încarce megaocteți de evenimente. */
const MAX_VIZITE = 3000;
const MAX_EVENIMENTE = 40_000;

export async function incarcaVizite(de: Date) {
  const vizite = (await db.visit.findMany({
    where: { startedAt: { gte: de } },
    orderBy: { startedAt: "desc" },
    take: MAX_VIZITE,
  })) as Vizita[];

  const evenimente = (await db.visitEvent.findMany({
    where: { visitId: { in: vizite.map((v) => v.id) } },
    orderBy: { at: "asc" },
    take: MAX_EVENIMENTE,
    select: { visitId: true, at: true, type: true, path: true, detail: true },
  })) as Eveniment[];

  /* Numele clienților autentificați, ca vizita să se poată lega de un om. */
  const ids = [...new Set(vizite.map((v) => v.userId).filter(Boolean))] as string[];
  const conturi = ids.length
    ? await db.user.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true, email: true },
      })
    : [];

  return {
    vizite,
    evenimente,
    conturi: new Map(conturi.map((u) => [u.id, u])),
  };
}

/** De unde a venit vizita, într-un cuvânt-două. */
export function sursa(v: Pick<Vizita, "source" | "medium" | "referrer">) {
  if (v.source) return v.medium ? `${v.source} (${v.medium})` : v.source;
  const r = v.referrer.replace(/^www\./, "");
  if (!r) return "direct";
  if (/google\./.test(r)) return "google";
  if (/facebook\.|fb\./.test(r)) return "facebook";
  if (/instagram\./.test(r)) return "instagram";
  if (/bing\./.test(r)) return "bing";
  if (/chatgpt|openai|perplexity|claude\.ai|gemini/.test(r)) return `AI · ${r}`;
  return r;
}

export const durata = (v: Pick<Vizita, "startedAt" | "lastSeenAt">) =>
  Math.max(0, (v.lastSeenAt.getTime() - v.startedAt.getTime()) / 1000);

export function formateazaDurata(sec: number) {
  if (sec < 1) return "0s";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return m ? `${m}m ${String(s).padStart(2, "0")}s` : `${s}s`;
}

const numara = <T,>(lista: T[], cheie: (x: T) => string): [string, number][] => {
  const m = new Map<string, number>();
  for (const x of lista) {
    const k = cheie(x);
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

const vizitatoriCu = (ev: Eveniment[], tip: string) =>
  new Set(ev.filter((e) => e.type === tip).map((e) => e.visitId)).size;

/** Peste atât, fila a rămas uitată deschisă — nu mai numărăm timpul. */
const PAGINA_MAX_SEC = 30 * 60;
/** O vizită „cu interes”: mai mult de o pagină sau peste 10 secunde pe site. */
const INTERES_SEC = 10;
/** Cât timp după ultimul semn de viață rămâne vizita „în direct”. */
const LIVE_MS = 60_000;

export function sinteza(vizite: Vizita[], evenimente: Eveniment[], acum: number) {
  const peVizita = new Map<string, Eveniment[]>();
  for (const e of evenimente) {
    const l = peVizita.get(e.visitId);
    if (l) l.push(e);
    else peVizita.set(e.visitId, [e]);
  }
  const ultimSemn = new Map(vizite.map((v) => [v.id, v.lastSeenAt.getTime()]));

  /* Timpul pe fiecare pagină: de la deschiderea ei până la pagina următoare
     (sau până la ultimul semn de viață al vizitei). */
  const timpPagini = new Map<string, { afisari: number; total: number }>();
  for (const [id, lista] of peVizita) {
    const pagini = lista.filter((e) => e.type === "pagina");
    pagini.forEach((p, i) => {
      const start = p.at.getTime();
      const sfarsit =
        i < pagini.length - 1 ? pagini[i + 1].at.getTime() : (ultimSemn.get(id) ?? start);
      const cur = timpPagini.get(p.path) ?? { afisari: 0, total: 0 };
      cur.afisari++;
      cur.total += Math.min(Math.max(0, (sfarsit - start) / 1000), PAGINA_MAX_SEC);
      timpPagini.set(p.path, cur);
    });
  }

  const durate = vizite.map(durata);
  const cuInteres = vizite.filter((v) => v.pages > 1 || durata(v) >= INTERES_SEC);

  /* Vizitele pe zi, pentru graficul de sus (ziua în ora României). */
  const zi = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const peZile = new Map<string, number>();
  for (const v of vizite) {
    const k = zi.format(v.startedAt);
    peZile.set(k, (peZile.get(k) ?? 0) + 1);
  }

  return {
    live: vizite.filter((v) => acum - v.lastSeenAt.getTime() < LIVE_MS),
    total: vizite.length,
    cuInteres: cuInteres.length,
    durataMedie: durate.length ? durate.reduce((a, b) => a + b, 0) / durate.length : 0,
    paginiPeVizita: vizite.length
      ? vizite.reduce((a, v) => a + v.pages, 0) / vizite.length
      : 0,
    programari: vizite.filter((v) => v.booked).length,
    programariIncepute: vizitatoriCu(evenimente, "programare_start"),
    plati: evenimente.filter((e) => e.type === "plata").length,
    telefon: evenimente.filter((e) => e.type === "telefon").length,
    whatsapp: evenimente.filter((e) => e.type === "whatsapp").length,
    email: evenimente.filter((e) => e.type === "email").length,
    formulare: evenimente.filter((e) => e.type === "formular").length,
    ana: vizitatoriCu(evenimente, "ana_mesaj"),
    kitIncepute: vizitatoriCu(evenimente, "kit_start"),
    kitGata: vizitatoriCu(evenimente, "kit_gata"),
    contracte: evenimente.filter((e) => e.type === "contract_semnat").length,
    surse: numara(vizite, sursa),
    campanii: numara(vizite, (v) => v.campaign),
    dispozitive: numara(vizite, (v) => v.device || "necunoscut"),
    orase: numara(vizite, (v) => [v.city, v.country].filter(Boolean).join(", ")),
    primaPagina: numara(vizite, (v) => v.landing),
    pagini: [...timpPagini.entries()]
      .map(([cale, p]) => ({ cale, afisari: p.afisari, mediu: p.total / p.afisari }))
      .sort((a, b) => b.afisari - a.afisari),
    clicuri: numara(
      evenimente.filter((e) => ["clic", "telefon", "whatsapp", "email"].includes(e.type)),
      (e) => e.detail,
    ),
    sectiuni: numara(
      evenimente.filter((e) => e.type === "sectiune"),
      (e) => `${e.path === "/" ? "acasă" : e.path} · ${e.detail}`,
    ),
    intrebari: numara(
      evenimente.filter((e) => e.type === "intrebare"),
      (e) => e.detail,
    ),
    derulare: numara(
      evenimente.filter((e) => e.type === "derulare"),
      (e) => e.detail,
    ).sort((a, b) => Number.parseInt(a[0]) - Number.parseInt(b[0])),
    peZile: [...peZile.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    peVizita,
  };
}

export type Sinteza = ReturnType<typeof sinteza>;
