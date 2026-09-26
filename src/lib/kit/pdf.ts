import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFImage, type PDFPage, type RGB } from "pdf-lib";
import { SITE } from "@/content/site";
import { paragrafe, type RaportAI } from "./raport";
import {
  NIVELURI,
  areCopii,
  capitoleRecomandate,
  eSeparat,
  type Raspunsuri,
  type Rezultat,
} from "./test";

/* ----------------------------------------------------------------------------
   Raportul personal din kit, în PDF (A4).

   Construit cu pdf-lib, în identitatea cabinetului: Lora pentru titluri,
   Source Sans 3 pentru text, paleta „salvie și cretă". Structura urmează un
   raport de consiliere: copertă, cuprins, rezultatul pe dimensiuni, analiza
   personală, puncte forte și zone de atenție, plan pe 30 de zile, întrebări
   pentru o discuție în doi, capitolele din ghid și pașii următori.
   -------------------------------------------------------------------------- */

const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

const C = {
  verde: hex("#6e8567"),
  verdeInchis: hex("#46573f"),
  verdeDeschis: hex("#b7c7ae"),
  verdePal: hex("#dce0d4"),
  nisip: hex("#a08b6f"),
  nisipPal: hex("#efe8de"),
  crem: hex("#f3f4ee"),
  cremCald: hex("#f8f9f4"),
  cremAdanc: hex("#e9ebe1"),
  cerneala: hex("#363c45"),
  cernealaMoale: hex("#5c626c"),
  cernealaStearsa: hex("#8b9098"),
  lut: hex("#a8624a"),
  lutPal: hex("#f3e4dd"),
  alb: rgb(1, 1, 1),
};

const W = 595.28;
const H = 841.89;
const MX = 58;
const SUS = 84;
const JOS = 74;
const LATIME = W - MX * 2;

type Fonturi = {
  titlu: PDFFont;
  titluBold: PDFFont;
  titluItalic: PDFFont;
  text: PDFFont;
  textSemi: PDFFont;
  textBold: PDFFont;
};

type DateRaport = {
  email: string | null;
  data: Date;
  raspunsuri: Raspunsuri;
  rezultat: Rezultat;
  ai: RaportAI | null;
};

const RADACINA = process.cwd();

/* ---------- Motorul de așezare ---------- */

class Document {
  doc!: PDFDocument;
  f!: Fonturi;
  pagina!: PDFPage;
  y = 0;
  cuprins: { titlu: string; pagina: number }[] = [];
  private caractere = new Map<PDFFont, Set<number>>();

  static async creeaza() {
    const d = new Document();
    d.doc = await PDFDocument.create();
    d.doc.registerFontkit(fontkit);
    const font = async (nume: string) =>
      d.doc.embedFont(await readFile(join(RADACINA, "ghiduri", "fonturi", nume)), { subset: true });
    d.f = {
      titlu: await font("Lora-Regular.ttf"),
      titluBold: await font("Lora-SemiBold.ttf"),
      titluItalic: await font("Lora-Italic.ttf"),
      text: await font("SourceSans3-Regular.ttf"),
      textSemi: await font("SourceSans3-SemiBold.ttf"),
      textBold: await font("SourceSans3-Bold.ttf"),
    };
    return d;
  }

  /** Scoate caracterele pe care fontul nu le are (emoji etc.), ca să nu pice desenarea. */
  curat(text: string, font: PDFFont) {
    let set = this.caractere.get(font);
    if (!set) {
      set = new Set(font.getCharacterSet());
      this.caractere.set(font, set);
    }
    return [...text.replace(/\t/g, " ")]
      .map((ch) => (set!.has(ch.codePointAt(0)!) ? ch : ch === " " ? " " : ""))
      .join("");
  }

  lat(text: string, font: PDFFont, marime: number) {
    return font.widthOfTextAtSize(this.curat(text, font), marime);
  }

  /** Împarte textul în rânduri care încap în lățimea dată. */
  rupe(text: string, font: PDFFont, marime: number, latime: number): string[] {
    const randuri: string[] = [];
    for (const bucata of this.curat(text, font).split("\n")) {
      let rand = "";
      for (const cuvant of bucata.split(/\s+/).filter(Boolean)) {
        const incercare = rand ? `${rand} ${cuvant}` : cuvant;
        if (font.widthOfTextAtSize(incercare, marime) <= latime || !rand) rand = incercare;
        else {
          randuri.push(rand);
          rand = cuvant;
        }
      }
      randuri.push(rand);
    }
    return randuri;
  }

