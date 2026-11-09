"use client";

import { alegereSalvata, EVENIMENT_ALEGERE, FARA_MASURARE } from "@/lib/masurare";
import type { TrackType } from "@/lib/urmarireTipuri";

/* ============================================================================
   Urmărirea vizitelor — statistici proprii, ținute pe serverul nostru.

   Două trepte, după ce alege omul în bannerul de cookie-uri:

   • Fără acord (sau înainte de a alege) — o vizită singuratică. Id-ul ei e
     aleator și stă în `sessionStorage`, deci dispare la închiderea filei:
     niciun cookie, nicio adresă IP, nicio legătură cu alte vizite.

   • Cu acord — browserul primește și un cookie (`lj_v`, un an) cu un alt număr
     aleator. De la el încolo se vede că omul s-a întors: a câta vizită e, de
     unde a venit prima oară, după câte vizite s-a programat. Tot atunci se
     păstrează și adresa IP a vizitei. Dacă refuză, cookie-ul se șterge.

   Ce nu se salvează niciodată: ce scrie omul (mesajele către Ana, răspunsurile
   din chestionare, textul formularelor). Paginile interne nu se urmăresc.

   Evenimentele plecă în loturi mici către /api/urmarire; un lot fără
   evenimente spune doar „vizitatorul e încă aici”, cu cifrele la zi.
   ========================================================================== */

const ADRESA = "/api/urmarire";
const CHEIE_VIZITA = "lj_vizita_id";
const CHEIE_CONTEXT = "lj_vizita_sursa";
const CHEIE_CIFRE = "lj_vizita_cifre";
const CHEIE_FARA = "lj_fara_urmarire";
/** Cookie-ul care leagă vizitele aceluiași om. Doar cu acord. */
const COOKIE_OM = "lj_v";
const COOKIE_ZILE = 365;

/** Câte secunde de la ultima mișcare mai e considerat „activ pe pagină”. */
const ACTIV_MS = 30_000;
/** La câte secunde se adună timpul activ. */
const PAS_ACTIV = 5;
/** Câte erori de JavaScript trimitem dintr-o vizită (restul doar se numără). */
const MAX_ERORI = 5;

type InAsteptare = { t: TrackType; d: string; p: string; at: number };

/** Cifrele vizitei, păstrate între pagini în `sessionStorage`. */
type Cifre = {
  activ: number;
  scroll: number;
  clicuri: number;
  erori: number;
  lcp: number;
  inp: number;
  cls: number;
  exit: string;
};

const coada: InAsteptare[] = [];
let ceas: ReturnType<typeof setTimeout> | 0 = 0;
let ultimaMiscare = Date.now();
let pornit = false;

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
  stergeCookie(COOKIE_OM);
}

/* ------------------------------------------------------------- Cookie-uri */

function citesteCookie(nume: string) {
  const parte = `; ${document.cookie}`.split(`; ${nume}=`);
  return parte.length === 2 ? (parte.pop()?.split(";").shift() ?? "") : "";
}

