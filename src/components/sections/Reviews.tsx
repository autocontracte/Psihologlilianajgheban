"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { REVIEWS } from "@/content/site";
import { Reveal } from "../ui/Reveal";
import { IconArrow, IconQuote } from "../ui/Icons";
import { ActionButtons } from "../ui/ActionButtons";

/** Mesajele primite, ca imagini, într-o bandă care se derulează lateral. */
export function Reviews() {
  const rail = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number | null>(null);

  const scroll = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const card = el.querySelector("figure");
    const step = card ? card.getBoundingClientRect().width + 12 : 320;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section
      id="recenzii"
      className="relative overflow-hidden bg-cream-deep py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Reveal>
              <p className="font-sans text-[0.95rem] text-periwinkle">
                {REVIEWS.eyebrow}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
                {REVIEWS.title}
              </h2>
            </Reveal>
            <Reveal delay={0.14}>
              <div className="rule-soft mt-6" />
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 font-sans text-[1rem] leading-[1.85] text-ink-soft">
                {REVIEWS.subtitle}
              </p>
            </Reveal>
          </div>

          {/* Săgeți, doar unde banda chiar se derulează */}
          <Reveal delay={0.24}>
            <div className="flex gap-2">
              {([-1, 1] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => scroll(dir)}
                  aria-label={dir === -1 ? "Mesajul anterior" : "Mesajul următor"}
                  className="flex h-11 w-11 items-center justify-center border border-ink/20 bg-cream text-ink transition-colors duration-300 hover:border-periwinkle hover:bg-periwinkle hover:text-cream"
                >
                  <IconArrow
                    className="h-5 w-5"
                    style={dir === -1 ? { transform: "rotate(180deg)" } : undefined}
                  />
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <div
          ref={rail}
          className="mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {REVIEWS.images.map((r, i) => (
            <figure
              key={r.src}
              className="w-[min(19rem,78vw)] shrink-0 snap-start bg-cream"
            >
              <button
                type="button"
                onClick={() => setZoom(i)}
                className="group relative block h-[26rem] w-full overflow-hidden"
                aria-label="Vezi mesajul întreg"
              >
                <Image
                  src={r.src}
                  alt={r.alt}
                  fill
                  sizes="19rem"
                  className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                />
                {/* Mesajele sunt lungi: marginea de jos se pierde în fundal,
                    ca să se vadă că textul continuă. */}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-cream to-transparent" />
                <span className="absolute bottom-4 left-0 right-0 text-center font-sans text-[0.8rem] text-ink-soft">
                  Apasă pentru mesajul întreg
                </span>
              </button>
            </figure>
          ))}
        </div>

        <p className="mt-4 flex items-center gap-2 font-sans text-[0.85rem] text-ink-muted">
          <IconQuote className="h-4 w-4" />
          Publicate cu acordul persoanelor care le-au scris.
        </p>

        <ActionButtons className="mt-14" />
      </div>

      {/* Mesajul, la mărime întreagă */}
      {zoom !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4"
          onClick={() => setZoom(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-h-[92vh] w-full max-w-md overflow-y-auto bg-cream"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={REVIEWS.images[zoom].src}
              alt={REVIEWS.images[zoom].alt}
              width={1080}
              height={2050}
              className="h-auto w-full"
            />
          </div>
          <button
            type="button"
            onClick={() => setZoom(null)}
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