  scrie(text: string, x: number, y: number, font: PDFFont, marime: number, culoare: RGB, pagina = this.pagina) {
    pagina.drawText(this.curat(text, font), { x, y, font, size: marime, color: culoare });
  }

  paginaNoua() {
    this.pagina = this.doc.addPage([W, H]);
    this.y = H - SUS;
    // antetul discret de pe fiecare pagină
    this.scrie("Cum stai, de fapt, cu relația ta?  ·  Raport personal", MX, H - 42, this.f.text, 8, C.cernealaStearsa);
    const dr = "Liliana Jgheban";
    this.scrie(dr, W - MX - this.lat(dr, this.f.titlu, 9), H - 42, this.f.titlu, 9, C.verde);
    this.pagina.drawLine({ start: { x: MX, y: H - 52 }, end: { x: W - MX, y: H - 52 }, thickness: 0.5, color: C.cremAdanc });
  }

  /** Asigură spațiu pentru `h` puncte; altfel trece pe pagina următoare. */
  loc(h: number) {
    if (this.y - h < JOS) this.paginaNoua();
  }

  ramas() {
    return this.y - JOS;
  }

  /** Un paragraf, rând cu rând, cu trecere pe pagina următoare când e nevoie. */
  paragraf(
    text: string,
    o: { font?: PDFFont; marime?: number; culoare?: RGB; x?: number; latime?: number; interlinie?: number; dupa?: number } = {},
  ) {
    const font = o.font ?? this.f.text;
    const marime = o.marime ?? 10.5;
    const inter = o.interlinie ?? marime * 1.62;
    const x = o.x ?? MX;
    for (const rand of this.rupe(text, font, marime, o.latime ?? LATIME)) {
      this.loc(inter);
      this.y -= inter;
      this.scrie(rand, x, this.y + (inter - marime) * 0.35, font, marime, o.culoare ?? C.cerneala);
    }
    this.y -= o.dupa ?? 9;
  }

  paragrafe(text: string, o: Parameters<Document["paragraf"]>[1] = {}) {
    for (const p of paragrafe(text)) this.paragraf(p, o);
  }

  /** Începutul unei secțiuni mari: kicker, titlu, linie verde, text introductiv. */
  sectiune(kicker: string, titlu: string, intro?: string, o: { paginaNoua?: boolean; inCuprins?: boolean } = {}) {
    if (o.paginaNoua === false && this.ramas() > 300) this.y -= 26;
    else this.paginaNoua();
    if (o.inCuprins !== false) this.cuprins.push({ titlu, pagina: this.doc.getPageCount() });

    this.scrie(kicker.toUpperCase(), MX, this.y - 8, this.f.textBold, 8, C.nisip);
    this.y -= 22;
    for (const rand of this.rupe(titlu, this.f.titlu, 25, LATIME)) {
      this.y -= 30;
      this.scrie(rand, MX, this.y, this.f.titlu, 25, C.cerneala);
    }
    this.y -= 14;
    this.pagina.drawRectangle({ x: MX, y: this.y, width: 34, height: 2, color: C.verde });
    this.y -= 20;
    if (intro) this.paragraf(intro, { culoare: C.cernealaMoale, marime: 10.5, dupa: 14 });
  }

  subtitlu(text: string, culoare = C.cerneala) {
    this.loc(60);
    this.y -= 22;
    this.scrie(text, MX, this.y, this.f.titluBold, 13.5, culoare);
    this.y -= 12;
  }

  /** Casetă cu fundal, măsurată înainte, ca să nu se rupă între pagini. */
  caseta(
    randuri: { text: string; font: PDFFont; marime: number; culoare: RGB; dupa?: number }[],
    o: { fundal: RGB; bordura?: RGB; padding?: number; x?: number; latime?: number } ,
  ) {
    const pad = o.padding ?? 16;
    const x = o.x ?? MX;
    const latime = o.latime ?? LATIME;
    const interior = latime - pad * 2 - (o.bordura ? 3 : 0);
    const blocuri = randuri.map((r) => ({ ...r, linii: this.rupe(r.text, r.font, r.marime, interior) }));
    const inaltime =
      pad * 2 + blocuri.reduce((s, b) => s + b.linii.length * b.marime * 1.5 + (b.dupa ?? 6), 0) - (blocuri.at(-1)?.dupa ?? 6);

    this.loc(inaltime + 8);
    const sus = this.y;
    this.pagina.drawRectangle({ x, y: sus - inaltime, width: latime, height: inaltime, color: o.fundal });
    if (o.bordura) this.pagina.drawRectangle({ x, y: sus - inaltime, width: 3, height: inaltime, color: o.bordura });

    let y = sus - pad;
    const tx = x + pad + (o.bordura ? 3 : 0);
    for (const b of blocuri) {
      for (const linie of b.linii) {
        y -= b.marime * 1.5;
        this.scrie(linie, tx, y + b.marime * 0.3, b.font, b.marime, b.culoare);
      }
      y -= b.dupa ?? 6;
    }
    this.y = sus - inaltime - 14;
  }

