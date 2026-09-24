"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { REVIEWS } from "@/content/site";
import { Reveal } from "../ui/Reveal";
import { ActionButtons } from "../ui/ActionButtons";
import { CaruselInfinit } from "../ui/CaruselInfinit";
import { Accent } from "../ui/Accent";

/* ----------------------------------------------------------------------------
   Recenziile: capturile mesajelor primite, într-un carusel infinit care curge
   singur, încet (se oprește sub mouse). Un click deschide mesajul întreg.
   Transcrierea fiecărui mesaj e textul alternativ al imaginii.
   -------------------------------------------------------------------------- */

type Mesaj = { src: string; alt: string; nume?: string; context?: string };

const MESAJE: Mesaj[] = [
  ...REVIEWS.mesaje.map((m) => ({
    src: m.foto,
    alt: `Mesaj de la ${m.nume}: ${m.text}`,
    nume: m.nume,
    context: m.context,
  })),
  ...REVIEWS.images,
];

export function Reviews() {
  const [deschis, setDeschis] = useState<number | null>(null);

  useEffect(() => {
    if (deschis === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDeschis(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deschis]);

  return (
    <section id="recenzii" className="relative overflow-hidden bg-cream-deep py-24 lg:py-32">
      {/* Lumină moale, ca de dimineață, peste colțul din stânga */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-32 h-[42rem] w-[42rem]"
        style={{ background: "radial-gradient(closest-side, rgba(255, 246, 228, 0.85), transparent)" }}
      />

      <Reveal direction="left" duration={1.1}>
        <CaruselInfinit
          eticheta="Mesaje primite după terapie"
          automat
          viteza={36}
          antet={
            <div className="max-w-2xl">
              <p className="font-sans text-[0.95rem] text-periwinkle">{REVIEWS.eyebrow}</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
                <Accent text={REVIEWS.title} />
              </h2>
              <p className="mt-6 font-sans text-[1rem] leading-[1.85] text-ink-soft">
                {REVIEWS.subtitle}
              </p>
            </div>
          }
        >
          {MESAJE.map((m, i) => (
            <figure key={m.src} className="mr-4 w-[min(18rem,76vw)] shrink-0 select-none">
              <button
                type="button"
                onClick={() => setDeschis(i)}
                className="group relative block h-[28rem] w-full overflow-hidden bg-cream shadow-[0_24px_50px_-30px_rgba(54,60,69,0.5)]"
                aria-label={m.nume ? `Citește mesajul lui ${m.nume}` : "Vezi mesajul întreg"}
              >
                <Image
                  src={m.src}
                  alt={m.alt}
                  fill
                  sizes="(max-width: 640px) 80vw, 24rem"
                  quality={85}
                  draggable={false}
                  className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                />
                {/* Mesajele sunt lungi: marginea de jos se pierde, ca să se vadă că textul continuă */}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-cream via-cream/85 to-transparent" />
                <span className="absolute bottom-4 left-0 right-0 text-center font-sans text-[0.8rem] text-ink-soft">
                  Apasă pentru mesajul întreg
                </span>
              </button>
              {m.nume && (
                <figcaption className="mt-3 px-1">
                  <span className="font-display text-[1.05rem] text-ink">{m.nume}</span>
                  {m.context && (
                    <span className="ml-2 font-sans text-[0.78rem] text-ink-muted">{m.context}</span>
                  )}
                </figcaption>
              )}
            </figure>
          ))}
        </CaruselInfinit>
      </Reveal>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <ActionButtons className="mt-14" />
      </div>

      {/* Mesajul, la mărime întreagă */}
      {deschis !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4"
          onClick={() => setDeschis(null)}
          role="dialog"
          aria-modal="true"
          aria-label={MESAJE[deschis].nume ? `Mesajul lui ${MESAJE[deschis].nume}` : "Mesaj primit"}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-md overflow-y-auto bg-cream"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={MESAJE[deschis].src}
              alt={MESAJE[deschis].alt}
              width={760}
              height={1400}
              className="h-auto w-full"
            />
          </div>
          <button
            type="button"
            onClick={() => setDeschis(null)}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center bg-cream text-ink transition-colors hover:bg-periwinkle hover:text-cream"
            aria-label="Închide"
          >
            <span className="mi text-[1.4rem]">close</span>
          </button>
        </div>
      )}
    </section>
  );
}
