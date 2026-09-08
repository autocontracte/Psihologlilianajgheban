/* ============================================================================
   Șabloanele de contract

   Fișierul descrie ce conține fiecare șablon PDF: ce câmpuri se completează,
   cine le completează și unde cad semnăturile.

   Pozițiile semnăturilor au fost măsurate direct din PDF-uri, căutând linia
   punctată de sub „Semnătura:”. Sunt în puncte PDF, cu originea în colțul din
   stânga-jos al paginii. Dacă șablonul se schimbă, aici e singurul loc care
   trebuie actualizat — restul sistemului nu știe nimic despre coordonate.
   ========================================================================== */

export type TipContract = "ADULT" | "MINOR";

export type TipCamp = "text" | "email" | "tel" | "cnp" | "varsta" | "lung";

export type CampContract = {
  /** Numele exact al câmpului din PDF. */
  nume: string;
  eticheta: string;
  tip: TipCamp;
  obligatoriu: boolean;
  ajutor?: string;
};

export type GrupCampuri = {
  titlu: string;
  descriere?: string;
  campuri: CampContract[];
  /** Grupul poate rămâne gol de tot (ex. al doilea părinte). */
  optional?: boolean;
};

export type PozitieSemnatura = {
  /** Indexul paginii, de la 0. */
  pagina: number;
  /** Capătul din stânga al liniei. */
  x: number;
  /** Lungimea liniei punctate. */
  latime: number;
  /** Înălțimea liniei. Semnătura se așază peste ea. */
  y: number;
  eticheta: string;
  /** Al doilea semnatar lipsește dacă nu e completat părintele 2. */
  optional?: boolean;
};

export type Sablon = {
  tip: TipContract;
  fisier: string;
  titlu: string;
  descriere: string;
  grupuri: GrupCampuri[];
  semnaturi: PozitieSemnatura[];
};

/* Grupuri comune celor două contracte ------------------------------------- */

const CONTACTE_URGENTA: GrupCampuri = {
  titlu: "Două persoane de contact pentru urgențe",
  descriere:
    "Contractul le cere la punctul 6.1.e. Sunt sunate doar în situații de urgență.",
  campuri: [
    { nume: "contact1_nume", eticheta: "Prima persoană — nume complet", tip: "text", obligatoriu: true },
    { nume: "contact1_tel", eticheta: "Telefon", tip: "tel", obligatoriu: true },
    { nume: "contact2_nume", eticheta: "A doua persoană — nume complet", tip: "text", obligatoriu: true },
    { nume: "contact2_tel", eticheta: "Telefon", tip: "tel", obligatoriu: true },
  ],
};

function istoric(pentruCopil: boolean): GrupCampuri {
  return {
    titlu: "Istoric personal și de familie",
    descriere: "Punctul 10 din contract. Scrie „nu” dacă nu e cazul.",
    campuri: [
      {
        nume: "istoric_1",
        eticheta: pentruCopil
          ? "Au existat în familia copilului persoane diagnosticate cu boli psihice?"
          : "Au existat în familia ta persoane diagnosticate cu boli psihice?",
        tip: "lung",
        obligatoriu: true,
      },
      {
        nume: "istoric_2",
        eticheta: pentruCopil
          ? "A urmat copilul vreodată tratament psihiatric? Dacă da, ce medicamente și pentru ce afecțiune?"
          : "Ai urmat vreodată tratament psihiatric? Dacă da, ce medicamente și pentru ce afecțiune?",
        tip: "lung",
        obligatoriu: true,
      },
    ],
  };
}

function persoana(prefix: "b1" | "b2", titlu: string, optional = false): GrupCampuri {
  return {
    titlu,
    optional,
    campuri: [
      { nume: `${prefix}_nume`, eticheta: "Nume și prenume", tip: "text", obligatoriu: !optional },
      { nume: `${prefix}_domiciliu`, eticheta: "Domiciliul", tip: "text", obligatoriu: !optional },
      { nume: `${prefix}_cnp`, eticheta: "CNP", tip: "cnp", obligatoriu: !optional },
      { nume: `${prefix}_telefon`, eticheta: "Telefon", tip: "tel", obligatoriu: !optional },
      { nume: `${prefix}_email`, eticheta: "Adresa de e-mail", tip: "email", obligatoriu: !optional },
    ],
  };
}

/* Șabloanele ---------------------------------------------------------------- */

export const SABLOANE: Record<TipContract, Sablon> = {
  ADULT: {
    tip: "ADULT",
    fisier: "adult.pdf",
    titlu: "Contract de prestări servicii psihologice — adult",
    descriere: "Pentru ședințe în nume propriu, de la 18 ani în sus.",
    grupuri: [
      persoana("b1", "Datele tale"),
      CONTACTE_URGENTA,
      istoric(false),
    ],
    semnaturi: [
      { pagina: 4, x: 359, latime: 164, y: 354.4, eticheta: "Semnătura ta" },
    ],
  },

  MINOR: {
    tip: "MINOR",
    fisier: "minor.pdf",
    titlu: "Contract de prestări servicii psihologice — minor",
    descriere: "Pentru ședințele unui copil, semnat de părinți sau reprezentant legal.",
    grupuri: [
      persoana("b1", "Datele mamei sau ale reprezentantului legal"),
      {
        ...persoana("b2", "Datele tatălui", true),
        descriere:
          "Lasă gol dacă semnează un singur părinte sau reprezentant legal. Atunci se cere o singură semnătură.",
      },
      {
        titlu: "Datele copilului",
        campuri: [
          { nume: "minor_nume", eticheta: "Nume și prenume", tip: "text", obligatoriu: true },
          { nume: "minor_cnp", eticheta: "CNP", tip: "cnp", obligatoriu: true },
          { nume: "minor_varsta", eticheta: "Vârsta", tip: "varsta", obligatoriu: true },
        ],
      },
      CONTACTE_URGENTA,
      istoric(true),
    ],
    semnaturi: [
      { pagina: 5, x: 359, latime: 164, y: 679.9, eticheta: "Semnătura mamei / reprezentantului legal" },
      { pagina: 5, x: 359, latime: 164, y: 607.2, eticheta: "Semnătura tatălui", optional: true },
    ],
  },
};

/** Toate câmpurile pe care le completează clientul, într-o listă plată. */
export function campuriClient(tip: TipContract): CampContract[] {
  return SABLOANE[tip].grupuri.flatMap((g) => g.campuri);
}

/** Câmpurile completate de sistem, nu de client. */
export const CAMPURI_SISTEM = [
  "contract_nr",
  "contract_data",
  "pret",
  "data_semnarii",
] as const;
