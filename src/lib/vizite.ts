import "server-only";

import { db } from "@/lib/db";

/* ============================================================================
   Calculele pentru panoul „Vizite”: de unde vin oamenii, ce pagini deschid,
   cât stau pe fiecare, pe ce apasă, cine se întoarce și câți ajung la o
   programare. Datele vin din Visit, VisitEvent și Visitor, scrise de
   /api/urmarire.
   ========================================================================== */

export type Vizita = {
  id: string;
  startedAt: Date;
  lastSeenAt: Date;
  referrer: string;
  source: string;
  medium: string;
  campaign: string;
  gclid: string;
  term: string;
  content: string;
  landing: string;
  exitPath: string;
  device: string;
  browser: string;
  os: string;
  screenW: number | null;
  viewW: number | null;
  lang: string;
  timezone: string;
  connection: string;
  country: string;
  city: string;
  region: string;
  consent: string;
  ip: string;
  userId: string | null;
  visitorId: string | null;
  visitNo: number;
  pages: number;
  events: number;
  clicks: number;
  activeSec: number;
  maxScroll: number;
  lcp: number | null;
  inp: number | null;
  cls: number | null;
  errors: number;
  booked: boolean;
};

export type Eveniment = {
  visitId: string;
  at: Date;
  type: string;
  path: string;
  detail: string;
};

export type Om = {
  id: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  visits: number;
  firstReferrer: string;
  firstSource: string;
  firstMedium: string;
  firstCampaign: string;
  firstLanding: string;
  userId: string | null;
  booked: boolean;
  bookedAt: Date | null;
  visitsToBook: number | null;
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

  /* Oamenii din spatele vizitelor (cei care au acceptat cookie-urile). */
  const omIds = [...new Set(vizite.map((v) => v.visitorId).filter(Boolean))] as string[];
  const oameni = omIds.length
    ? ((await db.visitor.findMany({
        where: { id: { in: omIds } },
        orderBy: { lastSeenAt: "desc" },
      })) as Om[])
    : [];

  /* Numele clienților autentificați, ca vizita să se poată lega de un om. */
  const userIds = [
    ...new Set([
      ...vizite.map((v) => v.userId).filter(Boolean),
      ...oameni.map((o) => o.userId).filter(Boolean),
    ]),
  ] as string[];
  const conturi = userIds.length
    ? await db.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      })
    : [];

  return {
    vizite,
    evenimente,
    oameni,
    conturi: new Map(conturi.map((u) => [u.id, u])),
  };
}

