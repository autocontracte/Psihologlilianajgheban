import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import {
  PDFDocument,
  PDFTextField,
  PDFName,
  PDFDict,
  PDFFont,
  PDFPage,
  rgb,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

import { SABLOANE, type TipContract } from "./sabloane";

/* ----------------------------------------------------------------------------
   Completarea șablonului PDF.

   Trei lucruri nu sunt evidente și merită explicate:

   1. Fontul. Câmpurile din șablon folosesc o codificare WinAnsi, care nu
      cunoaște „ș" și „ț" (U+0219 / U+021B). Fără fontul de mai jos, orice
      adresă din București sau nume cu ț ar arunca eroare la completare. De
      aceea încorporăm DejaVu Sans.

   2. Chenarele. Șablonul are, desenate în pagină, câte o casetă cu contur și
      fundal bleu în jurul fiecărui câmp — arată a formular, nu a contract. Nu
      sunt câmpuri de formular (pe acelea le scoatem), ci dreptunghiuri din
      conținutul paginii. Le acoperim cu alb și scriem textul curat deasupra.
      Pagina e albă, așa că acoperirea nu se vede.

   3. Numele beneficiarului apare în mai multe locuri, ca obiecte PDF diferite
      cu același nume. De aceea parcurgem toate widgeturile, nu doar primul.
   -------------------------------------------------------------------------- */

const DIR_SABLOANE = join(process.cwd(), "contracte", "sabloane");
const CALE_FONT = join(process.cwd(), "contracte", "fonturi", "DejaVuSans.ttf");

/** Mărimea de pornire a textului completat; se micșorează dacă nu încape. */
const MARIME = 10.5;
const MARIME_MIN = 6.5;
const CULOARE_TEXT = rgb(0.12, 0.12, 0.14);
const ALB = rgb(1, 1, 1);
/** Cu cât depășim caseta la acoperire, ca să prindem și conturul. */
const MARGINE_ACOPERIRE = 1.6;

type Caseta = {
  pagina: number;
  x: number;
  y: number;
  latime: number;
  inaltime: number;
  valoare: string;
  multilinie: boolean;
};

/** Împarte textul în rânduri care încap în lățimea dată. */
function rupeInRanduri(
  text: string,
  font: PDFFont,
  marime: number,
  latMax: number,
): string[] {
  const randuri: string[] = [];
  let curent = "";
  for (const cuvant of text.split(/\s+/)) {
    const incercare = curent ? `${curent} ${cuvant}` : cuvant;
    if (font.widthOfTextAtSize(incercare, marime) > latMax && curent) {
      randuri.push(curent);
      curent = cuvant;
    } else {
      curent = incercare;
    }
  }
  if (curent) randuri.push(curent);
  return randuri;
}

/** Scrie textul într-o casetă, micșorând fontul până încape. */
function scrieInCaseta(pagina: PDFPage, c: Caseta, font: PDFFont) {
  if (!c.valoare) return;
  const latUtila = c.latime - 4;

  if (c.multilinie) {
    let marime = MARIME;
    let randuri = rupeInRanduri(c.valoare, font, marime, latUtila);
    while (marime > MARIME_MIN && randuri.length * (marime + 3) > c.inaltime) {
      marime -= 0.5;
      randuri = rupeInRanduri(c.valoare, font, marime, latUtila);
    }
    let y = c.y + c.inaltime - marime - 1;
    for (const rand of randuri) {
      pagina.drawText(rand, { x: c.x + 2, y, size: marime, font, color: CULOARE_TEXT });
      y -= marime + 3;
    }
    return;
  }

  let marime = MARIME;
  while (marime > MARIME_MIN && font.widthOfTextAtSize(c.valoare, marime) > latUtila) {
    marime -= 0.5;
  }
  const y = c.y + (c.inaltime - marime) / 2 + 1;
  pagina.drawText(c.valoare, { x: c.x + 2, y, size: marime, font, color: CULOARE_TEXT });
}

/** Semnătura stă pe linia punctată, fără să atingă căsuța cu numele de deasupra. */
const INALTIME_MAX_SEMNATURA = 20;

export type DateContract = {
  tip: TipContract;
  numar: number;
  dataContractului: Date;
  dataSemnarii: Date;
  /** Prețul în lei, așa cum apare scris în contract. */
  pretLei: number;
  campuri: Record<string, string>;
  /** PNG-uri (data URL sau base64 simplu). A doua poate lipsi. */
  semnaturi: (string | null | undefined)[];
};

function dataRomaneasca(d: Date): string {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Bucharest",
  }).format(d);
}

function pngDinBase64(s: string): Uint8Array {
  const curat = s.includes(",") ? s.slice(s.indexOf(",") + 1) : s;
  return new Uint8Array(Buffer.from(curat, "base64"));
}

