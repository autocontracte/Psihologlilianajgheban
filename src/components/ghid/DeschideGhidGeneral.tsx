"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { GhidGeneral } from "./GhidGeneral";

/* Un buton care deschide chestionarul general într-o fereastră peste pagină,
   în loc să ducă la secțiunea lui. Se închide cu X, Escape sau clic pe fundal. */
export function DeschideGhidGeneral({ children, className = "" }: { children: ReactNode; className?: string }) {
  const [deschis, setDeschis] = useState(false);
  const panou = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!deschis) return;
    const inapoi = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const tasta = (e: KeyboardEvent) => e.key === "Escape" && setDeschis(false);
    window.addEventListener("keydown", tasta);
    panou.current?.focus();
    return () => {
      document.body.style.overflow = inapoi;
      window.removeEventListener("keydown", tasta);
    };
  }, [deschis]);

  return (
    <>
      <button type="button" onClick={() => setDeschis(true)} className={className}>
        {children}
      </button>

      {deschis &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-ink/55 px-4 py-6 backdrop-blur-sm sm:items-center sm:py-10"
            onClick={(e) => e.target === e.currentTarget && setDeschis(false)}
          >
            <div
              ref={panou}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Află de ce ghid ai nevoie"
              className="relative w-full max-w-2xl bg-cream shadow-[0_40px_90px_-30px_rgba(20,24,22,0.6)] outline-none"
            >
              <button
                type="button"
                onClick={() => setDeschis(false)}
                aria-label="Închide"
                className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center text-ink-soft transition-colors hover:bg-ink hover:text-cream"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
              <div className="px-1 pt-10 sm:px-3">
                <p className="px-6 font-sans text-[0.85rem] text-periwinkle sm:px-10">Chestionarul general, gratuit</p>
                <h2 className="mt-2 px-6 font-display text-[1.9rem] leading-tight text-ink sm:px-10 sm:text-[2.3rem]">
                  Află de ce parte <em className="not-italic text-periwinkle">ai nevoie</em>
                </h2>
              </div>
              <div className="p-1 sm:p-3">
                <GhidGeneral />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
