"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import {
  inAsteptare,
  noteazaMiscarea,
  semnDeViata,
  trimite,
  urmareste,
  urmarireaOprita,
} from "@/lib/urmarire";

/* ============================================================================
   Ascultătorul de pe tot site-ul: ce pagini deschide vizitatorul, până unde
   citește (secțiunile prin care trece și cât la sută a derulat) și pe ce apasă
   — cu locul din pagină, ca eticheta „Programează o ședință” din antet să se
   deosebească de cea din subsol.

   Evenimentele care țin de un anumit flux (programare, trusa de ajutor,
   contracte, Ana) le trimit componentele lor, prin `urmareste()`.
   ========================================================================== */

/** Zona din pagină în care se află elementul apăsat. */
function zona(el: Element) {
  if (el.closest("header")) return "antet";
  if (el.closest("footer")) return "subsol";
  if (el.closest("[data-site-widgets]")) return "buton plutitor";
  if (el.closest("[role=dialog]")) return "fereastră";
  const sectiune = el.closest("section[id]");
  if (sectiune) return sectiune.id;
  const titlu = el.closest("section")?.querySelector("h1, h2");
  return titlu?.textContent?.trim().slice(0, 40) ?? "";
}

const curata = (t: string) => t.replace(/\s+/g, " ").trim().slice(0, 80);

function eticheta(el: Element) {
  const aria = el.getAttribute("aria-label");
  if (aria) return curata(aria);

  /* Iconițele sunt ligaturi de font, cu text propriu ("arrow_forward"), și sunt
     marcate `aria-hidden`. Fără ele, eticheta e exact ce citește omul. */
  const copie = el.cloneNode(true) as Element;
  copie.querySelectorAll('[aria-hidden="true"], svg').forEach((x) => x.remove());
  return curata(copie.textContent || "");
}

export function Urmaritor() {
  const pathname = usePathname();

  /* O pagină nouă: titlul, apoi secțiunile și derularea, de la zero. */
  useEffect(() => {
    if (urmarireaOprita()) return;

    /* Titlul se actualizează puțin după schimbarea adresei. */
    const t = setTimeout(
      () => urmareste("pagina", document.title.replace(/\s*\|\s*Liliana Jgheban.*$/, "")),
      300,
    );

    /* Secțiunile prin care trece, o singură dată fiecare: arată cât a citit. */
    const vazute = new Set<string>();
    let io: IntersectionObserver | null = null;
    const scan = setTimeout(() => {
      io = new IntersectionObserver(
        (intrari) =>
          intrari.forEach((e) => {
            const id = (e.target as HTMLElement).id;
            if (e.isIntersecting && id && !vazute.has(id)) {
              vazute.add(id);
              urmareste("sectiune", id);
            }
          }),
        { rootMargin: "-45% 0px -45% 0px" },
      );
      document.querySelectorAll("main section[id]").forEach((s) => io!.observe(s));
    }, 800);

    /* Cât de jos a derulat: 25, 50, 75, 100%. */
    const praguri = [25, 50, 75, 100];
    let atins = 0;
    let raf = 0;
    const laDerulare = () => {
      noteazaMiscarea();
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (max <= 0) return;
        const pct = ((window.scrollY + 1) / max) * 100;
        while (atins < praguri.length && pct >= praguri[atins] - 1) {
          urmareste("derulare", `${praguri[atins]}%`);
          atins++;
        }
      });
    };
    window.addEventListener("scroll", laDerulare, { passive: true });

    return () => {
      clearTimeout(t);
      clearTimeout(scan);
      io?.disconnect();
      window.removeEventListener("scroll", laDerulare);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  /* Click-uri, activitate și plecarea de pe site: o singură dată pentru tot. */
  useEffect(() => {
    if (urmarireaOprita()) return;

    const laClic = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.(
        "a, button, summary, [role=tab], [role=button]",
      );
      if (!el) return;

      const href = el.getAttribute("href") ?? "";
      const unde = [zona(el), eticheta(el)].filter(Boolean).join(" · ");

      if (href.startsWith("tel:")) urmareste("telefon", unde);
      else if (href.startsWith("mailto:")) urmareste("email", unde);
      else if (/wa\.me|whatsapp/i.test(href)) urmareste("whatsapp", unde);
      /* O întrebare frecventă care se deschide (nu și când se închide). */
      else if (el.getAttribute("aria-expanded") === "false" && el.closest("#intrebari"))
        urmareste("intrebare", eticheta(el));
      else urmareste("clic", href && !href.startsWith("#") ? `${unde} → ${href}` : unde);
    };
    document.addEventListener("click", laClic, true);

    const laActivitate = () => noteazaMiscarea();
    (["pointerdown", "keydown"] as const).forEach((n) =>
      window.addEventListener(n, laActivitate, { passive: true }),
    );
    const puls = setInterval(semnDeViata, 20_000);

    /* Când fila se ascunde sau pagina se închide, trimitem ce a mai rămas. */
    const laAscundere = () => {
      if (document.visibilityState === "hidden" && inAsteptare()) trimite();
    };
    const laPlecare = () => inAsteptare() && trimite();
    document.addEventListener("visibilitychange", laAscundere);
    window.addEventListener("pagehide", laPlecare);

    return () => {
      document.removeEventListener("click", laClic, true);
      (["pointerdown", "keydown"] as const).forEach((n) =>
        window.removeEventListener(n, laActivitate),
      );
      clearInterval(puls);
      document.removeEventListener("visibilitychange", laAscundere);
      window.removeEventListener("pagehide", laPlecare);
    };
    /* `pathname` ca dependență: dacă prima pagină deschisă a fost una internă
       (unde nu urmărim nimic), ascultătorii se pun la următoarea navigare. */
  }, [pathname]);

  return null;
}
