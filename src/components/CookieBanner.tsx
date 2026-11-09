"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  alegereSalvata,
  ascultaContactele,
  masoaraVizita,
  salveazaAlegerea,
} from "@/lib/masurare";

/* Evenimentul cu care butonul din subsol redeschide bannerul. */
export const DESCHIDE_COOKIE_URI = "lj-cookie-uri-deschide";

/* Bannerul apare o singură dată, până alege omul. Fără acord, eticheta
   Google rămâne în modul fără cookie-uri (vezi lib/masurare.ts). */
export function CookieBanner() {
  const [vizibil, setVizibil] = useState(false);

  useEffect(() => {
    ascultaContactele();
    masoaraVizita();
    if (alegereSalvata() === null) setVizibil(true);

    const deschide = () => setVizibil(true);
    window.addEventListener(DESCHIDE_COOKIE_URI, deschide);
    return () => window.removeEventListener(DESCHIDE_COOKIE_URI, deschide);
  }, []);

  function alege(a: "acceptat" | "refuzat") {
    salveazaAlegerea(a);
    setVizibil(false);
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
          className="plutitor fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md border border-ink/10 bg-cream px-4 py-3.5 shadow-[0_18px_40px_-20px_rgba(56,62,82,0.5)] sm:bottom-5"
        >
          <p className="font-sans text-[0.75rem] leading-[1.55] text-ink-soft">
            Folosim cookie-uri ca să înțelegem cum e folosit site-ul: ce pagini se
            citesc, dacă te-ai mai întors și dacă reclamele aduc programări. Nu salvăm
            nimic din ce scrii și nu dăm datele mai departe.{" "}
            <Link
              href="/confidentialitate#cookie-uri"
              className="text-periwinkle underline"
            >
              Detalii
            </Link>
          </p>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => alege("refuzat")}
              className="px-3 py-1.5 font-sans text-[0.75rem] text-ink-muted transition-colors hover:text-ink"
            >
              Refuz
            </button>
            <button
              type="button"
              onClick={() => alege("acceptat")}
              className="bg-periwinkle px-4 py-1.5 font-sans text-[0.75rem] text-cream transition-colors hover:bg-ink"
            >
              Accept
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
