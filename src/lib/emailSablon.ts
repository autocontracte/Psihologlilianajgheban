import { SITE } from "@/content/site";

/* ----------------------------------------------------------------------------
   Aspectul emailurilor — în tema site-ului.

   Fiecare email se descrie o singură dată, pe bucăți (titlu, paragrafe,
   detalii, buton), iar de aici ies ambele variante: HTML-ul îngrijit și
   textul simplu, pentru programele care nu arată HTML.

   HTML-ul e scris pentru programele de email, nu pentru browser: tabele,
   stiluri pe fiecare element, fonturi de rezervă (Georgia pentru Lora),
   fără SVG și fără imagini de fundal. Tot ce vine de la oameni (nume,
   mesaje) se escapează.
   -------------------------------------------------------------------------- */

const C = {
  crem: "#f3f4ee",
  cremAdanc: "#e9ebe1",
  alb: "#ffffff",
  verde: "#6e8567",
  verdeInchis: "#46573f",
  verdeDeschis: "#b7c7ae",
  verdePal: "#dce0d4",
  nisip: "#a08b6f",
  cerneala: "#363c45",
  cernealaMoale: "#5c626c",
  cernealaStearsa: "#8b9098",
};

const SERIF = "Lora, Georgia, 'Times New Roman', serif";
const SANS = "'Source Sans 3', 'Segoe UI', Helvetica, Arial, sans-serif";

export type ContinutEmail = {
  /** Eticheta mică de deasupra titlului, de exemplu „Programare confirmată”. */
  eticheta?: string;
  titlu: string;
  /** Textul care apare în lista de emailuri, lângă subiect. */
  previzualizare?: string;
  salut?: string;
  paragrafe?: string[];
  /** Caseta cu datele (ședința, clientul etc.). */
  detalii?: { eticheta: string; valoare: string }[];
  /** Un mesaj lung (al clientului), arătat ca citat. */
  citat?: { eticheta: string; text: string };
  dupaDetalii?: string[];
  buton?: { text: string; href: string };
  /** Linkuri secundare, sub buton (de exemplu, adăugarea în calendar). */
  linkuri?: { text: string; href: string }[];
  /** Semnătura Lilianei, pentru emailurile către clienți. */
  semnatura?: boolean;
  /** Înștiințare pentru cabinet: subsol scurt, fără semnătură. */
  intern?: boolean;
};

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Text cu rânduri noi și linkuri clicabile, escapat. */
function textHtml(s: string): string {
  return esc(s)
    .replace(/(https?:\/\/[^\s<]+)/g, (u) => `<a href="${u}" style="color:${C.verde};text-decoration:underline;">${u}</a>`)
    .replace(/\n/g, "<br>");
}

const p = (html: string, extra = "") =>
  `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:1.7;color:${C.cernealaMoale};${extra}">${html}</p>`;

