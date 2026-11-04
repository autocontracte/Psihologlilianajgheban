/* ============================================================================
   Măsurarea conversiilor Google Ads (eticheta Google, gtag.js).

   Eticheta se încarcă DOAR după ce vizitatorul acceptă cookie-urile de
   măsurare din banner. Fără acord, nu pleacă nimic spre Google.

   Ce trimitem: că cineva a ajuns pe site dintr-un anunț, că a apăsat pe
   telefon sau WhatsApp, că a început o conversație cu Ana și că a făcut o
   programare (cu id-ul programării, ca să nu se numere de două ori, și
   prețul ședinței). Nu trimitem nume, email, telefon sau serviciul ales —
   e un cabinet de psihoterapie, iar Google nu are ce căuta în datele astea.
   Personalizarea reclamelor rămâne oprită (ad_personalization: denied).
   ========================================================================== */

const ADS_ID = "AW-18517449695";
const ETICHETA_PROGRAMARE = "AJyuCJaSpLEdEN-35_1E";
const ETICHETA_VIZITA = "MG2UCL_crLEdEN-35_1E";
const ETICHETA_TELEFON = "qbUZCMPu57EdEN-35_1E";
const ETICHETA_WHATSAPP = "yMNgCJKw6LEdEN-35_1E";
const ETICHETA_ANA = "1ikICJWw6LEdEN-35_1E";

const CHEIE = "lj-cookie-uri";
export const EVENIMENT_ALEGERE = "lj-cookie-uri-alegere";

export type Alegere = "acceptat" | "refuzat";

/* Pe paginile interne nu măsurăm nimic. */
const FARA_MASURARE = ["/admin", "/calendar", "/programator"];

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

export function alegereSalvata(): Alegere | null {
  try {
    const v = localStorage.getItem(CHEIE);
    return v === "acceptat" || v === "refuzat" ? v : null;
  } catch {
    return null;
  }
}

export function salveazaAlegerea(a: Alegere) {
  try {
    localStorage.setItem(CHEIE, a);
  } catch {
    /* browser fără stocare: alegerea ține cât e deschisă pagina */
  }
  window.dispatchEvent(new CustomEvent(EVENIMENT_ALEGERE, { detail: a }));
  if (a === "acceptat") pornesteMasurarea();
}

function permisAici() {
  return !FARA_MASURARE.some((p) => window.location.pathname.startsWith(p));
}

/** Încarcă eticheta o singură dată, doar cu acord. */
export function pornesteMasurarea() {
  if (typeof window === "undefined" || window.gtag) return;
  if (alegereSalvata() !== "acceptat" || !permisAici()) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js cere obiectul `arguments`, nu un array
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("consent", "default", {
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", ADS_ID);

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`;
  document.head.appendChild(s);

  // „Vizită pe site": o dată pe sesiune e de ajuns
  try {
    if (!sessionStorage.getItem("lj-vizita")) {
      sessionStorage.setItem("lj-vizita", "1");
      window.gtag("event", "conversion", { send_to: `${ADS_ID}/${ETICHETA_VIZITA}` });
    }
  } catch {
    window.gtag("event", "conversion", { send_to: `${ADS_ID}/${ETICHETA_VIZITA}` });
  }
}

/** Trimite conversia doar dacă eticheta e pornită (adică omul a acceptat). */
function conversie(eticheta: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "conversion", { send_to: `${ADS_ID}/${eticheta}` });
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
  pornesteMasurarea();
  if (!window.gtag) return;
  window.gtag("event", "conversion", {
    send_to: `${ADS_ID}/${ETICHETA_PROGRAMARE}`,
    transaction_id: id,
    ...(valoare ? { value: valoare, currency: "RON" } : {}),
  });
}