/** De unde a venit vizita, într-un cuvânt-două. */
export function sursa(v: { source: string; medium: string; referrer: string }) {
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

/** Prima sursă a unui om, în aceeași formă. */
export const sursaOmului = (o: Om) =>
  sursa({ source: o.firstSource, medium: o.firstMedium, referrer: o.firstReferrer });

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

/** Mediana: la viteza paginii spune mai mult decât media, pe care o strică
    o singură încărcare proastă. */
function mediana(valori: number[]) {
  if (!valori.length) return 0;
  const s = [...valori].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

const medie = (valori: number[]) =>
  valori.length ? valori.reduce((a, b) => a + b, 0) / valori.length : 0;

/** Peste atât, fila a rămas uitată deschisă — nu mai numărăm timpul. */
const PAGINA_MAX_SEC = 30 * 60;
/** O vizită „cu interes”: mai mult de o pagină sau peste 10 secunde pe site. */
const INTERES_SEC = 10;
/** Cât timp după ultimul semn de viață rămâne vizita „în direct”. */
const LIVE_MS = 60_000;

export function sinteza(
  vizite: Vizita[],
  evenimente: Eveniment[],
  oameni: Om[],
  acum: number,
) {
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

  /* Pâlnia: de la o vizită oarecare până la programarea trimisă. */
  const auVazutProgramari = new Set(
    evenimente
      .filter((e) => e.type === "pagina" && e.path.startsWith("/programari"))
      .map((e) => e.visitId),
  );

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

  const cuAcord = vizite.filter((v) => v.consent === "acceptat");
  const recunoscute = vizite.filter((v) => v.visitorId);

  /* Vizitele venite dintr-o reclamă plătită: `gclid` îl pune Google Ads singur
     (etichetare automată), iar utm_medium=cpc acoperă și restul reclamelor. */
  const dinReclame = vizite.filter(
    (v) => v.gclid || v.medium === "cpc" || /ads|cpc|ppc/i.test(v.source),
  );
  const idReclame = new Set(dinReclame.map((v) => v.id));
  const evReclame = evenimente.filter((e) => idReclame.has(e.visitId));
  const organice = vizite.filter((v) => !idReclame.has(v.id));

  return {
    live: vizite.filter((v) => acum - v.lastSeenAt.getTime() < LIVE_MS),
    total: vizite.length,
    cuInteres: cuInteres.length,
    durataMedie: medie(durate),
    timpActivMediu: medie(vizite.map((v) => v.activeSec)),
    derulareMedie: medie(vizite.filter((v) => v.maxScroll > 0).map((v) => v.maxScroll)),
    clicuriMedii: medie(vizite.map((v) => v.clicks)),
    paginiPeVizita: vizite.length
      ? vizite.reduce((a, v) => a + v.pages, 0) / vizite.length
      : 0,

    /* Acordul pentru cookie-uri */
    acordAcceptat: cuAcord.length,
    acordRefuzat: vizite.filter((v) => v.consent === "refuzat").length,
    acordFara: vizite.filter((v) => !v.consent).length,

    /* Oameni recunoscuți între vizite */
    recunoscuti: recunoscute.length,
    reveniri: recunoscute.filter((v) => v.visitNo > 1).length,
    oameni: oameni.length,
    oameniCuProgramare: oameni.filter((o) => o.booked).length,
    vizitePanaLaProgramare: medie(
      oameni.filter((o) => o.visitsToBook).map((o) => o.visitsToBook as number),
    ),

    /* Din reclame: cât din trafic vine plătit și ce face față de restul. */
    reclame: {
      vizite: dinReclame.length,
      procentDinTot: vizite.length
        ? Math.round((dinReclame.length / vizite.length) * 100)
        : 0,
      programari: dinReclame.filter((v) => v.booked).length,
      programariIncepute: vizitatoriCu(evReclame, "programare_start"),
      telefon: evReclame.filter((e) => ["telefon", "whatsapp"].includes(e.type)).length,
      ana: vizitatoriCu(evReclame, "ana_mesaj"),
      timpActiv: medie(dinReclame.map((v) => v.activeSec)),
      timpActivOrganic: medie(organice.map((v) => v.activeSec)),
      programariOrganice: organice.filter((v) => v.booked).length,
      viziteOrganice: organice.length,
      campanii: numara(dinReclame, (v) => v.campaign),
      cuvinte: numara(dinReclame, (v) => v.term),
      anunturi: numara(dinReclame, (v) => v.content),
      pagini: numara(dinReclame, (v) => v.landing),
    },

    /* Pâlnia */
    palnie: [
      { eticheta: "Au intrat pe site", n: vizite.length },
      { eticheta: "Au stat peste 10 secunde", n: cuInteres.length },
      { eticheta: "Au deschis pagina de programare", n: auVazutProgramari.size },
      { eticheta: "Au început o programare", n: vizitatoriCu(evenimente, "programare_start") },
      { eticheta: "Au trimis programarea", n: vizite.filter((v) => v.booked).length },
    ],

    programari: vizite.filter((v) => v.booked).length,
    programariIncepute: vizitatoriCu(evenimente, "programare_start"),
    abandonuri: evenimente.filter((e) => e.type === "abandon").length,
    plati: evenimente.filter((e) => e.type === "plata").length,
    telefon: evenimente.filter((e) => e.type === "telefon").length,
    whatsapp: evenimente.filter((e) => e.type === "whatsapp").length,
    email: evenimente.filter((e) => e.type === "email").length,
    formulare: evenimente.filter((e) => e.type === "formular").length,
    ana: vizitatoriCu(evenimente, "ana_mesaj"),
    kitIncepute: vizitatoriCu(evenimente, "kit_start"),
    kitGata: vizitatoriCu(evenimente, "kit_gata"),
    contracte: evenimente.filter((e) => e.type === "contract_semnat").length,

    /* Clasamente */
    surse: numara(vizite, sursa),
    campanii: numara(vizite, (v) => v.campaign),
    dispozitive: numara(vizite, (v) => v.device || "necunoscut"),
    sisteme: numara(vizite, (v) => [v.os, v.browser].filter(Boolean).join(" · ")),
    limbi: numara(vizite, (v) => v.lang),
    conexiuni: numara(vizite, (v) => v.connection),
    orase: numara(vizite, (v) =>
      [v.city, v.region, v.country].filter(Boolean).join(", "),
    ),
    primaPagina: numara(vizite, (v) => v.landing),
    ultimaPagina: numara(vizite, (v) => v.exitPath),
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
    copieri: numara(
      evenimente.filter((e) => e.type === "copiere"),
      (e) => `${e.path} · ${e.detail}`,
    ),

    /* Ce nu merge */
    nervoase: numara(
      evenimente.filter((e) => e.type === "rage"),
      (e) => `${e.path} · ${e.detail}`,
    ),
    pagini404: numara(
      evenimente.filter((e) => e.type === "p404"),
      (e) => e.detail || e.path,
    ),
    eroriLista: numara(
      evenimente.filter((e) => e.type === "eroare"),
      (e) => e.detail,
    ),
    abandonLista: numara(
      evenimente.filter((e) => e.type === "abandon"),
      (e) => e.detail || "fără detalii",
    ),

    /* Viteza paginii, așa cum au simțit-o oamenii */
    lcp: mediana(vizite.map((v) => v.lcp ?? 0).filter(Boolean)),
    inp: mediana(vizite.map((v) => v.inp ?? 0).filter(Boolean)),
    cls: mediana(vizite.map((v) => v.cls ?? 0).filter(Boolean)),
    erori: vizite.reduce((a, v) => a + v.errors, 0),

    peZile: [...peZile.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    peVizita,
  };
}

export type Sinteza = ReturnType<typeof sinteza>;
