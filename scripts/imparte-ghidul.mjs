/* ----------------------------------------------------------------------------
   Taie ghidul despre divorț (ghiduri/ghid-divort.pdf) în 4 părți (grupate din
   cele 6 ale cuprinsului: I · II+III · IV · V+VI),
   câte un PDF pe parte, în ghiduri/parti/. Fiecare parte se vinde separat.

   Fiecare PDF are: coperta, introducerea, paginile părții, concluziile,
   bibliografia și coperta de final. Cuprinsul (pagina 2) e lăsat deoparte,
   fiindcă descrie ghidul întreg.

   Părțile IV și V încep la jumătatea paginii (24, respectiv 54), deci aceste
   două pagini apar în ambele părți vecine (2 și 3, respectiv 3 și 4).

   Dacă Liliana schimbă ghidul, se refac paginile de mai jos și se rulează:
       node scripts/imparte-ghidul.mjs
   -------------------------------------------------------------------------- */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { PDFDocument } from "pdf-lib";

const SURSA = join("ghiduri", "ghid-divort.pdf");
const DESTINATIE = join("ghiduri", "parti");

/** Pagini numerotate de la 1, ca în cititorul de PDF. */
const COPERTA = [1];
const INTRODUCERE = [3, 4, 5];
const FINAL = [75, 76, 77, 78, 79]; // concluzii, bibliografie, coperta din spate

const interval = (de, la) => Array.from({ length: la - de + 1 }, (_, i) => de + i);

export const PARTI = [
  { nr: 1, fisier: "partea-1-relatia-de-cuplu.pdf", titlu: "Relația de cuplu", pagini: interval(6, 15) },
  { nr: 2, fisier: "partea-2-despartirea-si-divortul.pdf", titlu: "Despărțirea și divorțul", pagini: interval(16, 24) },
  { nr: 3, fisier: "partea-3-divortul-cu-copii.pdf", titlu: "Divorțul cu copii", pagini: interval(24, 54) },
  { nr: 4, fisier: "partea-4-viata-dupa-divort.pdf", titlu: "Viața după divorț", pagini: interval(54, 74) },
];

const sursa = await PDFDocument.load(readFileSync(SURSA));
const total = sursa.getPageCount();
mkdirSync(DESTINATIE, { recursive: true });

for (const p of PARTI) {
  const pagini = [...COPERTA, ...INTRODUCERE, ...p.pagini, ...FINAL];
  if (pagini.some((n) => n < 1 || n > total)) throw new Error(`Partea ${p.nr}: pagină în afara ghidului (are ${total})`);

  const doc = await PDFDocument.create();
  const copiate = await doc.copyPages(sursa, pagini.map((n) => n - 1));
  copiate.forEach((pg) => doc.addPage(pg));
  doc.setTitle(`Partea ${p.nr}: ${p.titlu}, Cum stai, de fapt, cu relația ta?`);
  doc.setAuthor("Liliana Jgheban");

  const bytes = await doc.save({ useObjectStreams: true });
  writeFileSync(join(DESTINATIE, p.fisier), bytes);
  console.log(`Partea ${p.nr} · ${p.titlu}: ${pagini.length} pagini, ${(bytes.length / 1e6).toFixed(1)} MB → ${p.fisier}`);
}