export async function completeazaContract(date: DateContract): Promise<Uint8Array> {
  const sablon = SABLOANE[date.tip];

  const doc = await PDFDocument.load(await readFile(join(DIR_SABLOANE, sablon.fisier)));
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(await readFile(CALE_FONT), { subset: true });

  const form = doc.getForm();
  const pagini = doc.getPages();

  const valori: Record<string, string> = {
    ...date.campuri,
    contract_nr: String(date.numar),
    contract_data: dataRomaneasca(date.dataContractului),
    data_semnarii: dataRomaneasca(date.dataSemnarii),
    pret: String(date.pretLei),
  };

  /* Culegem poziția fiecărei casete înainte să demontăm formularul. Luăm și
     casetele fără valoare (ex. al doilea părinte lipsă) — trebuie acoperite,
     altfel rămâne o cutie goală. */
  const casete: Caseta[] = [];
  for (const camp of form.getFields()) {
    if (!(camp instanceof PDFTextField)) continue;
    const valoare = valori[camp.getName()] ?? "";
    for (const widget of camp.acroField.getWidgets()) {
      const r = widget.getRectangle();
      const pref = widget.P?.();
      const pagina = pagini.findIndex((p) => p.ref === pref);
      if (pagina < 0) continue;
      casete.push({
        pagina,
        x: r.x,
        y: r.y,
        latime: r.width,
        inaltime: r.height,
        valoare,
        multilinie: r.height > 30,
      });
    }
  }

  /* Demontăm formularul complet. Golirea trebuie să reziste la salvare, de
     aceea `updateFieldAppearances: false` mai jos — altfel pdf-lib
     regenerează câmpurile și readuce chenarele. */
  const acro = doc.catalog.lookupMaybe(PDFName.of("AcroForm"), PDFDict);
  if (acro) {
    acro.set(PDFName.of("Fields"), doc.context.obj([]));
    acro.set(PDFName.of("NeedAppearances"), doc.context.obj(false));
  }
  for (const p of pagini) p.node.set(PDFName.of("Annots"), doc.context.obj([]));

  // Acoperim chenarele desenate în pagină, apoi scriem textul curat deasupra.
  for (const c of casete) {
    pagini[c.pagina].drawRectangle({
      x: c.x - MARGINE_ACOPERIRE,
      y: c.y - MARGINE_ACOPERIRE,
      width: c.latime + 2 * MARGINE_ACOPERIRE,
      height: c.inaltime + 2 * MARGINE_ACOPERIRE,
      color: ALB,
    });
  }
  for (const c of casete) scrieInCaseta(pagini[c.pagina], c, font);

  for (const [i, poz] of sablon.semnaturi.entries()) {
    const png = date.semnaturi[i];
    if (!png) continue;

    const imagine = await doc.embedPng(pngDinBase64(png));
    const scara = Math.min(
      poz.latime / imagine.width,
      INALTIME_MAX_SEMNATURA / imagine.height,
    );

    const latime = imagine.width * scara;
    const inaltime = imagine.height * scara;

    pagini[poz.pagina].drawImage(imagine, {
      x: poz.x + (poz.latime - latime) / 2,
      y: poz.y + 1.5,
      width: latime,
      height: inaltime,
    });
  }

  return doc.save({ updateFieldAppearances: false });
}

/**
 * Adaugă la sfârșit o pagină cu urma semnării.
 *
 * O semnătură desenată cu degetul e o semnătură electronică simplă: e valabilă,
 * dar valoarea ei ca probă vine din ce se poate arăta în jurul ei. Pagina asta
 * arată exact asta — cine, când, de unde, și amprenta documentului.
 */
export async function adaugaPaginaDeProba(
  pdf: Uint8Array,
  urma: {
    numar: number;
    tip: TipContract;
    semnatari: string[];
    dataSemnarii: Date;
    ip: string;
    agent: string;
  },
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdf);
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(await readFile(CALE_FONT), { subset: true });

  const pagina = doc.addPage([595.2756, 841.8898]);
  const { width, height } = pagina.getSize();

  // Amprenta se calculează pe documentul dinainte de această pagină: pagina
  // nu-și poate conține propriul hash.
  const amprenta = createHash("sha256").update(pdf).digest("hex");

  const cerneala = rgb(0.21, 0.24, 0.27);
  const stins = rgb(0.45, 0.48, 0.52);

  let y = height - 90;

  pagina.drawText("Dovada semnării electronice", {
    x: 70, y, size: 16, font, color: cerneala,
  });

  y -= 34;
  pagina.drawLine({
    start: { x: 70, y }, end: { x: width - 70, y },
    thickness: 0.7, color: rgb(0.78, 0.8, 0.82),
  });

  const randuri: [string, string][] = [
    ["Contract", `Nr. ${urma.numar}, tip ${urma.tip === "MINOR" ? "minor" : "adult"}`],
    ["Semnat de", urma.semnatari.join("; ")],
    [
      "Data și ora",
      new Intl.DateTimeFormat("ro-RO", {
        dateStyle: "long", timeStyle: "short", timeZone: "Europe/Bucharest",
      }).format(urma.dataSemnarii) + " (ora României)",
    ],
    ["Adresă IP", urma.ip],
    ["Dispozitiv", urma.agent.slice(0, 110)],
    ["Amprenta contractului", amprenta.slice(0, 32)],
    ["", amprenta.slice(32)],
  ];

  y -= 32;
  for (const [eticheta, valoare] of randuri) {
    if (eticheta) {
      pagina.drawText(eticheta, { x: 70, y, size: 9, font, color: stins });
    }
    pagina.drawText(valoare, { x: 195, y, size: 10, font, color: cerneala });
    y -= eticheta ? 26 : 14;
  }

  y -= 16;
  for (const linie of [
    "Documentul a fost completat și semnat online, prin formularul securizat al",
    "cabinetului. Amprenta de mai sus acoperă paginile semnate ale contractului,",
    "fără această pagină: dacă textul semnat este modificat ulterior, amprenta",
    "recalculată nu va mai corespunde.",
  ]) {
    pagina.drawText(linie, { x: 70, y, size: 9.5, font, color: stins });
    y -= 15;
  }

  return doc.save();
}

export function amprenta(pdf: Uint8Array): string {
  return createHash("sha256").update(pdf).digest("hex");
}