  /** Listă numerotată, cu bulină colorată. */
  listaNumerotata(elemente: string[], culoare: RGB) {
    elemente.forEach((el, i) => {
      const linii = this.rupe(el, this.f.text, 10.5, LATIME - 34);
      const h = linii.length * 16 + 12;
      this.loc(h);
      const sus = this.y;
      this.pagina.drawCircle({ x: MX + 10, y: sus - 14, size: 10, color: culoare });
      const nr = String(i + 1);
      this.scrie(nr, MX + 10 - this.lat(nr, this.f.textBold, 9.5) / 2, sus - 17.4, this.f.textBold, 9.5, C.alb);
      let y = sus - 4;
      for (const l of linii) {
        y -= 16;
        this.scrie(l, MX + 32, y + 3, this.f.text, 10.5, C.cerneala);
      }
      this.y = sus - h;
      if (i < elemente.length - 1) {
        this.pagina.drawLine({ start: { x: MX + 32, y: this.y + 5 }, end: { x: W - MX, y: this.y + 5 }, thickness: 0.5, color: C.cremAdanc });
      }
    });
    this.y -= 8;
  }

  /** Bara unei dimensiuni: nume, scor, nivel, descriere. */
  bara(nume: string, pct: number, culoare: RGB, eticheta: string, descriere: string) {
    const linii = this.rupe(descriere, this.f.text, 9.5, LATIME);
    this.loc(44 + linii.length * 14);
    this.y -= 14;
    this.scrie(nume, MX, this.y, this.f.textSemi, 11, C.cerneala);
    const scor = `${pct}/100`;
    this.scrie(scor, W - MX - this.lat(scor, this.f.textBold, 11), this.y, this.f.textBold, 11, culoare);
    const et = eticheta.toUpperCase();
    const etW = this.lat(et, this.f.textBold, 7);
    this.pagina.drawRectangle({ x: W - MX - this.lat(scor, this.f.textBold, 11) - etW - 22, y: this.y - 3, width: etW + 12, height: 13, color: C.cremCald, borderColor: culoare, borderWidth: 0.6 });
    this.scrie(et, W - MX - this.lat(scor, this.f.textBold, 11) - etW - 16, this.y + 0.8, this.f.textBold, 7, culoare);
    this.y -= 12;
    this.pagina.drawRectangle({ x: MX, y: this.y, width: LATIME, height: 7, color: C.cremAdanc });
    this.pagina.drawRectangle({ x: MX, y: this.y, width: Math.max(4, (LATIME * pct) / 100), height: 7, color: culoare });
    this.y -= 4;
    for (const l of linii) {
      this.y -= 14;
      this.scrie(l, MX, this.y, this.f.text, 9.5, C.cernealaMoale);
    }
    this.y -= 12;
  }
}

/* ---------- Logo-ul (din SVG-ul site-ului) ---------- */

type BucataLogo = { d: string; tx: number; ty: number; deschis: boolean };

