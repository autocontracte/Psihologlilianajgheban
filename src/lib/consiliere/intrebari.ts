/* ----------------------------------------------------------------------------
   Întrebările pentru ghidul despre divorț.

   Situează persoana (etapă, copii, ce o apasă, ce își dorește) ca interpretarea
   AI să fie personalizată. Câmpurile deschise sunt cele mai valoroase pentru
   interpretare, dar rămân opționale — nimeni nu e obligat să scrie mult.
   -------------------------------------------------------------------------- */

export type TipIntrebare = "single" | "multi" | "text" | "long";

export type Intrebare = {
  id: string;
  tip: TipIntrebare;
  intrebare: string;
  ajutor?: string;
  optiuni?: string[];
  optional?: boolean;
  /** Se arată doar dacă altă întrebare are un anumit răspuns. */
  daca?: { id: string; nu?: string[] };
};

export const INTREBARI: Intrebare[] = [
  {
    id: "etapa",
    tip: "single",
    intrebare: "În ce moment ești acum?",
    optiuni: [
      "Mă gândesc dacă e cazul să ne despărțim",
      "Suntem într-o criză, dar n-am decis nimic",
      "Suntem în proces de separare sau divorț",
      "Divorțul e recent",
      "A trecut ceva timp și încerc să reconstruiesc",
    ],
  },
  {
    id: "copii",
    tip: "single",
    intrebare: "Aveți copii împreună?",
    optiuni: ["Nu", "Da, unul", "Da, mai mulți"],
  },
  {
    id: "varste_copii",
    tip: "text",
    intrebare: "Ce vârste au copiii?",
    ajutor: "Ne ajută să înțelegem cum trăiesc ei situația.",
    optional: true,
    daca: { id: "copii", nu: ["Nu"] },
  },
  {
    id: "apasa",
    tip: "multi",
    intrebare: "Ce te apasă cel mai mult acum?",
    ajutor: "Poți alege mai multe.",
    optiuni: [
      "Conflictele și certurile",
      "Lipsa comunicării",
      "Cum îi afectează pe copii",
      "Vinovăția sau sentimentul de eșec",
      "Singurătatea și teama de viitor",
      "Partea juridică (custodie, bunuri)",
      "Gestionarea propriilor emoții",
    ],
  },
  {
    id: "relatie",
    tip: "single",
    intrebare: "Cum descrii relația actuală cu partenerul sau fostul partener?",
    optiuni: [
      "Reușim să comunicăm calm",
      "Comunicăm, dar cu tensiune",
      "Aproape că nu mai comunicăm",
      "Suntem în conflict deschis",
    ],
  },
  {
    id: "dorinte",
    tip: "multi",
    intrebare: "Ce ți-ai dori să obții?",
    ajutor: "Poți alege mai multe.",
    optiuni: [
      "Să înțeleg ce se întâmplă cu mine",
      "Să iau o decizie mai clară",
      "Să protejez copiii",
      "Să comunic mai bine",
      "Să trec mai ușor peste",
      "Să știu când să cer ajutor specializat",
    ],
  },
  {
    id: "situatie",
    tip: "long",
    intrebare: "Descrie pe scurt situația ta, cu cuvintele tale.",
    ajutor: "Cu cât împărtășești mai mult, cu atât interpretarea e mai potrivită. Opțional.",
    optional: true,
  },
];

/** Întrebările vizibile în funcție de răspunsurile de până acum. */
export function intrebariVizibile(raspunsuri: Record<string, unknown>): Intrebare[] {
  return INTREBARI.filter((q) => {
    if (!q.daca) return true;
    const val = raspunsuri[q.daca.id];
    if (q.daca.nu && typeof val === "string") return !q.daca.nu.includes(val);
    return true;
  });
}

export type Raspunsuri = Record<string, string | string[]>;

/** Transformă răspunsurile în text citibil, pentru interpretare și pentru admin. */
export function raspunsuriText(raspunsuri: Raspunsuri): string {
  const linii: string[] = [];
  for (const q of INTREBARI) {
    const v = raspunsuri[q.id];
    if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) continue;
    const raspuns = Array.isArray(v) ? v.join(", ") : String(v);
    linii.push(`${q.intrebare}\n${raspuns}`);
  }
  return linii.join("\n\n");
}
