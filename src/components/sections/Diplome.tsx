"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { DIPLOME } from "@/content/site";
import { CaruselInfinit } from "../ui/CaruselInfinit";
import { Reveal } from "../ui/Reveal";
import { Accent } from "../ui/Accent";
import { IconArrow } from "../ui/Icons";

/* ----------------------------------------------------------------------------
   Diplomele și atestatele, la finalul secțiunii „Despre mine".

   O bandă care curge singură, încet (se oprește sub mouse), cu fiecare
   document pus ca într-o ramă cu paspartu. Un click îl deschide mare, cu
   săgeți între documente (și din tastatură: ← → Esc).
   -------------------------------------------------------------------------- */

const DOCS = DIPLOME.documente;

export function Diplome() {
  const [deschis, setDeschis] = useState<number | null>(null);

  const muta = useCallback(
    (d: 1 | -1) => setDeschis((i) => (i === null ? i : (i + d + DOCS.length) % DOCS.length)),
    [],
  );

  useEffect(() => {
    if (deschis === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDeschis(null);
      if (e.key === "ArrowRight") muta(1);
      if (e.key === "ArrowLeft") muta(-1);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [deschis === null, muta]); // eslint-disable-line react-hooks/exhaustive-deps

  const doc = deschis === null ? null : DOCS[deschis];

  return (
    <div className="relative mt-24 lg:mt-32">
      <Reveal direction="left" duration={1.1}>
        <CaruselInfinit
          eticheta="Diplomele și atestatele Lilianei Jgheban"
          automat
          viteza={32}
          antet={
            <div className="max-w-2xl">
              <h3 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
                <Accent text={DIPLOME.titlu} />
              </h3>
              <p className="mt-4 font-sans text-[0.95rem] leading-[1.85] text-ink-soft">
                {DIPLOME.descriere}
              </p>
            </div>
          }
        >
          {DOCS.map((d, i) => (
            <figure key={d.src} className="mr-6 w-[min(22rem,80vw)] shrink-0 select-none lg:w-[25rem]">
              <button
                type="button"
                onClick={() => setDeschis(i)}
                aria-label={`Vezi diploma: ${d.titlu}`}
                className="group block w-full bg-white p-3 shadow-[0_28px_56px_-32px_rgba(54,60,69,0.55)] ring-1 ring-ink/5 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_36px_70px_-30px_rgba(54,60,69,0.6)] sm:p-4"
              >
                <span className="relative block aspect-[1600/1132] overflow-hidden bg-cream">
                  <Image
                    src={d.src}
                    alt={`${d.titlu}, ${d.emitent}, ${d.an}`}
                    fill
                    sizes="(max-width: 640px) 80vw, 25rem"
                    draggable={false}
                    className="object-contain transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors duration-500 group-hover:bg-ink/25">
                    <span className="mi flex h-12 w-12 scale-90 items-center justify-center bg-cream text-[1.5rem] text-ink opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
                      zoom_in
                    </span>
                  </span>
                </span>
              </button>
              <figcaption className="mt-4 px-1">
                <span className="inline-block bg-sage-pale px-2 py-0.5 font-sans text-[0.72rem] text-sage">
                  {d.an}
                </span>
                <span className="mt-2 line-clamp-2 block font-display text-[1.05rem] leading-snug text-ink">
                  {d.titlu}
                </span>
                <span className="mt-1 line-clamp-1 block font-sans text-[0.78rem] text-ink-muted">
                  {d.emitent}
                </span>
              </figcaption>
            </figure>
          ))}
        </CaruselInfinit>
      </Reveal>

      {/* Documentul, mare */}
      {doc && deschis !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/85 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setDeschis(null)}
          role="dialog"
          aria-modal="true"
          aria-label={doc.titlu}
        >
          <figure className="flex w-full max-w-5xl flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-full bg-white p-2 shadow-2xl sm:p-3">
              <Image
                key={doc.src}
                src={doc.src}
                alt={`${doc.titlu}, ${doc.emitent}, ${doc.an}`}
                width={1600}
                height={1132}
                sizes="(max-width: 1024px) 96vw, 64rem"
                className="mx-auto h-auto max-h-[72vh] w-auto"
                priority
              />
            </div>
            <figcaption className="mt-5 flex w-full items-start justify-between gap-4 text-cream">
              <div className="min-w-0" aria-live="polite">
                <p className="font-display text-[1.1rem] leading-snug sm:text-[1.3rem]">{doc.titlu}</p>
                <p className="mt-1 font-sans text-[0.82rem] text-cream/70">
                  {doc.emitent} · {doc.an}
                  <span className="ml-3 text-cream/45">
                    {deschis + 1} / {DOCS.length}
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => muta(-1)}
                  aria-label="Diploma anterioară"
                  className="flex h-11 w-11 items-center justify-center border border-cream/35 bg-cream/10 text-cream transition-colors hover:bg-cream hover:text-ink sm:h-12 sm:w-12"
                >
                  <IconArrow className="h-5 w-5 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => muta(1)}
                  aria-label="Diploma următoare"
                  className="flex h-11 w-11 items-center justify-center border border-cream/35 bg-cream/10 text-cream transition-colors hover:bg-cream hover:text-ink sm:h-12 sm:w-12"
                >
                  <IconArrow className="h-5 w-5" />
                </button>
              </div>
            </figcaption>
          </figure>
          <button
            type="button"
            onClick={() => setDeschis(null)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center bg-cream text-ink transition-colors hover:bg-periwinkle hover:text-cream sm:right-6 sm:top-6"
            aria-label="Închide"
          >
            <span className="mi text-[1.4rem]">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