async function logo(): Promise<BucataLogo[]> {
  try {
    const svg = await readFile(join(RADACINA, "public", "logo-deschis.svg"), "utf8");
    const bucati: BucataLogo[] = [];
    for (const m of svg.matchAll(/translate\(([\d.]+),\s*([\d.]+)\)"><g><path d="([^"]+)"/g)) {
      bucati.push({ tx: Number(m[1]), ty: Number(m[2]), d: m[3], deschis: false });
    }
    const creier = svg.match(/<path fill="#b7c7ae" d="([^"]+)"/);
    if (creier) bucati.push({ tx: 0, ty: 0, d: creier[1], deschis: true });
    return bucati;
  } catch {
    return [];
  }
}

function deseneazaLogo(pagina: PDFPage, bucati: BucataLogo[], cx: number, sus: number, latime: number) {
  const scala = latime / 375;
  const x = cx - latime / 2;
  for (const b of bucati) {
    pagina.drawSvgPath(b.d, {
      x: x + b.tx * scala,
      y: sus - b.ty * scala,
      scale: scala,
      color: b.deschis ? C.verdeDeschis : C.crem,
    });
  }
}

/* ---------- Raportul ---------- */

const dataRo = (d: Date) =>
  new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Bucharest" }).format(d);

export async function genereazaRaportPdf(date: DateRaport): Promise<Uint8Array> {
  const d = await Document.creeaza();
  const { f } = d;
  const { rezultat: rez, ai, raspunsuri: r } = date;
  const separat = eSeparat(r);

  let fundal: PDFImage | null = null;
  let portret: PDFImage | null = null;
  try {
    fundal = await d.doc.embedJpg(await readFile(join(RADACINA, "public", "foto", "consiliere-hero.jpg")));
    portret = await d.doc.embedJpg(await readFile(join(RADACINA, "public", "foto", "liliana-portret-1.jpg")));
  } catch {
    /* fără fotografii, raportul rămâne valid */
  }

  d.doc.setTitle("Cum stai, de fapt, cu relația ta? · Raport personal");
  d.doc.setAuthor("Liliana Jgheban, psiholog");
  d.doc.setSubject("Raport personal din kitul „Cum stai, de fapt, cu relația ta?”");
  d.doc.setCreator(SITE.url);

  /* ===== COPERTA ===== */
  const c = d.doc.addPage([W, H]);
  if (fundal) {
    const h = H;
    const w = (fundal.width / fundal.height) * h;
    c.drawImage(fundal, { x: (W - w) / 2 - 60, y: 0, width: w, height: h });
  }
  c.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.verdeInchis, opacity: fundal ? 0.86 : 1 });

  deseneazaLogo(c, await logo(), W / 2, H - 92, 96);

  const centru = (text: string, y: number, font: PDFFont, marime: number, culoare: RGB) =>
    d.scrie(text, (W - d.lat(text, font, marime)) / 2, y, font, marime, culoare, c);

  const spatiat = (text: string) => [...text].join(" ");
  centru(spatiat("RAPORT PERSONAL · KIT PENTRU CUPLU"), H - 300, f.textSemi, 8, C.verdeDeschis);
  centru("Cum stai, de fapt,", H - 348, f.titluBold, 34, C.crem);
  centru("cu relația ta?", H - 390, f.titluBold, 34, C.crem);
  c.drawRectangle({ x: W / 2 - 26, y: H - 418, width: 52, height: 1.2, color: C.nisip });

  const subtitlu = ai?.titlu || rez.profil.scurt;
  let ys = H - 450;
  for (const rand of d.rupe(subtitlu, f.titluItalic, 13, 360)) {
    centru(rand, ys, f.titluItalic, 13, hex("#e4e9df"));
    ys -= 20;
  }

  // caseta cu datele raportului
  const cx = MX + 10;
  const cw = W - 2 * cx;
  const cy = 150;
  c.drawRectangle({ x: cx, y: cy, width: cw, height: 116, color: C.alb, opacity: 0.07, borderColor: C.crem, borderOpacity: 0.25, borderWidth: 0.6 });
  const celula = (et: string, val: string, x: number, y: number) => {
    d.scrie(et.toUpperCase(), x, y, f.textSemi, 7, hex("#aab8a3"), c);
    const linii = d.rupe(val, f.textSemi, 11.5, cw / 2 - 40);
    d.scrie(linii[0] + (linii.length > 1 ? "…" : ""), x, y - 16, f.textSemi, 11.5, C.crem, c);
  };
  celula("Indicele relației", `${rez.indice} din 100`, cx + 22, cy + 86);
  celula("Profil", rez.profil.nume, cx + cw / 2 + 6, cy + 86);
  celula("Pregătit pentru", date.email ?? "—", cx + 22, cy + 38);
  celula("Data", dataRo(date.data), cx + cw / 2 + 6, cy + 38);

  centru("Liliana Jgheban", 88, f.titluBold, 13, C.crem);
  centru(spatiat("CABINET INDIVIDUAL DE PSIHOLOGIE"), 70, f.textSemi, 7, hex("#aab8a3"));
  centru("Document confidențial, doar pentru tine", 44, f.text, 8, hex("#8fa088"));

  /* ===== CUPRINS (se completează la final, când știm paginile) ===== */
  d.paginaNoua();
  const paginaCuprins = d.pagina;
  d.scrie("ÎNAINTE SĂ ÎNCEPI", MX, d.y - 8, f.textBold, 8, C.nisip);
  d.y -= 52;
  d.scrie("Cum să citești acest raport", MX, d.y, f.titlu, 25, C.cerneala);
  d.y -= 16;
  d.pagina.drawRectangle({ x: MX, y: d.y, width: 34, height: 2, color: C.verde });
  d.y -= 20;
  d.paragraf(
    "Raportul pornește de la cele 30 de răspunsuri ale tale și le citește prin șase dimensiuni ale unei relații: comunicarea, conflictul, apropierea, încrederea, respectul și sentimentul de echipă. Scorurile nu sunt note și nu sunt o etichetă; arată unde relația are resurse și unde are nevoie de grijă, așa cum o vezi tu acum.",
    { culoare: C.cernealaMoale },
  );
  d.paragraf(
    "Citește-l în liniște, pe bucăți, și revino la el. Unele pagini s-ar putea să doară, altele s-ar putea să-ți dea speranță. Amândouă sunt firești.",
    { culoare: C.cernealaMoale, dupa: 22 },
  );
  d.scrie("CUPRINS", MX, d.y, f.textBold, 8, C.nisip);
  d.y -= 14;
  const cuprinsY = d.y;

  /* ===== 1. REZULTATUL ===== */
  d.sectiune("Secțiunea 1 · Rezultatul", "Unde se află relația ta acum", undefined);

  // indicele mare + scala pe patru zone
  d.loc(170);
  const sus = d.y;
  d.scrie(String(rez.indice), MX, sus - 58, f.titluBold, 64, C.verde);
  d.scrie("/ 100", MX + d.lat(String(rez.indice), f.titluBold, 64) + 8, sus - 58, f.titlu, 16, C.cernealaStearsa);
  d.scrie("INDICELE RELAȚIEI", MX, sus - 78, f.textBold, 7.5, C.cernealaStearsa);
  const px = MX + 170;
  const pw = W - MX - px;
  let ypr = sus - 14;
  for (const rand of d.rupe(rez.profil.nume, f.titluBold, 17, pw)) {
    d.scrie(rand, px, ypr, f.titluBold, 17, C.cerneala);
    ypr -= 22;
  }
  for (const rand of d.rupe(rez.profil.scurt, f.text, 10, pw)) {
    d.scrie(rand, px, ypr, f.text, 10, C.cernealaMoale);
    ypr -= 15;
  }
  d.y = Math.min(sus - 96, ypr - 10);

  const zone = [
    { de: 0, la: 35, culoare: NIVELURI.critic.culoare, nume: "Deconectare" },
    { de: 35, la: 55, culoare: NIVELURI.presiune.culoare, nume: "Criză" },
    { de: 55, la: 75, culoare: NIVELURI.ingrijit.culoare, nume: "Pusă la încercare" },
    { de: 75, la: 100, culoare: NIVELURI.resursa.culoare, nume: "Rădăcini solide" },
  ];
  const sy = d.y - 20;
  for (const z of zone) {
    const x = MX + (LATIME * z.de) / 100;
    const w = (LATIME * (z.la - z.de)) / 100;
    d.pagina.drawRectangle({ x: x + 1, y: sy, width: w - 2, height: 8, color: hex(z.culoare), opacity: 0.85 });
    d.scrie(z.nume, x + 2, sy - 13, f.text, 8, C.cernealaMoale);
  }
  const mx = MX + (LATIME * rez.indice) / 100;
  d.pagina.drawSvgPath("M 0 0 L 6 -9 L -6 -9 Z", { x: mx, y: sy + 19, color: C.cerneala });
  d.y = sy - 34;

  d.paragraf(rez.profil.descriere, { dupa: 16 });
  if (separat) {
    d.caseta(
      [{ text: "Pentru că relația voastră s-a încheiat sau e în curs de încheiere, scorurile descriu relația așa cum a fost în ultima perioadă. Sunt utile pentru a înțelege ce s-a întâmplat și ce vrei să iei cu tine mai departe.", font: f.text, marime: 9.5, culoare: C.cernealaMoale }],
      { fundal: C.cremCald, bordura: C.nisip },
    );
  }

  d.subtitlu("Profilul tău pe cele șase dimensiuni");
  d.y -= 4;
  for (const dim of rez.dimensiuni) {
    const niv = NIVELURI[dim.nivel];
    d.bara(dim.nume, dim.pct, hex(niv.culoare), niv.nume, `${dim.descriere} ${dim.niveluri[dim.nivel]}`);
  }

  if (rez.semnale.length) {
    d.subtitlu("Semnale care cer atenție", C.lut);
    for (const s of rez.semnale) {
      d.caseta(
        [
          { text: s.titlu, font: f.textBold, marime: 10.5, culoare: C.lut, dupa: 4 },
          { text: s.text, font: f.text, marime: 9.8, culoare: C.cerneala },
        ],
        { fundal: C.lutPal, bordura: C.lut },
      );
    }
  }

  /* ===== 2. REZUMAT + TIPAR ===== */
  if (ai) {
    d.sectiune("Secțiunea 2 · Interpretare", "Ce spun, de fapt, răspunsurile tale");
    if (ai.titlu) {
      d.caseta([{ text: ai.titlu, font: f.titluItalic, marime: 13, culoare: C.verdeInchis }], { fundal: C.verdePal, padding: 18 });
    }
    d.paragrafe(ai.rezumat);

    if (ai.tipar.titlu && ai.tipar.text) {
      // titlul, caseta și primele rânduri rămân împreună pe aceeași pagină
      d.loc(240);
      d.subtitlu("Tiparul relației voastre");
      d.caseta(
        [
          { text: "TIPARUL", font: f.textBold, marime: 7.5, culoare: C.verdeDeschis, dupa: 2 },
          { text: ai.tipar.titlu, font: f.titluBold, marime: 15, culoare: C.crem },
        ],
        { fundal: C.verdeInchis, padding: 18 },
      );
      d.paragrafe(ai.tipar.text);
      d.paragraf(
        "Din ghid: „Fără identificarea tiparului relațional, conflictele se vor repeta, indiferent de context.”",
        { font: f.titluItalic, culoare: C.cernealaMoale, marime: 10 },
      );
    }

    /* ===== 3. ANALIZA PE DIMENSIUNI ===== */
    d.sectiune(
      "Secțiunea 3 · Analiză",
      "Relația ta, dimensiune cu dimensiune",
      "Pentru fiecare dimensiune: ce arată răspunsurile tale, ce înseamnă și ce merită să reții.",
    );
    rez.dimensiuni.forEach((dim, i) => {
      const text = ai.dimensiuni.find((x) => x.cheie === dim.cheie);
      const niv = NIVELURI[dim.nivel];
      d.loc(150);
      d.y -= 18;
      const nr = String(i + 1).padStart(2, "0");
      d.scrie(nr, MX, d.y, f.titlu, 22, hex(niv.culoare));
      d.scrie(dim.nume, MX + 40, d.y + 2, f.titluBold, 16, C.cerneala);
      const et = `${dim.pct}/100 · ${niv.nume}`;
      d.scrie(et, W - MX - d.lat(et, f.textSemi, 9.5), d.y + 4, f.textSemi, 9.5, hex(niv.culoare));
      d.y -= 12;
      d.pagina.drawLine({ start: { x: MX, y: d.y }, end: { x: W - MX, y: d.y }, thickness: 0.6, color: C.cremAdanc });
      d.y -= 8;
      d.paragrafe(text?.text || dim.niveluri[dim.nivel]);
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

    /* ===== 4. FORTE + ATENȚIE ===== */
    if (ai.puncteForte.length || ai.atentie.length) {
      d.sectiune("Secțiunea 4 · Puncte cheie", "Ce vă ține și la ce să fii atent");
      if (ai.puncteForte.length) {
        d.subtitlu("Ce funcționează, pe ce vă puteți sprijini", C.verde);
        d.y -= 4;
        d.listaNumerotata(ai.puncteForte, C.verde);
      }
      if (ai.atentie.length) {
        d.subtitlu("La ce să fii atent", C.lut);
        d.y -= 4;
        d.listaNumerotata(ai.atentie, C.lut);
      }
    }

    /* ===== COPIII ===== */
    if (ai.copii && areCopii(r)) {
      d.sectiune(
        "Secțiunea 5 · Copiii",
        "Ce trăiesc copiii voștri",
        typeof r.varste_copii === "string" && r.varste_copii ? `Vârstele copiilor, așa cum le-ai spus: ${r.varste_copii}.` : undefined,
        { paginaNoua: false },
      );
      d.paragrafe(ai.copii);
      d.caseta(
        [
          { text: "DIN GHID", font: f.textBold, marime: 7.5, culoare: C.nisip, dupa: 3 },
          { text: "Divorțul destramă cuplul, nu parentalitatea. Nu divorțul în sine afectează cel mai mult copilul, ci conflictul parental prelungit.", font: f.titluItalic, marime: 11.5, culoare: C.cerneala },
        ],
        { fundal: C.nisipPal },
      );
    }

    /* ===== PLANUL PE 30 DE ZILE ===== */
    if (ai.plan.length) {
      d.sectiune(
        "Direcție",
        "Planul tău pentru următoarele 30 de zile",
        "Pași mici, în ordinea în care merită parcurși. E o hartă, nu o obligație: dacă o săptămână e prea grea, rămâi la ea mai mult.",
      );
      ai.plan.forEach((sapt, i) => {
        const ultim = i === ai.plan.length - 1;
        const pasi = sapt.pasi.map((p) => d.rupe(p, f.text, 10, LATIME - 44));
        const h = 30 + pasi.reduce((s, l) => s + l.length * 15 + 5, 0) + 12;
        d.loc(h);
        const sus = d.y;
        d.pagina.drawCircle({ x: MX + 7, y: sus - 12, size: 6, color: C.verde });
        if (!ultim) d.pagina.drawLine({ start: { x: MX + 7, y: sus - 20 }, end: { x: MX + 7, y: sus - h }, thickness: 1.2, color: C.verdePal });
        d.scrie(`SĂPTĂMÂNA ${i + 1}`, MX + 26, sus - 8, f.textBold, 7.5, C.verde);
        const titlu = sapt.titlu.replace(/^Săptămâna\s*\d+\s*[:.]\s*/i, "");
        d.scrie(d.rupe(titlu, f.titluBold, 13, LATIME - 30)[0], MX + 26, sus - 25, f.titluBold, 13, C.cerneala);
        let y = sus - 32;
        for (const linii of pasi) {
          linii.forEach((l, j) => {
            y -= 15;
            if (j === 0) d.pagina.drawCircle({ x: MX + 31, y: y + 3.5, size: 1.8, color: C.nisip });
            d.scrie(l, MX + 40, y, f.text, 10, C.cernealaMoale);
          });
          y -= 5;
        }
        d.y = sus - h;
      });
    }

    /* ===== CONVERSAȚIA ===== */
    if (ai.conversatie.length) {
      d.sectiune(
        "Pentru voi",
        separat ? "Întrebări pentru reflecție" : "Întrebări pentru o discuție în doi",
        separat
          ? "Întrebări la care merită să revii, în scris sau în gând, în perioada care urmează."
          : "Alegeți un moment liniștit, fără telefoane și fără grabă. Nu trebuie să treceți prin toate într-o seară; una singură, discutată cu adevărat, valorează mai mult.",
        { paginaNoua: false },
      );
      ai.conversatie.forEach((q) => {
        d.caseta([{ text: q, font: f.titluItalic, marime: 11.5, culoare: C.cerneala }], { fundal: C.cremCald, bordura: C.verde, padding: 13 });
        d.y += 4;
      });
    }
  } else {
    // Fără interpretarea AI (încă): textele calculate, pe dimensiuni.
    d.sectiune("Secțiunea 2 · Analiză", "Relația ta, dimensiune cu dimensiune");
    for (const dim of rez.dimensiuni) {
      d.subtitlu(`${dim.nume} · ${dim.pct}/100`);
      d.paragraf(`${dim.descriere} ${dim.niveluri[dim.nivel]}`);
    }
  }

  /* ===== CE SĂ CITEȘTI ÎN GHID ===== */
  d.sectiune(
    "Ghidul din kit",
    "Ce să citești mai întâi în ghid",
    "Ghidul practic are 63 de pagini. Pornind de la rezultatul tău, acestea sunt capitolele care te privesc cel mai direct acum:",
    { paginaNoua: false },
  );
  d.listaNumerotata(capitoleRecomandate(r, rez), C.nisip);

  /* ===== PAȘII URMĂTORI ===== */
  d.sectiune("Ce urmează", "Pașii următori");
  if (ai?.incheiere) d.paragrafe(ai.incheiere);

  d.loc(150);
  const ky = d.y;
  const kw = (LATIME - 14) / 2;
  const card = (x: number, titlu: string, text: string, link: string) => {
    d.pagina.drawRectangle({ x, y: ky - 118, width: kw, height: 118, color: C.cremCald, borderColor: C.cremAdanc, borderWidth: 0.6 });
    d.scrie(titlu, x + 16, ky - 28, f.titluBold, 12.5, C.cerneala);
    let y = ky - 46;
    for (const l of d.rupe(text, f.text, 9.5, kw - 32)) {
      d.scrie(l, x + 16, y, f.text, 9.5, C.cernealaMoale);
      y -= 14;
    }
    d.scrie(link, x + 16, ky - 104, f.textSemi, 9, C.verde);
  };
  card(MX, "O ședință cu Liliana", "Raportul devine un plan concret, lucrat pe situația ta. În cabinet, în București, sau online.", `${SITE.url.replace("https://", "")}/programari`);
  card(MX + kw + 14, "Terapie de cuplu", "Dacă amândoi sunteți dispuși, ședințele de cuplu vă ajută să ieșiți din tiparul care vă ține blocați.", `Telefon: ${SITE.phone}`);
  d.y = ky - 136;

  // despre autoare
  const lp = 86;
  const hp = portret ? (portret.height / portret.width) * lp : 0;
  d.loc(Math.max(hp, 100) + 20);
  const ay = d.y;
  let tx = MX;
  if (portret) {
    d.pagina.drawImage(portret, { x: MX, y: ay - hp, width: lp, height: hp });
    tx = MX + lp + 18;
  }
  d.scrie("DESPRE AUTOARE", tx, ay - 10, f.textBold, 7.5, C.nisip);
  d.scrie("Liliana Jgheban", tx, ay - 30, f.titluBold, 15, C.cerneala);
  let yb = ay - 48;
  for (const l of d.rupe(
    "Psiholog clinician și psihoterapeut integrativ, cu cabinet în București. Lucrează cu adulți, cupluri, copii și părinți, și e autoarea ghidului practic despre cuplu, divorț și familie din acest kit.",
    f.text,
    9.5,
    W - MX - tx,
  )) {
    d.scrie(l, tx, yb, f.text, 9.5, C.cernealaMoale);
    yb -= 14;
  }
  d.y = Math.min(ay - hp - 16, yb - 12);

  d.caseta(
    [
      { text: "NOTĂ", font: f.textBold, marime: 7.5, culoare: C.nisip, dupa: 3 },
      {
        text: "Acest raport este un instrument de psihoeducație și autocunoaștere, creat pe baza unui test de reflecție și a ghidului Lilianei Jgheban. Nu este un test psihologic standardizat, nu pune diagnostice și nu înlocuiește o evaluare sau o ședință de terapie. Dacă ești în pericol, sună la 112; linia gratuită pentru victimele violenței domestice este 0800 500 333.",
        font: f.text,
        marime: 8.5,
        culoare: C.cernealaMoale,
      },
    ],
    { fundal: C.nisipPal, padding: 13 },
  );

  /* ===== CUPRINSUL, acum că știm paginile ===== */
  let yc = cuprinsY;
  d.cuprins.forEach((s, i) => {
    yc -= 26;
    const nr = String(i + 1).padStart(2, "0");
    d.scrie(nr, MX, yc, f.titlu, 12, C.verde, paginaCuprins);
    d.scrie(s.titlu, MX + 30, yc, f.titlu, 12, C.cerneala, paginaCuprins);
    const p = String(s.pagina);
    d.scrie(p, W - MX - d.lat(p, f.textSemi, 10), yc, f.textSemi, 10, C.cernealaMoale, paginaCuprins);
    paginaCuprins.drawLine({ start: { x: MX, y: yc - 9 }, end: { x: W - MX, y: yc - 9 }, thickness: 0.4, color: C.cremAdanc });
  });

  /* ===== Subsolul, cu numărul paginii ===== */
  const pagini = d.doc.getPages();
  pagini.forEach((p, i) => {
    if (i === 0) return;
    const text = `Pagina ${i + 1} din ${pagini.length}`;
    d.scrie("Raport confidențial", MX, 38, f.text, 7.5, C.cernealaStearsa, p);
    d.scrie(text, W - MX - d.lat(text, f.text, 7.5), 38, f.text, 7.5, C.cernealaStearsa, p);
  });

  return d.doc.save();
}
