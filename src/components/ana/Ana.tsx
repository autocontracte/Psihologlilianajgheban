"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { IconSend } from "../ui/Icons";
import { useNavigheaza } from "./useNavigheaza";
import { AnaFace, type AnaMood } from "./AnaFace";
import { AnaMesaje } from "./AnaMesaje";
import { ANA_MAX, useAna } from "./useAna";

/* ----------------------------------------------------------------------------
   Ana — asistenta virtuală, în colțul din dreapta jos.

   Conversația e comună cu bara din hero (vezi useAna). După ANA_MAX întrebări
   câmpul de scris dispare și rămân doar cele trei moduri de a lua legătura cu
   Liliana. Serverul verifică și el limita.
   -------------------------------------------------------------------------- */

const ASCUNS_PE = ["/chestionar", "/admin", "/cont", "/contract"];

/* Mesaje discrete lângă buton — puține și rare; e un cabinet, nu un magazin. */
const INDEMNURI = [
  "Ai o întrebare despre ședințe?",
  "Nu știi de unde să începi? Întreabă-mă.",
  "Te lămuresc despre prețuri și programări.",
];

/** Expresia Anei, după ce se întâmplă în conversație. */
export function useAnaMood(draft: string): AnaMood {
  const { busy, scrie } = useAna();
  if (scrie) return "talking";
  if (busy) return "thinking";
  if (draft.trim()) return "listening";
  return "idle";
}

