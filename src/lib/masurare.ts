/* ============================================================================
   Măsurarea conversiilor Google Ads (eticheta Google, gtag.js).

   Eticheta e în <head> pe fiecare pagină publică (vezi app/layout.tsx), în
   modul de consimțământ Google („Consent Mode"): până când vizitatorul apasă
   „Accept" în banner, ad_storage și ad_user_data sunt refuzate, deci Google
   nu pune și nu citește cookie-uri, ci primește doar semnale anonime din care
   estimează conversiile. După „Accept" consimțământul trece pe acordat.

   Ce trimitem: că cineva a ajuns pe site dintr-un anunț, că a apăsat pe
   telefon sau WhatsApp, că a început o conversație cu Ana și că a făcut o
   programare (cu id-ul programării, ca să nu se numere de două ori, și
   prețul ședinței). Nu trimitem nume, email, telefon sau serviciul ales —
   e un cabinet de psihoterapie, iar Google nu are ce căuta în datele astea.
   Personalizarea reclamelor rămâne oprită (ad_personalization: denied).
   ========================================================================== */

export const ADS_ID = "AW-18517449695";
const ETICHETA_PROGRAMARE = "AJyuCJaSpLEdEN-35_1E";
const ETICHETA_VIZITA = "MG2UCL_crLEdEN-35_1E";
const ETICHETA_TELEFON = "qbUZCMPu57EdEN-35_1E";
const ETICHETA_WHATSAPP = "yMNgCJKw6LEdEN-35_1E";
const ETICHETA_ANA = "1ikICJWw6LEdEN-35_1E";

export const CHEIE_COOKIE_URI = "lj-cookie-uri";
export const EVENIMENT_ALEGERE = "lj-cookie-uri-alegere";

export type Alegere = "acceptat" | "refuzat";

/* Pe paginile interne eticheta nu se încarcă deloc. */
export const FARA_MASURARE = ["/admin", "/calendar", "/programator"];

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

/* Scriptul din <head>: pornește eticheta cu consimțământul refuzat (sau acordat,
   dacă omul a acceptat deja într-o vizită anterioară). */
export const SCRIPT_ETICHETA = `(function(){
var p=location.pathname;if(${JSON.stringify(FARA_MASURARE)}.some(function(x){return p.indexOf(x)===0}))return;
window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};
var ok=false;try{ok=localStorage.getItem(${JSON.stringify(CHEIE_COOKIE_URI)})==="acceptat"}catch(e){}
var v=ok?"granted":"denied";
gtag("consent","default",{ad_storage:v,ad_user_data:v,ad_personalization:"denied",analytics_storage:"denied",wait_for_update:500});
gtag("js",new Date());gtag("config",${JSON.stringify(ADS_ID)});
var s=document.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id=${ADS_ID}";document.head.appendChild(s);
})();`;

export function alegereSalvata(): Alegere | null {
  try {
    const v = localStorage.getItem(CHEIE_COOKIE_URI);
    return v === "acceptat" || v === "refuzat" ? v : null;
  } catch {
    return null;
  }
}

export function salveazaAlegerea(a: Alegere) {
  try {
    localStorage.setItem(CHEIE_COOKIE_URI, a);
  } catch {
    /* browser fără stocare: alegerea ține cât e deschisă pagina */
  }
  const v = a === "acceptat" ? "granted" : "denied";
  window.gtag?.("consent", "update", { ad_storage: v, ad_user_data: v });
  window.dispatchEvent(new CustomEvent(EVENIMENT_ALEGERE, { detail: a }));
}

function conversie(eticheta: string, extra?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "conversion", { send_to: `${ADS_ID}/${eticheta}`, ...extra });
}

/** „Vizită pe site": o dată pe sesiune e de ajuns. */
export function masoaraVizita() {
  try {
    if (sessionStorage.getItem("lj-vizita")) return;
    sessionStorage.setItem("lj-vizita", "1");
  } catch {
    /* fără stocare: Google ține oricum una pe click */
  }
  conversie(ETICHETA_VIZITA);
}

/* Click pe telefon sau pe WhatsApp, oriunde pe site (butonul plutitor,
   secțiunea de contact, linkurile din răspunsurile Anei). Un singur ascultător
   pe tot documentul, ca să nu atingem fiecare buton în parte. */
let ascultaDeja = false;
export function ascultaContactele() {
  if (ascultaDeja || typeof document === "undefined") return;
  ascultaDeja = true;
  document.addEventListener(
    "click",
    (e) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      const href = a?.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) conversie(ETICHETA_TELEFON);
      else if (href.includes("wa.me/")) conversie(ETICHETA_WHATSAPP);
    },
    { capture: true },
  );
}

/** Prima întrebare către Ana dintr-o sesiune. Nu trimitem ce a scris omul. */
export function masoaraConversatiaCuAna() {
  try {
    if (sessionStorage.getItem("lj-ana-masurat")) return;
    sessionStorage.setItem("lj-ana-masurat", "1");
  } catch {
    /* fără stocare: se poate număra de mai multe ori, Google ține una pe click */
  }
  conversie(ETICHETA_ANA);
}

/** Programare reușită. `valoare` în lei. */
export function masoaraProgramarea(id: string, valoare?: number) {
  conversie(ETICHETA_PROGRAMARE, {
    transaction_id: id,
    ...(valoare ? { value: valoare, currency: "RON" } : {}),
  });
}
