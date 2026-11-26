/* ----------------------------------------------------------------------------
   Ghidul practic despre cuplu, divorț și familie, vândut pe părți.

   4 părți, grupate din cele 6 ale cuprinsului (26 nov 2026): relația de cuplu
   (cu sau fără probleme), despărțirea și divorțul, divorțul cu copii, viața
   după divorț. Fiecare se cumpără separat, cu raportul personal (AI) inclus.
   La ele duc 6 chestionare gratuite (vezi chestionare.ts). PDF-urile părților
   se fac cu scripts/imparte-ghidul.mjs.

   Modul fără server: îl folosesc și paginile, și componentele din browser.
   -------------------------------------------------------------------------- */

export const PRET_PARTE_BANI = 4900; // 49 lei
export const PRET_PARTE_LEI = PRET_PARTE_BANI / 100;
export const NUME_GHID = "Ghid practic despre cuplu, divorț și familie";

export type Parte = {
  nr: number;
  titlu: string;
  /** O frază: cui i se potrivește. */
  pentruCine: string;
  capitole: string[];
  /** Părțile din cuprinsul ghidului întreg pe care le cuprinde (I–VI). */
  romane: string[];
  /** Fișierul din ghiduri/parti/. */
  fisier: string;
  /** Câte pagini are PDF-ul părții (cu introducerea și concluziile). */
  pagini: number;
};

export const PARTI: Parte[] = [
  {
    nr: 1,
    titlu: "Relația de cuplu",
    pentruCine: "Pentru cuplurile care sunt împreună, cu sau fără probleme: ce pune relația în pericol și ce o ține vie.",
    capitole: ["Înțelegerea crizei de cuplu", "Semnale de alarmă care pot duce la divorț", "Instrumente de prevenție"],
    romane: ["I"],
    fisier: "partea-1-relatia-de-cuplu.pdf",
    pagini: 19,
  },
  {
    nr: 2,
    titlu: "Despărțirea și divorțul",
    pentruCine: "Când despărțirea e pe masă sau deja în curs: emoțiile ei, cine ești după și pașii juridici.",
    capitole: ["Divorțul ca proces emoțional", "Impact emoțional asupra adulților", "Aspecte juridice de bază"],
    romane: ["II", "III"],
    fisier: "partea-2-despartirea-si-divortul.pdf",
    pagini: 18,
  },
  {
    nr: 3,
    titlu: "Divorțul cu copii",
    pentruCine: "Pentru părinții care se despart: ce trăiește copilul, cum îi spuneți și cum organizați viața lui.",
    capitole: [
      "Nevoile psihologice ale copilului în divorț",
      "Efectele divorțului asupra copilului pe etape de vârstă",
      "Cum comunicăm divorțul copilului",
      "Autoritatea parentală (custodia) și organizarea vieții copilului",
      "Alienarea parentală",
    ],
    romane: ["IV"],
    fisier: "partea-3-divortul-cu-copii.pdf",
    pagini: 40,
  },
  {
    nr: 4,
    titlu: "Viața după divorț",
    pentruCine: "Pentru părinții divorțați și familiile noi: co-parentajul și familia recompusă.",
    capitole: [
      "Co-parentajul sănătos",
      "Ce este familia recompusă",
      "Roluri și limite în familia recompusă",
      "Copiii într-o familie recompusă",
    ],
    romane: ["V", "VI"],
    fisier: "partea-4-viata-dupa-divort.pdf",
    pagini: 30,
  },
];

export const parte = (nr: number | null | undefined) => PARTI.find((p) => p.nr === nr) ?? null;
export const numeParte = (p: Parte) => `Partea ${p.nr}: ${p.titlu}`;