export function Ana() {
  const pathname = usePathname();
  const { busy, gata, intrebari, ramase, trimite } = useAna();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [indemn, setIndemn] = useState<string | null>(null);
  const [vizibil, setVizibil] = useState(false);
  // Cât timp Ana apare deja în pagină (bara din hero, panoul de lângă întrebări),
  // butonul plutitor stă ascuns — să nu fie de două ori pe ecran
  const [inPagina, setInPagina] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mood = useAnaMood(draft);
  const { turns } = useAna();
  const navigheaza = useNavigheaza();

  useEffect(() => {
    const t = setTimeout(() => setVizibil(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const locuri = [
      ...(pathname === "/" ? [document.getElementById("acasa")] : []),
      ...Array.from(document.querySelectorAll("[data-ana-inline]")),
    ].filter((el): el is HTMLElement => !!el);
    if (!locuri.length) {
      setInPagina(false);
      return;
    }
    const vizibile = new Set<Element>();
    const obs = new IntersectionObserver(
      (intrari) => {
        for (const e of intrari) {
          if (e.intersectionRatio > 0.3) vizibile.add(e.target);
          else vizibile.delete(e.target);
        }
        setInPagina(vizibile.size > 0);
      },
      { threshold: [0, 0.3, 0.6, 1] },
    );
    locuri.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [pathname]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy, open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Un îndemn după câteva secunde, apoi rar, de cel mult trei ori
  useEffect(() => {
    if (open) {
      setIndemn(null);
      return;
    }
    let aratate = 0;
    let ascunde: ReturnType<typeof setTimeout>;
    const arata = () => {
      if (aratate >= 3) return;
      setIndemn(INDEMNURI[aratate % INDEMNURI.length]);
      aratate += 1;
      ascunde = setTimeout(() => setIndemn(null), 6500);
    };
    const prima = setTimeout(arata, 9000);
    const bucla = setInterval(arata, 45000);
    return () => {
      clearTimeout(prima);
      clearTimeout(ascunde);
      clearInterval(bucla);
    };
  }, [open]);

  if (ASCUNS_PE.some((p) => pathname?.startsWith(p))) return null;

  async function trimiteDraft() {
    const q = draft;
    setDraft("");
    const ok = await trimite(q);
    if (!ok) setDraft(q);
  }

  function mergi(href: string) {
    setOpen(false);
    navigheaza(href);
  }

  return (
    <>
      {/* Butonul plutitor */}
      <AnimatePresence>
        {vizibil && (!inPagina || open) && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.9 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-5 right-4 z-[45] flex items-center gap-3 sm:right-6 lg:bottom-8 lg:right-8"
          >
            <AnimatePresence>
              {!open && indemn && (
                <motion.button
                  type="button"
                  onClick={() => setOpen(true)}
                  initial={{ opacity: 0, x: 12, scale: 0.94 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 12, scale: 0.94 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="glass-strong hidden max-w-[15rem] px-4 py-2.5 text-left font-sans text-[0.82rem] leading-snug text-ink sm:block"
                >
                  {indemn}
                </motion.button>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Închide chatul cu Ana" : "Deschide chatul cu Ana, asistenta virtuală"}
              aria-expanded={open}
              className="glass-strong group flex items-center gap-2.5 py-1.5 pl-1.5 pr-1.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 sm:pr-5"
            >
              <AnaFace size={50} mood={open ? mood : indemn ? "listening" : "idle"} />
              <span className="hidden text-left sm:block">
                <span className="block font-display text-[1.02rem] leading-none text-ink">
                  {open ? "Închide" : "Întreab-o pe Ana"}
                </span>
                <span className="mt-1 block font-sans text-[0.72rem] text-ink-muted">
                  asistenta cabinetului
                </span>
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fereastra de chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Chat cu Ana, asistenta virtuală a cabinetului"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "bottom right" }}
            className="glass-strong fixed inset-x-3 bottom-[5.5rem] z-[46] flex h-[min(36rem,calc(100svh-7.5rem))] flex-col sm:inset-x-auto sm:right-6 sm:w-[24rem] lg:bottom-[6.75rem] lg:right-8"
          >
            <AntetAna mood={mood} intrebari={intrebari} onClose={() => setOpen(false)} />

            <div ref={bodyRef} className="flex-1 overflow-y-auto px-4 py-4" aria-live="polite">
              <AnaMesaje onGo={mergi} />
            </div>

            {!gata && (
              <div className="border-t border-ink/8 px-4 pb-3 pt-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    trimiteDraft();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Scrie o întrebare…"
                    aria-label="Întrebarea ta pentru Ana"
                    maxLength={500}
                    className="min-w-0 flex-1 border border-ink/12 bg-white/60 px-3.5 py-2.5 font-sans text-[0.9rem] text-ink placeholder:text-ink-muted focus:border-periwinkle focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || busy}
                    aria-label="Trimite"
                    className="flex h-[2.7rem] w-[2.7rem] shrink-0 items-center justify-center bg-periwinkle text-cream transition-colors hover:bg-ink disabled:opacity-40"
                  >
                    <IconSend className="h-4.5 w-4.5" />
                  </button>
                </form>
                <NotaAna ramase={ramase} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function AntetAna({
  mood,
  intrebari,
  onClose,
  inchideEticheta = "Închide",
}: {
  mood: AnaMood;
  intrebari: number;
  onClose: () => void;
  inchideEticheta?: string;
}) {
  return (
    <header className="flex items-center gap-3 border-b border-ink/8 px-4 py-3">
      <AnaFace size={44} mood={mood} />
      <div className="min-w-0 flex-1">
        <p className="font-display text-[1.1rem] leading-none text-ink">Ana</p>
        <p className="mt-1 font-sans text-[0.74rem] text-ink-muted">Asistenta virtuală a cabinetului</p>
      </div>
      <span
        title="Întrebări puse în conversația asta"
        className="shrink-0 bg-periwinkle-pale/70 px-2.5 py-1 font-sans text-[0.72rem] tabular-nums text-periwinkle"
      >
        {intrebari}/{ANA_MAX}
      </span>
      <button
        type="button"
        onClick={onClose}
        aria-label={inchideEticheta}
        className="flex h-9 w-9 shrink-0 items-center justify-center text-ink-soft transition-colors hover:bg-ink hover:text-cream"
      >
        <span className="mi text-[1.2rem]">close</span>
      </button>
    </header>
  );
}

export function NotaAna({ ramase }: { ramase: number }) {
  return (
    <p className="mt-2 font-sans text-[0.68rem] leading-snug text-ink-muted">
      Ana e un asistent automat, nu un psiholog. Nu scrie aici date personale sau de sănătate. În
      caz de urgență, sună la 112.
      {ramase <= 5 && ramase > 0 && ` Mai ai ${ramase} ${ramase === 1 ? "întrebare" : "întrebări"}.`}
    </p>
  );
}
