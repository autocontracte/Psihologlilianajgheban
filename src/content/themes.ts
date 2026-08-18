/* ============================================================================
   Paletele și perechile de fonturi propuse spre alegere.

   Aceleași date apar în chestionar (pentru alegere) și în panoul de admin
   (pentru a vedea ce s-a ales), deci stau într-un singur loc.
   ========================================================================== */

export type Palette = {
  n: number;
  name: string;
  group: "stinse" | "aprinse";
  bg: string;
  ink: string;
  accent: string;
  second: string;
  line: string;
  /** Culoarea textului pe butonul de accent — aleasă după contrast. */
  btnText: string;
};

export const PALETTES: Palette[] = [
  /* Vii întâi — sunt cele cerute cel mai des. Numele nu apar în chestionar,
     alegerea se face din culoare; rămân aici ca să le pot identifica în panou. */
  {
    n: 1,
    name: "Turcoaz și coral",
    group: "aprinse",
    bg: "#F4FAFA", ink: "#14343A", accent: "#0B7E7D", second: "#F0714F", line: "#CFE8E7",
    btnText: "#FFFFFF",
  },
  {
    n: 2,
    name: "Chihlimbar și indigo",
    group: "aprinse",
    bg: "#FFF9EE", ink: "#1F2A56", accent: "#F0A818", second: "#4A5BC4", line: "#F6E4C0",
    btnText: "#1F2A56",
  },
  {
    n: 3,
    name: "Verde crud",
    group: "aprinse",
    bg: "#F4FAF2", ink: "#1E3324", accent: "#237A41", second: "#C08A4A", line: "#D3EBD5",
    btnText: "#FFFFFF",
  },
  {
    n: 4,
    name: "Zmeură și prun",
    group: "aprinse",
    bg: "#FFF6F7", ink: "#3A1E33", accent: "#C43A6B", second: "#7A4FA3", line: "#F7D9E2",
    btnText: "#FFFFFF",
  },
  {
    n: 5,
    name: "Albastru viu și lămâie",
    group: "aprinse",
    bg: "#F4F8FF", ink: "#16244A", accent: "#2F6BE8", second: "#E8B31F", line: "#D6E4FB",
    btnText: "#FFFFFF",
  },
  {
    n: 6,
    name: "Portocaliu ars și petrol",
    group: "aprinse",
    bg: "#FFF7F2", ink: "#21353B", accent: "#B55024", second: "#17656E", line: "#F8DFD0",
    btnText: "#FFFFFF",
  },
  {
    n: 7,
    name: "Mov și mentă",
    group: "aprinse",
    bg: "#FAF6FF", ink: "#2B1F45", accent: "#6B3FBF", second: "#2FA98A", line: "#E7DDF7",
    btnText: "#FFFFFF",
  },
  {
    n: 8,
    name: "Cărămidă și bleu",
    group: "aprinse",
    bg: "#FFF7F5", ink: "#3A2320", accent: "#B23A2E", second: "#4E8FC7", line: "#F6DDD6",
    btnText: "#FFFFFF",
  },
  {
    n: 9,
    name: "Lime și grafit",
    group: "aprinse",
    bg: "#FAFCF0", ink: "#26291B", accent: "#5D7D19", second: "#4A5D6B", line: "#E8EFCD",
    btnText: "#FFFFFF",
  },

  /* Stinse — pentru cine vrea ceva mai discret. */
  {
    n: 10,
    name: "Salvie și cretă",
    group: "stinse",
    bg: "#F3F4EE", ink: "#363C45", accent: "#6E8567", second: "#B9A48C", line: "#DCE0D4",
    btnText: "#FFFFFF",
  },
  {
    n: 11,
    name: "Lut și in",
    group: "stinse",
    bg: "#F5F0EB", ink: "#43342C", accent: "#B08363", second: "#7E8F7C", line: "#E4D8CC",
    btnText: "#FFFFFF",
  },
  {
    n: 12,
    name: "Albastru de seară",
    group: "stinse",
    bg: "#F2F3EC", ink: "#383E52", accent: "#6778AF", second: "#6A7E63", line: "#DFE3F0",
    btnText: "#FFFFFF",
  },
  {
    n: 13,
    name: "Prun și cenușă trandafirie",
    group: "stinse",
    bg: "#F7F2F1", ink: "#3B2B36", accent: "#8C6A7D", second: "#A8927E", line: "#EADDE0",
    btnText: "#FFFFFF",
  },
  {
    n: 14,
    name: "Piatră și cerneală",
    group: "stinse",
    bg: "#F4F3F0", ink: "#26262A", accent: "#5F7F7C", second: "#9A948C", line: "#E2E0DA",
    btnText: "#FFFFFF",
  },
];

/* -------------------------------------------------------------------------- */

export type FontPair = {
  n: number;
  display: string;
  body: string;
  note: string;
  /** Rezervă locală, ca specimenul să arate corect chiar dacă fontul nu s-a încărcat. */
  displayFallback: string;
};

export const FONT_PAIRS: FontPair[] = [
  {
    n: 1,
    display: "Fraunces",
    body: "Montserrat",
    note: "Perechea de acum. Serifa are personalitate și puțină rotunjime, sansul e geometric și limpede.",
    displayFallback: "Georgia, serif",
  },
  {
    n: 2,
    display: "Castoro",
    body: "Lexend",
    note: "Lexend este desenat anume pentru ușurința citirii. Perechea e folosită de un cabinet de psihologie din România.",
    displayFallback: "Georgia, serif",
  },
  {
    n: 3,
    display: "Cormorant Garamond",
    body: "Work Sans",
    note: "Cea mai elegantă. Contrast mare între linii groase și subțiri, aer mult. Cere titluri scurte.",
    displayFallback: "Garamond, Georgia, serif",
  },
  {
    n: 4,
    display: "Lora",
    body: "Source Sans 3",
    note: "Cald și clasic, ca într-o carte bine tipărită. Cea mai sigură alegere pentru texte lungi.",
    displayFallback: "Georgia, serif",
  },
  {
    n: 5,
    display: "Newsreader",
    body: "Public Sans",
    note: "Editorial și sobru, cu un aer de publicație serioasă. Modern fără să fie rece.",
    displayFallback: "Georgia, serif",
  },
];

/** Textul folosit în specimene, ca alegerea să se facă pe conținut real. */
export const SPECIMEN = {
  heading: "Un spațiu sigur, în care să fii ascultat",
  body: "Terapia nu înseamnă că ceva e în neregulă cu tine. Înseamnă că alegi să îți acorzi atenție, sprijin și timp.",
};

/* ---------------------------------------------------------------- contrast */

const lum = (hex: string) => {
  const c = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

const toHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;

/**
 * Întunecă o culoare până devine lizibilă pe fundalul dat.
 *
 * Accentul arată bine pe suprafețe mari, dar ca text mic multe nuanțe cad sub
 * pragul de citire — galbenul, de pildă, ajunge la 1.9:1 pe crem.
 */
export function readableOn(hex: string, bg: string, target = 4.5): string {
  let [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  for (let i = 0; i < 40 && ratio(toHex(r, g, b), bg) < target; i++) {
    r = Math.round(r * 0.93);
    g = Math.round(g * 0.93);
    b = Math.round(b * 0.93);
  }
  return toHex(r, g, b);
}
