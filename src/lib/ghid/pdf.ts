import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument, type PDFFont, type PDFImage, type RGB } from "pdf-lib";
import { SITE } from "@/content/site";
import { C, Document, H, LATIME, MX, W, dataRo, deseneazaLogo, hex, logo } from "../kit/pdf";
import { NIVELURI, areCopiiMinori, type Raspunsuri, type Rezultat } from "./chestionare";
import { NUME_GHID, numeParte, type Parte } from "./parti";
import type { RaportParte } from "./raport";

/* ----------------------------------------------------------------------------
   Ghidul personal: un singur PDF cu raportul tău (scris pe răspunsurile tale)
   urmat de partea cumpărată din ghid. Așezarea refolosește motorul raportului
   din trusa veche (kit/pdf.ts), în aceeași identitate vizuală.
   -------------------------------------------------------------------------- */

const RADACINA = process.cwd();

export const caleParte = (p: Parte) => join(RADACINA, "ghiduri", "parti", p.fisier);

type DateGhid = {
  email: string | null;
  data: Date;
  parte: Parte;
  rezultat: Rezultat;
  raspunsuri: Raspunsuri;
  ai: RaportParte | null;
};

export async function genereazaGhidPersonalPdf(date: DateGhid): Promise<Uint8Array> {
  const { parte: p, rezultat: rez, ai, raspunsuri: r } = date;
  const d = await Document.creeaza();
  const { f } = d;
  d.antet = `${numeParte(p)}, raport personal`;

  let fundal: PDFImage | null = null;
  try {
    fundal = await d.doc.embedJpg(await readFile(join(RADACINA, "public", "foto", "consiliere-hero.jpg")));
  } catch {
    /* fără fotografie, coperta rămâne pe verde */
  }

  d.doc.setTitle(`${numeParte(p)}, ghidul tău personal`);
  d.doc.setAuthor("Liliana Jgheban, psihoterapeut");
  d.doc.setSubject(`Raport personal și ${numeParte(p)} din „${NUME_GHID}”`);
  d.doc.setCreator(SITE.url);

  /* ===== COPERTA ===== */
  const c = d.doc.addPage([W, H]);
  if (fundal) {
    const w = (fundal.width / fundal.height) * H;
    c.drawImage(fundal, { x: (W - w) / 2 - 60, y: 0, width: w, height: H });
  }
  c.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.verdeInchis, opacity: fundal ? 0.86 : 1 });
  deseneazaLogo(c, await logo(), W / 2, H - 92, 96);

  const centru = (text: string, y: number, font: PDFFont, marime: number, culoare: RGB) =>
    d.scrie(text, (W - d.lat(text, font, marime)) / 2, y, font, marime, culoare, c);
  const spatiat = (text: string) => [...text].join(" ");

  centru(spatiat(`RAPORT PERSONAL, PARTEA ${p.nr} DIN GHID`), H - 300, f.textSemi, 8, C.verdeDeschis);
  let yt = H - 348;
  for (const rand of d.rupe(p.titlu, f.titluBold, 34, 440)) {
    centru(rand, yt, f.titluBold, 34, C.crem);
    yt -= 42;
  }
  c.drawRectangle({ x: W / 2 - 26, y: yt + 14, width: 52, height: 1.2, color: C.nisip });
  let ys = yt - 18;
  for (const rand of d.rupe(ai?.titlu || rez.titlu, f.titluItalic, 13, 360)) {
    centru(rand, ys, f.titluItalic, 13, hex("#e4e9df"));
    ys -= 20;
  }

  const cx = MX + 10;
  const cw = W - 2 * cx;
  const cy = 150;
  c.drawRectangle({ x: cx, y: cy, width: cw, height: 116, color: C.alb, opacity: 0.07, borderColor: C.crem, borderOpacity: 0.25, borderWidth: 0.6 });
  const celula = (et: string, val: string, x: number, y: number) => {
    d.scrie(et.toUpperCase(), x, y, f.textSemi, 7, hex("#aab8a3"), c);
    const linii = d.rupe(val, f.textSemi, 11.5, cw / 2 - 40);
    d.scrie(linii[0] + (linii.length > 1 ? "…" : ""), x, y - 16, f.textSemi, 11.5, C.crem, c);
  };
  celula("Cât de greu e acum", `${rez.indice} din 100`, cx + 22, cy + 86);
  celula("Rezultat", NIVELURI[rez.nivel].nume, cx + cw / 2 + 6, cy + 86);
  celula("Pregătit pentru", date.email ?? "—", cx + 22, cy + 38);
  celula("Data", dataRo(date.data), cx + cw / 2 + 6, cy + 38);

  centru("Liliana Jgheban", 88, f.titluBold, 13, C.crem);
  centru(spatiat("CABINET INDIVIDUAL DE PSIHOLOGIE"), 70, f.textSemi, 7, hex("#aab8a3"));
  centru("Document confidențial, doar pentru tine", 44, f.text, 8, hex("#8fa088"));

  /* ===== CUM SĂ CITEȘTI ===== */
  d.paginaNoua();
  const paginaCuprins = d.pagina;
  d.scrie("ÎNAINTE SĂ ÎNCEPI", MX, d.y - 8, f.textBold, 8, C.nisip);
  d.y -= 52;
  d.scrie("Cum să citești acest document", MX, d.y, f.titlu, 25, C.cerneala);
  d.y -= 16;
  d.pagina.drawRectangle({ x: MX, y: d.y, width: 34, height: 2, color: C.verde });
  d.y -= 20;
  d.paragraf(
    `Documentul are două părți. Întâi raportul tău personal, scris pe baza celor 12 răspunsuri din chestionar, pe trei zone: ${rez.zone.map((z) => z.nume.toLowerCase()).join(", ")}. Apoi „${numeParte(p)}” din ghidul Lilianei, cu capitolele care lucrează exact aceste zone.`,
    { culoare: C.cernealaMoale },
  );
  d.paragraf(
    "Scorurile nu sunt note și nu sunt o etichetă: arată unde e mai greu acum și unde ai resurse, așa cum vezi tu lucrurile. Citește în liniște, pe bucăți, și revino.",
    { culoare: C.cernealaMoale, dupa: 22 },
  );
  d.scrie("CUPRINS", MX, d.y, f.textBold, 8, C.nisip);
  d.y -= 14;
  const cuprinsY = d.y;

  /* ===== REZULTATUL ===== */
  d.sectiune("Rezultatul", "Unde te afli acum");
  d.loc(110);
  const sus = d.y;
  d.scrie(String(rez.indice), MX, sus - 58, f.titluBold, 64, hex(NIVELURI[rez.nivel].culoare));
  d.scrie("/ 100", MX + d.lat(String(rez.indice), f.titluBold, 64) + 8, sus - 58, f.titlu, 16, C.cernealaStearsa);
  d.scrie("CÂT DE GREU E ACUM", MX, sus - 78, f.textBold, 7.5, C.cernealaStearsa);
  const px = MX + 170;
  let ypr = sus - 14;
  for (const rand of d.rupe(rez.titlu, f.titluBold, 17, W - MX - px)) {
    d.scrie(rand, px, ypr, f.titluBold, 17, C.cerneala);
    ypr -= 22;
  }
  d.y = Math.min(sus - 96, ypr - 10);
  d.paragraf(rez.text, { dupa: 16 });

  if (rez.siguranta) {
    d.caseta(
      [
        { text: "SIGURANȚA TA VINE ÎNTÂI", font: f.textBold, marime: 7.5, culoare: C.lut, dupa: 3 },
        {
          text: "Ai spus că ți-a fost frică de partener sau de fostul partener. Nu e vina ta și nu trebuie să treci prin asta fără ajutor. Dacă ești în pericol, sună la 112. Linia gratuită pentru victimele violenței domestice este 0800 500 333.",
          font: f.text,
          marime: 10,
          culoare: C.cerneala,
        },
      ],
      { fundal: C.lutPal, bordura: C.lut },
    );
  }

  d.subtitlu("Pe cele trei zone");
  d.y -= 4;
  for (const z of rez.zone) {
    const niv = NIVELURI[z.nivel];
    d.bara(z.nume, z.pct, hex(niv.culoare), niv.nume, `${z.descriere} ${z.text}`);
  }

  /* ===== INTERPRETAREA ===== */
  if (ai) {
    d.sectiune("Interpretare", "Ce spun, de fapt, răspunsurile tale");
    if (ai.titlu) d.caseta([{ text: ai.titlu, font: f.titluItalic, marime: 13, culoare: C.verdeInchis }], { fundal: C.verdePal, padding: 18 });
    d.paragrafe(ai.rezumat);

    d.sectiune("Analiză", "Zonă cu zonă", "Pentru fiecare zonă: ce arată răspunsurile tale, ce înseamnă și ce poți face.");
    rez.zone.forEach((z, i) => {
      const text = ai.zone.find((x) => x.cheie === z.cheie);
      const niv = NIVELURI[z.nivel];
      d.loc(150);
      d.y -= 18;
      d.scrie(String(i + 1).padStart(2, "0"), MX, d.y, f.titlu, 22, hex(niv.culoare));
      d.scrie(z.nume, MX + 40, d.y + 2, f.titluBold, 16, C.cerneala);
      const et = `${niv.nume}: ${z.pct}/100`;
      d.scrie(et, W - MX - d.lat(et, f.textSemi, 9.5), d.y + 4, f.textSemi, 9.5, hex(niv.culoare));
      d.y -= 12;
      d.pagina.drawLine({ start: { x: MX, y: d.y }, end: { x: W - MX, y: d.y }, thickness: 0.6, color: C.cremAdanc });
      d.y -= 8;
      d.paragrafe(text?.text || z.text);
      if (text?.deRetinut) {
        d.caseta(
          [
            { text: "DE REȚINUT", font: f.textBold, marime: 7.5, culoare: C.verde, dupa: 3 },
            { text: text.deRetinut, font: f.titluItalic, marime: 12, culoare: C.verdeInchis },
          ],
          { fundal: C.verdePal },
        );
      }
      d.y -= 10;
    });

    if (ai.puncteForte.length || ai.atentie.length) {
      d.sectiune("Puncte cheie", "Pe ce te sprijini și la ce să ai grijă");
      if (ai.puncteForte.length) {
        d.subtitlu("Resursele tale", C.verde);
        d.y -= 4;
        d.listaNumerotata(ai.puncteForte, C.verde);
      }
      if (ai.atentie.length) {
        d.subtitlu("La ce să ai grijă", C.lut);
        d.y -= 4;
        d.listaNumerotata(ai.atentie, C.lut);
      }
    }

    if (ai.copii) {
      d.sectiune(
        "Copiii",
        "Ce trăiesc copiii",
        areCopiiMinori(r) && r.varste_copii ? `Vârstele copiilor, așa cum le-ai spus: ${r.varste_copii}.` : undefined,
        { paginaNoua: false },
      );
      d.paragrafe(ai.copii);
    }

    if (ai.plan.length) {
      d.sectiune(
        "Direcție",
        "Planul tău pentru următoarele 30 de zile",
        "Pași mici, în ordinea în care merită parcurși. E o hartă, nu o obligație: dacă o săptămână e prea grea, rămâi la ea mai mult.",
      );
      ai.plan.forEach((sapt, i) => {
        const ultim = i === ai.plan.length - 1;
        const pasi = sapt.pasi.map((x) => d.rupe(x, f.text, 10, LATIME - 44));
        const h = 30 + pasi.reduce((s, l) => s + l.length * 15 + 5, 0) + 12;
        d.loc(h);
        const sy = d.y;
        d.pagina.drawCircle({ x: MX + 7, y: sy - 12, size: 6, color: C.verde });
        if (!ultim) d.pagina.drawLine({ start: { x: MX + 7, y: sy - 20 }, end: { x: MX + 7, y: sy - h }, thickness: 1.2, color: C.verdePal });
        d.scrie(`SĂPTĂMÂNA ${i + 1}`, MX + 26, sy - 8, f.textBold, 7.5, C.verde);
        const titlu = sapt.titlu.replace(/^Săptămâna\s*\d+\s*[:.]\s*/i, "");
        d.scrie(d.rupe(titlu, f.titluBold, 13, LATIME - 30)[0], MX + 26, sy - 25, f.titluBold, 13, C.cerneala);
        let y = sy - 32;
        for (const linii of pasi) {
          linii.forEach((l, j) => {
            y -= 15;
            if (j === 0) d.pagina.drawCircle({ x: MX + 31, y: y + 3.5, size: 1.8, color: C.nisip });
            d.scrie(l, MX + 40, y, f.text, 10, C.cernealaMoale);
          });
          y -= 5;
        }
        d.y = sy - h;
      });
    }

    if (ai.reflectie.length) {
      d.sectiune("Pentru tine", "Întrebări pentru reflecție", "Întrebări la care merită să revii, în scris sau în gând, în perioada care urmează.", {
        paginaNoua: false,
      });
      ai.reflectie.forEach((q) => {
        d.caseta([{ text: q, font: f.titluItalic, marime: 11.5, culoare: C.cerneala }], { fundal: C.cremCald, bordura: C.verde, padding: 13 });
        d.y += 4;
      });
    }
  } else {
    d.sectiune("Analiză", "Zonă cu zonă");
    for (const z of rez.zone) {
      d.subtitlu(`${z.nume}: ${z.pct}/100`);
      d.paragraf(`${z.descriere} ${z.text}`);
    }
  }

  /* ===== CE CITEȘTI ÎN PARTEA TA ===== */
  d.sectiune(
    "Partea ta din ghid",
    "Ce să citești mai întâi",
    `„${numeParte(p)}” urmează imediat după raport. Pornind de la răspunsurile tale, iată ordinea în care capitolele te ajută cel mai mult:`,
    { paginaNoua: false },
  );
  const capitole = ai?.capitole.length
    ? ai.capitole.map((x) => `${x.titlu}. ${x.deCe}`)
    : p.capitole;
  d.listaNumerotata(capitole, C.nisip);

  /* ===== PAȘII URMĂTORI ===== */
  d.sectiune("Ce urmează", "Pașii următori");
  if (ai?.incheiere) d.paragrafe(ai.incheiere);
  d.caseta(
    [
      { text: "O ședință cu Liliana", font: f.titluBold, marime: 12.5, culoare: C.cerneala, dupa: 4 },
      {
        text: `Raportul devine un plan concret, lucrat pe situația ta. În cabinet, în București, sau online. Programări: ${SITE.url.replace("https://", "")}/programari sau la ${SITE.phone}.`,
        font: f.text,
        marime: 9.8,
        culoare: C.cernealaMoale,
      },
    ],
    { fundal: C.cremCald, bordura: C.verde },
  );
  d.caseta(
    [
      { text: "NOTĂ", font: f.textBold, marime: 7.5, culoare: C.nisip, dupa: 3 },
      {
        text: "Acest raport este un instrument de psihoeducație și autocunoaștere, creat pe baza unui chestionar de reflecție și a ghidului Lilianei Jgheban. Nu este un test psihologic standardizat, nu pune diagnostice și nu înlocuiește o evaluare sau o ședință de terapie. Dacă ești în pericol, sună la 112; linia gratuită pentru victimele violenței domestice este 0800 500 333.",
        font: f.text,
        marime: 8.5,
        culoare: C.cernealaMoale,
      },
    ],
    { fundal: C.nisipPal, padding: 13 },
  );

  // Cuprinsul raportului, plus începutul părții din ghid
  const paginiRaport = d.doc.getPageCount();
  let yc = cuprinsY;
  [...d.cuprins, { titlu: numeParte(p), pagina: paginiRaport + 1 }].forEach((s, i) => {
    yc -= 26;
    d.scrie(String(i + 1).padStart(2, "0"), MX, yc, f.titlu, 12, C.verde, paginaCuprins);
    d.scrie(s.titlu, MX + 30, yc, f.titlu, 12, C.cerneala, paginaCuprins);
    const nr = String(s.pagina);
    d.scrie(nr, W - MX - d.lat(nr, f.textSemi, 10), yc, f.textSemi, 10, C.cernealaMoale, paginaCuprins);
    paginaCuprins.drawLine({ start: { x: MX, y: yc - 9 }, end: { x: W - MX, y: yc - 9 }, thickness: 0.4, color: C.cremAdanc });
  });

  d.doc.getPages().forEach((pg, i) => {
    if (i === 0) return;
    const text = `Pagina ${i + 1}`;
    d.scrie("Raport confidențial", MX, 38, f.text, 7.5, C.cernealaStearsa, pg);
    d.scrie(text, W - MX - d.lat(text, f.text, 7.5), 38, f.text, 7.5, C.cernealaStearsa, pg);
  });

  /* ===== PARTEA DIN GHID, lipită după raport ===== */
  const sursa = await PDFDocument.load(await readFile(caleParte(p)));
  const copiate = await d.doc.copyPages(sursa, sursa.getPageIndices());
  copiate.forEach((pg) => d.doc.addPage(pg));

  return d.doc.save({ useObjectStreams: true });
}