function html(c: ContinutEmail): string {
  const logo = `${SITE.url}/email/logo-lj.png`;
  const parti: string[] = [];

  if (c.salut) parti.push(p(esc(c.salut), `color:${C.cerneala};`));
  for (const t of c.paragrafe ?? []) parti.push(p(textHtml(t)));

  if (c.detalii?.length) {
    const randuri = c.detalii
      .map(
        (d, i) => `<tr>
  <td style="padding:${i ? "12px" : "0"} 0 0;font-family:${SANS};font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:${C.cernealaStearsa};">${esc(d.eticheta)}</td>
</tr>
<tr>
  <td style="padding:3px 0 0;font-family:${SANS};font-size:16px;line-height:1.5;color:${C.cerneala};font-weight:600;">${textHtml(d.valoare)}</td>
</tr>`,
      )
      .join("");
    parti.push(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;background:${C.crem};border-left:3px solid ${C.verde};">
<tr><td style="padding:20px 24px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${randuri}</table></td></tr>
</table>`);
  }

  if (c.citat) {
    parti.push(`<p style="margin:0 0 6px;font-family:${SANS};font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:${C.cernealaStearsa};">${esc(c.citat.eticheta)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;"><tr>
<td style="padding:4px 0 4px 18px;border-left:2px solid ${C.verdePal};font-family:${SERIF};font-style:italic;font-size:16px;line-height:1.7;color:${C.cerneala};">${textHtml(c.citat.text)}</td>
</tr></table>`);
  }

  for (const t of c.dupaDetalii ?? []) parti.push(p(textHtml(t)));

  if (c.buton) {
    parti.push(`<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:12px 0 24px;"><tr>
<td style="background:${C.verde};">
<a href="${esc(c.buton.href)}" style="display:inline-block;padding:15px 30px;font-family:${SANS};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.2px;">${esc(c.buton.text)} &rarr;</a>
</td></tr></table>`);
  }

  if (c.linkuri?.length) {
    parti.push(
      p(
        c.linkuri
          .map((l) => `<a href="${esc(l.href)}" style="color:${C.verde};text-decoration:underline;">${esc(l.text)}</a>`)
          .join(`<span style="color:${C.verdePal};">&nbsp;&nbsp;·&nbsp;&nbsp;</span>`),
        "font-size:14px;",
      ),
    );
  }

  if (c.semnatura) {
    parti.push(`<p style="margin:28px 0 0;font-family:${SANS};font-size:16px;line-height:1.7;color:${C.cernealaMoale};">Cu drag,</p>
<p style="margin:4px 0 0;font-family:${SERIF};font-size:20px;line-height:1.3;color:${C.cerneala};">Liliana Jgheban</p>
<p style="margin:2px 0 0;font-family:${SANS};font-size:13px;color:${C.cernealaStearsa};">Psiholog clinician și psihoterapeut integrativ</p>`);
  }

  const subsol = c.intern
    ? `Înștiințare automată de pe <a href="${SITE.url}" style="color:${C.verde};text-decoration:none;">${esc(SITE.url.replace(/^https?:\/\//, ""))}</a>`
    : `<span style="font-family:${SERIF};font-size:15px;color:${C.cerneala};">Liliana Jgheban</span><br>
Cabinet individual de psihologie · ${esc(SITE.city)}<br>
<a href="tel:${esc(SITE.phoneHref)}" style="color:${C.cernealaMoale};text-decoration:none;">${esc(SITE.phone)}</a>
&nbsp;·&nbsp;
<a href="mailto:${esc(SITE.email)}" style="color:${C.cernealaMoale};text-decoration:none;">${esc(SITE.email)}</a><br>
<a href="${SITE.url}" style="color:${C.verde};text-decoration:none;">${esc(SITE.url.replace(/^https?:\/\//, ""))}</a>
<br><br><span style="font-size:12px;color:${C.cernealaStearsa};">Acest email e confidențial și e destinat doar persoanei căreia îi este adresat.</span>`;

  return `<!DOCTYPE html>
<html lang="ro" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(c.titlu)}</title>
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet">
<style>
  @media (max-width:620px){ .card{padding:32px 24px !important;} .titlu{font-size:26px !important;} }
</style>
</head>
<body style="margin:0;padding:0;background:${C.cremAdanc};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(c.previzualizare ?? c.titlu)}&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cremAdanc};">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
  <tr><td align="center" style="background:${C.verdeInchis};padding:30px 24px 26px;">
    <a href="${SITE.url}" style="text-decoration:none;"><img src="${logo}" width="58" height="48" alt="Liliana Jgheban" style="display:block;border:0;outline:none;width:58px;height:48px;"></a>
    <p style="margin:14px 0 0;font-family:${SANS};font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.verdeDeschis};">Cabinet individual de psihologie</p>
  </td></tr>
  <tr><td style="height:3px;background:${C.nisip};line-height:3px;font-size:0;">&nbsp;</td></tr>
  <tr><td class="card" style="background:${C.alb};padding:44px 48px 40px;">
    ${c.eticheta ? `<p style="margin:0 0 10px;font-family:${SANS};font-size:12px;letter-spacing:1.6px;text-transform:uppercase;color:${C.verde};font-weight:600;">${esc(c.eticheta)}</p>` : ""}
    <h1 class="titlu" style="margin:0 0 24px;font-family:${SERIF};font-size:30px;line-height:1.25;font-weight:400;color:${C.cerneala};">${esc(c.titlu)}</h1>
    ${parti.join("\n    ")}
  </td></tr>
  <tr><td align="center" style="padding:28px 24px 8px;font-family:${SANS};font-size:13px;line-height:1.8;color:${C.cernealaMoale};">
    ${subsol}
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function text(c: ContinutEmail): string {
  const b: string[] = [];
  if (c.salut) b.push(c.salut);
  b.push(...(c.paragrafe ?? []));
  if (c.detalii?.length) b.push(c.detalii.map((d) => `${d.eticheta}: ${d.valoare}`).join("\n"));
  if (c.citat) b.push(`${c.citat.eticheta}:\n${c.citat.text}`);
  b.push(...(c.dupaDetalii ?? []));
  if (c.buton) b.push(`${c.buton.text}: ${c.buton.href}`);
  if (c.linkuri?.length) b.push(c.linkuri.map((l) => `${l.text}: ${l.href}`).join("\n"));
  if (c.semnatura) b.push("Cu drag,\nLiliana Jgheban\nPsiholog clinician și psihoterapeut integrativ");
  if (!c.intern) b.push(`—\nLiliana Jgheban · Cabinet individual de psihologie\n${SITE.phone} · ${SITE.email}\n${SITE.url}`);
  return b.join("\n\n");
}

/** Cele două variante ale aceluiași email: `{ html, text }`, gata de trimis. */
export function compuneEmail(c: ContinutEmail): { html: string; text: string } {
  return { html: html(c), text: text(c) };
}
