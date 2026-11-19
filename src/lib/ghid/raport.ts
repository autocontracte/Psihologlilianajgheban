/* ----------------------------------------------------------------------------
   Raportul personal care vine cu o parte a ghidului: ce scrie AI-ul, pe
   secțiuni. Se păstrează în `GuideOrder.interpretation`, ca JSON.
   -------------------------------------------------------------------------- */

export type RaportParte = {
  /** O frază-cheie, pentru copertă și pentru începutul raportului. */
  titlu: string;
  rezumat: string;
  /** Analiza fiecărei zone a chestionarului. */
  zone: { cheie: string; text: string; deRetinut: string }[];
  puncteForte: string[];
  atentie: string[];
  /** Doar dacă sunt copii minori la mijloc. */
  copii: string;
  /** Pași pe 4 săptămâni. */
  plan: { titlu: string; pasi: string[] }[];
  /** Întrebări de reflecție. */
  reflectie: string[];
  /** Capitolele părții, în ordinea în care merită citite, cu motivul. */
  capitole: { titlu: string; deCe: string }[];
  incheiere: string;
};

const sir = (v: unknown, max = 6000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const lista = (v: unknown, max = 8) =>
  Array.isArray(v) ? v.map((x) => sir(x, 800)).filter(Boolean).slice(0, max) : [];

/** Curăță ce vine de la model: doar câmpurile cunoscute, cu tipurile corecte. */
export function normalizeazaRaportParte(brut: unknown, chei: string[]): RaportParte | null {
  if (!brut || typeof brut !== "object") return null;
  const o = brut as Record<string, unknown>;
  const obiecte = (v: unknown) =>
    (Array.isArray(v) ? v : []).filter((x) => x && typeof x === "object").map((x) => x as Record<string, unknown>);

  const raport: RaportParte = {
    titlu: sir(o.titlu, 300),
    rezumat: sir(o.rezumat),
    zone: obiecte(o.zone)
      .filter((z) => chei.includes(String(z.cheie)))
      .map((z) => ({ cheie: String(z.cheie), text: sir(z.text), deRetinut: sir(z.deRetinut ?? z.de_retinut, 400) })),
    puncteForte: lista(o.puncteForte ?? o.puncte_forte, 6),
    atentie: lista(o.atentie, 6),
    copii: sir(o.copii),
    plan: obiecte(o.plan)
      .map((p) => ({ titlu: sir(p.titlu, 200), pasi: lista(p.pasi, 5) }))
      .filter((p) => p.titlu && p.pasi.length)
      .slice(0, 4),
    reflectie: lista(o.reflectie, 8),
    capitole: obiecte(o.capitole)
      .map((c) => ({ titlu: sir(c.titlu, 200), deCe: sir(c.deCe ?? c.de_ce, 600) }))
      .filter((c) => c.titlu)
      .slice(0, 6),
    incheiere: sir(o.incheiere),
  };

  if (!raport.rezumat || raport.zone.length < 2) return null;
  return raport;
}

export function citesteRaportParte(valoare: string | null | undefined, chei: string[]): RaportParte | null {
  if (!valoare?.trim().startsWith("{")) return null;
  try {
    return normalizeazaRaportParte(JSON.parse(valoare), chei);
  } catch {
    return null;
  }
}
