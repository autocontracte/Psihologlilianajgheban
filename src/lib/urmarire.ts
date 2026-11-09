"use client";

import { FARA_MASURARE } from "@/lib/masurare";
import type { TrackType } from "@/lib/urmarireTipuri";

/* ============================================================================
   Urmărirea vizitelor — statistici proprii, ținute pe serverul nostru.

   Fără cookie-uri și fără adrese IP: evenimentele se leagă de un id aleator al
   vizitei, păstrat în `sessionStorage`, care dispare când se închide fila. Nu
   se poate recunoaște cineva de la o vizită la alta și nu se salvează nimic din
   ce scrie omul (nici mesajele către Ana, nici răspunsurile din chestionare).

   Evenimentele plecă în loturi mici către /api/urmarire. Un lot gol înseamnă
   doar „vizitatorul e încă aici”, ca panoul să arate cine e pe site în direct.

   Paginile interne (/admin, /calendar, /programator) nu se urmăresc deloc, iar
   deschiderea panoului de admin pune un semn în `localStorage` (vezi
   `nuMaUrmari`), ca propriile vizite să nu intre în statistici.
   ========================================================================== */

const ADRESA = "/api/urmarire";
const CHEIE_VIZITA = "lj_vizita_id";
const CHEIE_CONTEXT = "lj_vizita_sursa";
const CHEIE_FARA = "lj_fara_urmarire";

/** Câte secunde de la ultima mișcare mai e considerat „activ pe pagină”. */
const ACTIV_MS = 30_000;

type InAsteptare = { t: TrackType; d: string; p: string; at: number };

const coada: InAsteptare[] = [];
let ceas: ReturnType<typeof setTimeout> | 0 = 0;
let ultimaMiscare = Date.now();

function stocare(fel: "sesiune" | "local") {
  try {
    return fel === "sesiune" ? window.sessionStorage : window.localStorage;
  } catch {
    /* navigare privată cu stocarea blocată */
    return null;
  }
}

function paginaInterna(cale: string) {
  return FARA_MASURARE.some((p) => cale.startsWith(p));
}

/** Urmărirea e oprită: pagină internă, propriul browser, sau un robot. */
export function urmarireaOprita() {
  if (typeof window === "undefined") return true;
  if (paginaInterna(location.pathname)) return true;
  if (navigator.webdriver === true) return true;
  return stocare("local")?.getItem(CHEIE_FARA) === "1";
}

/** Pune semnul „nu mă urmări” pe browserul acesta (din panoul de admin). */
export function nuMaUrmari() {
  stocare("local")?.setItem(CHEIE_FARA, "1");
}

function idVizita() {
  const s = stocare("sesiune");
  let id = s?.getItem(CHEIE_VIZITA) ?? "";
  if (!id) {
    id = crypto.randomUUID();
    s?.setItem(CHEIE_VIZITA, id);
  }
  return id;
}

/* De unde a venit vizitatorul. Se stabilește la prima pagină și rămâne la fel
   pentru toată vizita, chiar dacă pe urmă navighează prin site. */
function contextVizita() {
  const s = stocare("sesiune");
  try {
    const salvat = s?.getItem(CHEIE_CONTEXT);
    if (salvat) return JSON.parse(salvat);
  } catch {
    /* ce era salvat nu mai e JSON valid: îl refacem */
  }

  const q = new URLSearchParams(location.search);
  let ref = "";
  try {
    ref = document.referrer ? new URL(document.referrer).host : "";
  } catch {
    /* referrer stricat */
  }

  const platit = q.get("gclid") || q.get("gbraid") || q.get("wbraid");
  const ctx = {
    ref: ref === location.host ? "" : ref,
    src:
      q.get("utm_source") || (q.get("fbclid") ? "facebook" : platit ? "google ads" : ""),
    med: q.get("utm_medium") || (platit ? "cpc" : ""),
    camp: q.get("utm_campaign") || "",
    land: location.pathname,
    w: window.innerWidth || screen.width || 0,
  };
  s?.setItem(CHEIE_CONTEXT, JSON.stringify(ctx));
  return ctx;
}

/** Trimite acum ce s-a adunat (cel mult 40 de evenimente pe lot). */
export function trimite() {
  if (urmarireaOprita()) return;
  if (ceas) clearTimeout(ceas);
  ceas = 0;

  const acum = Date.now();
  const corp = JSON.stringify({
    visit: idVizita(),
    ctx: contextVizita(),
    events: coada.splice(0, 40).map((e) => ({
      t: e.t,
      d: e.d,
      p: e.p,
      ago: Math.round((acum - e.at) / 1000),
    })),
  });

  /* sendBeacon pleacă și când pagina se închide; dacă nu e disponibil (sau
     refuză, de exemplu când lotul e prea mare), rămâne fetch cu keepalive. */
  if (!(navigator.sendBeacon && navigator.sendBeacon(ADRESA, corp))) {
    fetch(ADRESA, { method: "POST", body: corp, keepalive: true }).catch(() => {});
  }
}

/* Ultima pagină notată. În dezvoltare, React rulează efectele de două ori, iar
   un „înapoi” rapid poate repeta aceeași pagină: o numărăm o singură dată. */
let ultimaPagina = { cale: "", at: 0 };

/** Notează un eveniment; pleacă la server în cel mult două secunde. */
export function urmareste(tip: TrackType, detaliu?: unknown) {
  if (urmarireaOprita()) return;

  if (tip === "pagina") {
    const acum = Date.now();
    if (ultimaPagina.cale === location.pathname && acum - ultimaPagina.at < 3000) return;
    ultimaPagina = { cale: location.pathname, at: acum };
  }

  const d =
    detaliu == null ? "" : String(detaliu).replace(/\s+/g, " ").trim().slice(0, 300);
  coada.push({ t: tip, d, p: location.pathname, at: Date.now() });
  ultimaMiscare = Date.now();
  if (!ceas) ceas = setTimeout(trimite, 2000);
}

export function noteazaMiscarea() {
  ultimaMiscare = Date.now();
}

/** Cât timp omul e activ pe pagină, vizita rămâne „în direct” în panou. */
export function semnDeViata() {
  if (
    document.visibilityState === "visible" &&
    Date.now() - ultimaMiscare < ACTIV_MS &&
    !ceas
  ) {
    trimite();
  }
}

export const inAsteptare = () => coada.length;
