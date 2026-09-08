import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { PDFDocument, PDFTextField, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

import { SABLOANE, type TipContract } from "./sabloane";

/* ----------------------------------------------------------------------------
   Completarea șablonului PDF.

   Două lucruri nu sunt evidente și merită explicate:

   1. Fontul. Câmpurile din șablon folosesc o codificare WinAnsi, care nu
      cunoaște „ș" și „ț" (U+0219 / U+021B). Fără fontul de mai jos, orice
      adresă din București sau nume cu ț ar arunca eroare la completare. De
      aceea încorporăm DejaVu Sans și recalculăm aspectul câmpurilor.

   2. Numele beneficiarului apare în mai multe locuri din contract, ca obiecte
      PDF diferite cu același nume. `getTextField(nume)` întoarce doar primul,
      așa că parcurgem toate câmpurile și le completăm pe toate cele care se
      potrivesc.
   -------------------------------------------------------------------------- */

const DIR_SABLOANE = join(process.cwd(), "contracte", "sabloane");
const CALE_FONT = join(process.cwd(), "contracte", "fonturi", "DejaVuSans.ttf");

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

  const valori: Record<string, string> = {
    ...date.campuri,
    contract_nr: String(date.numar),
    contract_data: dataRomaneasca(date.dataContractului),
    data_semnarii: dataRomaneasca(date.dataSemnarii),
    pret: String(date.pretLei),
  };

  for (const camp of form.getFields()) {
    if (!(camp instanceof PDFTextField)) continue;
    const valoare = valori[camp.getName()];
    if (valoare === undefined) continue;

    camp.setText(valoare);
    // Fără asta, aspectul rămâne desenat cu fontul vechi și diacriticele cad.
    camp.updateAppearances(font);
  }

  // Aplatizăm întâi, ca semnătura să rămână deasupra, nu sub căsuțe.
  form.flatten();

  const pagini = doc.getPages();

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

  return doc.save();
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
