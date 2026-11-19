/* ----------------------------------------------------------------------------
   Ghidul practic despre cuplu, divorț și familie, vândut pe părți.

   Cele 6 părți urmează cuprinsul ghidului. Fiecare se cumpără separat, cu
   raportul personal (AI) inclus, și are un chestionar gratuit (vezi
   chestionare.ts). PDF-urile părților se fac cu scripts/imparte-ghidul.mjs.

   Modul fără server: îl folosesc și paginile, și componentele din browser.
   -------------------------------------------------------------------------- */

export const PRET_PARTE_BANI = 5900; // 59 lei
export const PRET_PARTE_LEI = PRET_PARTE_BANI / 100;
export const NUME_GHID = "Ghid practic despre cuplu, divorț și familie";

export type Parte = {
  nr: number;
  /** Adresa chestionarului: /kit/<slug>. */
  slug: string;
  titlu: string;
  /** O frază: cui i se potrivește. */
  pentruCine: string;
  capitole: string[];
  /** Fișierul din ghiduri/parti/. */
  fisier: string;
  /** Câte pagini are PDF-ul părții (cu introducerea și concluziile). */
  pagini: number;
};

export const PARTI: Parte[] = [
  {
    nr: 1,
    slug: "preventia-divortului",
    titlu: "Prevenția divorțului",
    pentruCine: "Pentru cuplurile care simt că ceva nu mai merge și vor să înțeleagă criza înainte să ia o decizie.",
    capitole: ["Înțelegerea crizei de cuplu", "Semnale de alarmă care pot duce la divorț", "Instrumente de prevenție"],
    fisier: "partea-1-preventia-divortului.pdf",
    pagini: 19,
  },
  {
    nr: 2,
    slug: "despartirea",
    titlu: "Intervenția în divorț",
    pentruCine: "Când despărțirea e pe masă: doliul, furia, vinovăția și acceptarea, pas cu pas.",
    capitole: ["Divorțul ca proces emoțional"],
    fisier: "partea-2-interventia-in-divort.pdf",
    pagini: 13,
  },
  {
    nr: 3,
    slug: "divortul-fara-copii",
    titlu: "Divorțul fără copii",
    pentruCine: "Pentru cei care divorțează fără copii împreună: ce se întâmplă cu tine și ce trebuie știut juridic.",
    capitole: ["Impact emoțional asupra adulților", "Aspecte juridice de bază"],
    fisier: "partea-3-divortul-fara-copii.pdf",
    pagini: 14,
  },
  {
    nr: 4,
    slug: "divortul-cu-copii",
    titlu: "Divorțul cu copii",
    pentruCine: "Pentru părinții care se despart: ce trăiește copilul, cum îi spuneți și cum organizați viața lui.",
    capitole: [
      "Nevoile psihologice ale copilului în divorț",
      "Efectele divorțului asupra copilului pe etape de vârstă",
      "Cum comunicăm divorțul copilului",
      "Autoritatea parentală (custodia) și organizarea vieții copilului",
      "Alienarea parentală",
    ],
    fisier: "partea-4-divortul-cu-copii.pdf",
    pagini: 40,
  },
  {
    nr: 5,
    slug: "co-parentajul",
    titlu: "Viața după divorț",
    pentruCine: "Pentru părinții divorțați care vor să rămână o echipă pentru copil, chiar dacă nu mai sunt un cuplu.",
    capitole: ["Co-parentajul sănătos"],
    fisier: "partea-5-viata-dupa-divort.pdf",
    pagini: 15,
  },
  {
    nr: 6,
    slug: "familia-recompusa",
    titlu: "Familia recompusă",
    pentruCine: "Pentru familiile noi, cu copii din relații diferite: roluri, limite și răbdare.",
    capitole: ["Ce este familia recompusă", "Roluri și limite în familia recompusă", "Copiii într-o familie recompusă"],
    fisier: "partea-6-familia-recompusa.pdf",
    pagini: 24,
  },
];

export const parte = (nr: number | null | undefined) => PARTI.find((p) => p.nr === nr) ?? null;
export const parteDupaSlug = (slug: string) => PARTI.find((p) => p.slug === slug) ?? null;
export const numeParte = (p: Parte) => `Partea ${p.nr}: ${p.titlu}`;
