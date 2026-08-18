/* ============================================================================
   Paletele și perechile de fonturi propuse spre alegere.

   Aceleași date apar în chestionar (pentru alegere) și în panoul de admin
   (pentru a vedea ce s-a ales), deci stau într-un singur loc.
   ========================================================================== */

export type Palette = {
  n: number;
  name: string;
  note: string;
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
  {
    n: 1,
    name: "Salvie și cretă",
    note: "Verdele stins este cel mai frecvent registru la cabinetele de psihoterapie — trimite la calm și la creștere, fără să fie rece.",
    group: "stinse",
    bg: "#F3F4EE", ink: "#363C45", accent: "#6E8567", second: "#B9A48C", line: "#DCE0D4",
    btnText: "#FFFFFF",
  },
  {
    n: 2,
    name: "Lut și in",
    note: "Pământiu și cald. Senzația e de încăpere primitoare, nu de clinică.",
    group: "stinse",
    bg: "#F5F0EB", ink: "#43342C", accent: "#B08363", second: "#7E8F7C", line: "#E4D8CC",
    btnText: "#FFFFFF",
  },
  {
    n: 3,
    name: "Albastru de seară",
    note: "Albastru prăfuit pe fond crem. Vorbește despre încredere și liniște. Este direcția în care arată site-ul acum.",
    group: "stinse",
    bg: "#F2F3EC", ink: "#383E52", accent: "#6778AF", second: "#6A7E63", line: "#DFE3F0",
    btnText: "#FFFFFF",
  },
  {
    n: 4,
    name: "Prun și cenușă trandafirie",
    note: "Mov-prun cu roz stins. Cea mai caldă și mai personală dintre variantele discrete.",
    group: "stinse",
    bg: "#F7F2F1", ink: "#3B2B36", accent: "#8C6A7D", second: "#A8927E", line: "#EADDE0",
    btnText: "#FFFFFF",
  },
  {
    n: 5,
    name: "Piatră și cerneală",
    note: "Neutru cald cu un singur accent verde-albăstrui. Cea mai sobră — lasă fotografiile și textul să vorbească.",
    group: "stinse",
    bg: "#F4F3F0", ink: "#26262A", accent: "#5F7F7C", second: "#9A948C", line: "#E2E0DA",
    btnText: "#FFFFFF",
  },
  {
    n: 6,
    name: "Turcoaz și coral",
    note: "Viu și optimist, fără să fie strident. Merge bine dacă lucrezi mult cu adolescenți și copii.",
    group: "aprinse",
    bg: "#F4FAFA", ink: "#14343A", accent: "#0B7E7D", second: "#F0714F", line: "#CFE8E7",
    btnText: "#FFFFFF",
  },
  {
    n: 7,
    name: "Chihlimbar și indigo",
    note: "Galben cald pe albastru închis. Cea mai luminoasă variantă — se ține minte.",
    group: "aprinse",
    bg: "#FFF9EE", ink: "#1F2A56", accent: "#F0A818", second: "#4A5BC4", line: "#F6E4C0",
    btnText: "#1F2A56",
  },
  {
    n: 8,
    name: "Verde crud",
    note: "Verde limpede, mai viu decât salvia. Vorbește despre vitalitate și început.",
    group: "aprinse",
    bg: "#F4FAF2", ink: "#1E3324", accent: "#237A41", second: "#C08A4A", line: "#D3EBD5",
    btnText: "#FFFFFF",
  },
  {
    n: 9,
    name: "Zmeură și prun",
    note: "Roz intens cu prun adânc. Caldă și hotărâtă, dacă vrei un ton apropiat, dar sigur pe el.",
    group: "aprinse",
    bg: "#FFF6F7", ink: "#3A1E33", accent: "#C43A6B", second: "#7A4FA3", line: "#F7D9E2",
    btnText: "#FFFFFF",
  },
  {
    n: 10,
    name: "Albastru viu și lămâie",
    note: "Albastru curat cu un accent citric. Cea mai modernă și mai directă.",
    group: "aprinse",
    bg: "#F4F8FF", ink: "#16244A", accent: "#2F6BE8", second: "#E8B31F", line: "#D6E4FB",
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