function scrieCookie(nume: string, valoare: string, zile: number) {
  const sigur = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${nume}=${valoare}; path=/; max-age=${zile * 86400}; samesite=lax${sigur}`;
}

function stergeCookie(nume: string) {
  document.cookie = `${nume}=; path=/; max-age=0`;
}

/** „acceptat” | „refuzat” | "" cât timp nu a ales nimic. */
function acordul(): "acceptat" | "refuzat" | "" {
  return alegereSalvata() ?? "";
}

/**
 * Numărul din cookie, cu care se leagă vizitele aceluiași om.
 * Există doar cu acord; la refuz, cookie-ul se șterge.
 */
function idOm() {
  if (acordul() !== "acceptat") {
    if (citesteCookie(COOKIE_OM)) stergeCookie(COOKIE_OM);
    return "";
  }
  let id = citesteCookie(COOKIE_OM);
  if (!/^[0-9a-f-]{36}$/i.test(id)) id = crypto.randomUUID();
  /* Rescris la fiecare vizită, ca anul să curgă de la ultima venire. */
  scrieCookie(COOKIE_OM, id, COOKIE_ZILE);
  return id;
}

/* ------------------------------------------------------- Vizita și cifrele */

function idVizita() {
  const s = stocare("sesiune");
  let id = s?.getItem(CHEIE_VIZITA) ?? "";
  if (!id) {
    id = crypto.randomUUID();
    s?.setItem(CHEIE_VIZITA, id);
  }
  return id;
}

const CIFRE_GOALE: Cifre = {
  activ: 0,
  scroll: 0,
  clicuri: 0,
  erori: 0,
  lcp: 0,
  inp: 0,
  cls: 0,
  exit: "",
};

function cifre(): Cifre {
  try {
    const salvat = stocare("sesiune")?.getItem(CHEIE_CIFRE);
    if (salvat) return { ...CIFRE_GOALE, ...JSON.parse(salvat) };
  } catch {
    /* ce era salvat nu mai e JSON valid */
  }
  return { ...CIFRE_GOALE };
}

function schimbaCifrele(f: (c: Cifre) => void) {
  const c = cifre();
  f(c);
  try {
    stocare("sesiune")?.setItem(CHEIE_CIFRE, JSON.stringify(c));
  } catch {
    /* fără stocare: cifrele rămân pe pagina curentă */
  }
}

export function noteazaClic() {
  schimbaCifrele((c) => {
    c.clicuri++;
  });
}

export function noteazaDerularea(procent: number) {
  schimbaCifrele((c) => {
    c.scroll = Math.max(c.scroll, Math.min(100, Math.round(procent)));
  });
}

/* ----------------------------------------------------------- Contextul vizitei */

function sistem(ua: string) {
  if (/windows nt 10|windows nt 11/i.test(ua)) return "Windows";
  if (/windows/i.test(ua)) return "Windows (vechi)";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/mac os x/i.test(ua)) return "macOS";
  if (/android/i.test(ua)) return "Android";
  if (/linux/i.test(ua)) return "Linux";
  return "";
}

/* De unde a venit vizitatorul și cu ce. Se stabilește la prima pagină și
   rămâne la fel pentru toată vizita, chiar dacă pe urmă navighează prin site. */
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
  const conexiune = (
    navigator as Navigator & { connection?: { effectiveType?: string } }
  ).connection;

  const ctx = {
    ref: ref === location.host ? "" : ref,
    src:
      q.get("utm_source") || (q.get("fbclid") ? "facebook" : platit ? "google ads" : ""),
    med: q.get("utm_medium") || (platit ? "cpc" : ""),
    camp: q.get("utm_campaign") || "",
    land: location.pathname,
    os: sistem(navigator.userAgent),
    w: window.innerWidth || screen.width || 0,
    h: window.innerHeight || screen.height || 0,
    sw: screen.width || 0,
    sh: screen.height || 0,
    lang: navigator.language || "",
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    conn: conexiune?.effectiveType || "",
  };
  s?.setItem(CHEIE_CONTEXT, JSON.stringify(ctx));
  return ctx;
}

/* ------------------------------------------------------------- Trimiterea */

export function trimite() {
  if (urmarireaOprita()) return;
  if (ceas) clearTimeout(ceas);
  ceas = 0;

  const acum = Date.now();
  const c = cifre();
  const corp = JSON.stringify({
    visit: idVizita(),
    om: idOm(),
    acord: acordul(),
    ctx: contextVizita(),
    cifre: c,
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
    schimbaCifrele((c) => {
      c.exit = location.pathname;
    });
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

/* ---------------------------------------- Pornirea măsurătorilor de fundal */

/**
 * Pornește o singură dată, pentru toată vizita: timpul activ, viteza paginii
 * (LCP, INP, CLS), erorile de JavaScript și reacția la schimbarea acordului.
 */
export function pornesteMasuratorile() {
  if (pornit || typeof window === "undefined") return;
  pornit = true;

  /* Timpul activ: doar cât fila e deschisă și omul a mișcat ceva de curând. */
  setInterval(() => {
    if (urmarireaOprita()) return;
    if (document.visibilityState !== "visible") return;
    if (Date.now() - ultimaMiscare > ACTIV_MS) return;
    schimbaCifrele((c) => {
      c.activ += PAS_ACTIV;
    });
  }, PAS_ACTIV * 1000);

  /* Viteza paginii, așa cum o simte omul. Se păstrează cea mai proastă
     valoare din vizită — aia îl supără. */
  observa("largest-contentful-paint", (intrari) => {
    const ultima = intrari[intrari.length - 1] as PerformanceEntry & {
      startTime: number;
    };
    schimbaCifrele((c) => {
      c.lcp = Math.max(c.lcp, Math.round(ultima.startTime));
    });
  });

  observa("layout-shift", (intrari) => {
    let total = 0;
    for (const i of intrari as (PerformanceEntry & {
      value: number;
      hadRecentInput: boolean;
    })[]) {
      if (!i.hadRecentInput) total += i.value;
    }
    if (total > 0) {
      schimbaCifrele((c) => {
        c.cls = Math.max(c.cls, Math.round(total * 1000));
      });
    }
  });

  observa(
    "event",
    (intrari) => {
      for (const i of intrari) {
        schimbaCifrele((c) => {
          c.inp = Math.max(c.inp, Math.round(i.duration));
        });
      }
    },
    { durationThreshold: 80 },
  );

  /* Erorile de JavaScript: mesajul, fișierul și linia — nimic din ce scrie
     omul. Trimitem primele câteva, restul doar se numără. */
  let erori = 0;
  const noteaza = (mesaj: string) => {
    erori++;
    schimbaCifrele((c) => {
      c.erori++;
    });
    if (erori <= MAX_ERORI) urmareste("eroare", mesaj);
  };

  window.addEventListener("error", (e) => {
    const unde = e.filename ? ` (${e.filename.split("/").pop()}:${e.lineno})` : "";
    noteaza(`${e.message}${unde}`);
  });
  window.addEventListener("unhandledrejection", (e) => {
    noteaza(`Promisiune respinsă: ${String(e.reason).slice(0, 160)}`);
  });

  /* Dacă omul acceptă (sau refuză) cât e pe site, trimitem imediat: de acolo
     încolo vizita se leagă de cookie-ul lui — sau se desprinde de el. */
  window.addEventListener(EVENIMENT_ALEGERE, ((e: CustomEvent) => {
    urmareste("acord", e.detail === "acceptat" ? "a acceptat" : "a refuzat");
    trimite();
  }) as EventListener);
}

function observa(
  tip: string,
  f: (intrari: PerformanceEntry[]) => void,
  optiuni: Record<string, unknown> = {},
) {
  try {
    new PerformanceObserver((lista) => f(lista.getEntries())).observe({
      type: tip,
      buffered: true,
      ...optiuni,
    });
  } catch {
    /* browser fără măsurătoarea asta: mergem mai departe fără ea */
  }
}
