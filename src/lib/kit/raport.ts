/* ----------------------------------------------------------------------------
   Interpretarea personală din kit: ce scrie AI-ul, pe secțiuni.

   Se păstrează în `GuideOrder.interpretation`, ca JSON. Comenzile vechi (de
   dinainte de kit) au acolo un text simplu — `citesteInterpretarea` le
   deosebește, ca paginile să le arate pe amândouă.
   -------------------------------------------------------------------------- */

import type { CheieDimensiune } from "./test";

export type RaportAI = {
  /** O frază-cheie, pentru copertă și pentru începutul raportului. */
  titlu: string;
  /** 2–3 paragrafe: unde ești, spus cu blândețe. */
  rezumat: string;
  /** Tiparul relațional pe care îl sugerează răspunsurile. */
  tipar: { titlu: string; text: string };
  /** Analiza personală pe fiecare dimensiune. */
  dimensiuni: { cheie: CheieDimensiune; text: string; deRetinut: string }[];
  puncteForte: string[];
  atentie: string[];
  /** Doar dacă există copii. */
  copii: string;
  /** Planul pe 30 de zile, pe săptămâni. */
  plan: { titlu: string; pasi: string[] }[];
  /** Întrebări pentru o discuție în doi (sau pentru reflecție, dacă v-ați despărțit). */
  conversatie: string[];
  incheiere: string;
};

export type Interpretare =
  | { tip: "raport"; raport: RaportAI }
  | { tip: "text"; text: string };

const sir = (v: unknown, max = 6000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const lista = (v: unknown, max = 8) =>
  Array.isArray(v) ? v.map((x) => sir(x, 800)).filter(Boolean).slice(0, max) : [];

const CHEI: CheieDimensiune[] = ["comunicare", "conflict", "apropiere", "incredere", "respect", "echipa"];

/** Curăță ce vine de la model: doar câmpurile cunoscute, cu tipurile corecte. */
export function normalizeazaRaport(brut: unknown): RaportAI | null {
  if (!brut || typeof brut !== "object") return null;
  const o = brut as Record<string, unknown>;
  const tipar = (o.tipar ?? {}) as Record<string, unknown>;

  const raport: RaportAI = {
    titlu: sir(o.titlu, 300),
    rezumat: sir(o.rezumat),
    tipar: { titlu: sir(tipar.titlu, 200), text: sir(tipar.text) },
    dimensiuni: (Array.isArray(o.dimensiuni) ? o.dimensiuni : [])
      .map((d) => d as Record<string, unknown>)
      .filter((d) => CHEI.includes(d?.cheie as CheieDimensiune))
      .map((d) => ({
        cheie: d.cheie as CheieDimensiune,
        text: sir(d.text),
        deRetinut: sir(d.deRetinut ?? d.de_retinut, 400),
      })),
    puncteForte: lista(o.puncteForte ?? o.puncte_forte),
    atentie: lista(o.atentie),
    copii: sir(o.copii),
    plan: (Array.isArray(o.plan) ? o.plan : [])
      .map((p) => p as Record<string, unknown>)
      .map((p) => ({ titlu: sir(p?.titlu, 200), pasi: lista(p?.pasi, 6) }))
      .filter((p) => p.titlu && p.pasi.length)
      .slice(0, 4),
    conversatie: lista(o.conversatie, 8),
    incheiere: sir(o.incheiere),
  };

  // Fără rezumat și fără analiză, raportul nu e utilizabil.
  if (!raport.rezumat || raport.dimensiuni.length < 3) return null;
  return raport;
}

export function citesteInterpretarea(valoare: string | null | undefined): Interpretare | null {
  if (!valoare?.trim()) return null;
  const t = valoare.trim();
  if (t.startsWith("{")) {
    try {
      const raport = normalizeazaRaport(JSON.parse(t));
      if (raport) return { tip: "raport", raport };
    } catch {
      /* nu e JSON — îl tratăm ca text */
    }
  }
  return { tip: "text", text: t };
}

/** Împarte un text în paragrafe. */
export const paragrafe = (text: string) =>
  text
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
