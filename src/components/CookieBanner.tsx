"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { alegereSalvata, pornesteMasurarea, salveazaAlegerea } from "@/lib/masurare";

/* Evenimentul cu care butonul din subsol redeschide bannerul. */
export const DESCHIDE_COOKIE_URI = "lj-cookie-uri-deschide";

/* Bannerul apare o singură dată, până alege omul. Fără acord, eticheta
   Google nu se încarcă deloc (vezi lib/masurare.ts). */
export function CookieBanner() {
  const [vizibil, setVizibil] = useState(false);

  useEffect(() => {
    if (alegereSalvata() === null) setVizibil(true);
    else pornesteMasurarea();

    const deschide = () => setVizibil(true);
    window.addEventListener(DESCHIDE_COOKIE_URI, deschide);
    return () => window.removeEventListener(DESCHIDE_COOKIE_URI, deschide);
  }, []);

  function alege(a: "acceptat" | "refuzat") {
    salveazaAlegerea(a);
    setVizibil(false);
    // Retragerea acordului: eticheta deja încărcată pleacă doar la reîncărcare
    if (a === "refuzat" && window.gtag) window.location.reload();
  }

  return (
    <AnimatePresence>
      {vizibil && (
        <motion.div
          role="dialog"
          aria-label="Cookie-uri"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="plutitor fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl border border-ink/10 bg-cream p-5 shadow-[0_24px_60px_-24px_rgba(56,62,82,0.55)] sm:bottom-6 sm:p-6"
        >
          <p className="font-sans text-[0.9rem] leading-[1.7] text-ink-soft">
            Folosim un cookie Google Ads doar ca să aflăm dacă reclamele noastre
            aduc vizite și programări. Nu trimitem nimic despre tine sau despre
            serviciul ales.{" "}
            <Link href="/confidentialitate#cookie-uri" className="text-periwinkle underline">
              Detalii
            </Link>
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row-reverse">
            <button
              type="button"
              onClick={() => alege("acceptat")}
              className="bg-periwinkle px-6 py-3 font-sans text-[0.85rem] text-cream transition-colors hover:bg-ink"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => alege("refuzat")}
              className="border border-ink/20 px-6 py-3 font-sans text-[0.85rem] text-ink-soft transition-colors hover:border-ink/40 hover:text-ink"
            >
              Refuz
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Pentru subsol: redeschide bannerul ca alegerea să poată fi schimbată. */
export function ButonCookieUri({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(DESCHIDE_COOKIE_URI))}
      className={className}
    >
      Cookie-uri
    </button>
  );
}
