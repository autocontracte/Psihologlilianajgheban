"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { PHOTOS } from "@/content/site";
import { Reveal } from "../ui/Reveal";
import { ActionButtons } from "../ui/ActionButtons";
import { Lumina } from "../ui/Lumina";
import { IconArrow } from "../ui/Icons";

/* ----------------------------------------------------------------------------
   Fotografiile cabinetului. Un om care caută terapie vrea să vadă unde intră.

   Un carusel pe toată lățimea ecranului: fotografia curentă mare, la mijloc,
   cu vecinele care se văd pe margini. În spate, pe toată banda, aceeași
   fotografie, mărită și blurată, care se schimbă odată cu slide-ul — camera
   „umple" pagina, fără să taie din fotografia propriu-zisă.

   Derularea e nativă (scroll-snap): merge cu degetul pe telefon, cu
   trackpad-ul și cu săgețile.
   -------------------------------------------------------------------------- */

export function Gallery() {
  const poze = PHOTOS.cabinet;
  const [activ, setActiv] = useState(0);
  const pista = useRef<HTMLDivElement>(null);

  // Slide-ul activ e cel al cărui centru e cel mai aproape de centrul pistei
  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    let cadru = 0;
    const actualizeaza = () => {
      cadru = 0;
      const centru = el.scrollLeft + el.clientWidth / 2;
      let cel = 0;
      let dist = Infinity;
      Array.from(el.children).forEach((c, i) => {
        const s = c as HTMLElement;
        const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - centru);
        if (d < dist) {
          dist = d;
          cel = i;
        }
      });
      setActiv(cel);
    };
    const laDerulare = () => {
      if (!cadru) cadru = requestAnimationFrame(actualizeaza);
    };
    el.addEventListener("scroll", laDerulare, { passive: true });
    window.addEventListener("resize", laDerulare);
    return () => {
      el.removeEventListener("scroll", laDerulare);
      window.removeEventListener("resize", laDerulare);
      if (cadru) cancelAnimationFrame(cadru);
    };
  }, []);

  const du = useCallback(
    (i: number) => {
      const el = pista.current;
      const s = el?.children[(i + poze.length) % poze.length] as HTMLElement | undefined;
      if (!el || !s) return;
      el.scrollTo({ left: s.offsetLeft - (el.clientWidth - s.offsetWidth) / 2, behavior: "smooth" });
    },
    [poze.length],
  );

  return (
    <section id="cabinet" className="relative overflow-hidden bg-cream py-24 lg:py-32">
      <Lumina din="stanga" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-2xl">
          <Reveal>
            <p className="font-sans text-[0.95rem] text-periwinkle">Cabinetul</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
              Locul în care <em className="not-italic text-periwinkle">ne vedem</em>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 font-sans text-[1rem] leading-[1.85] text-ink-soft">
              Un apartament liniștit, cu lumină naturală și fără aer de clinică.
              Poți vedea dinainte unde vei sta, ca prima venire să fie mai ușoară.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Banda pe toată lățimea */}
      <Reveal delay={0.1}>
        <div
          className="relative mt-14 py-10 lg:py-14"
          role="region"
          aria-roledescription="carusel"
          aria-label="Fotografiile cabinetului"
        >
          {/* Fundalul: fotografia activă, blurată; masca o topește în pagină sus și jos */}
          <div
            aria-hidden
            className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]"
          >
            {poze.map((p, i) => (
              <Image
                key={p.src}
                src={p.src}
                alt=""
                fill
                sizes="40vw"
                className={`scale-125 object-cover blur-3xl saturate-[1.15] transition-opacity duration-[900ms] ${i === activ ? "opacity-90" : "opacity-0"}`}
              />
            ))}
            <div className="absolute inset-0 bg-cream/25" />
          </div>

          <div className="relative">
            <div
              ref={pista}
              className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto px-[7vw] [scrollbar-width:none] sm:gap-6 sm:px-[14vw] lg:px-[18vw] [&::-webkit-scrollbar]:hidden"
            >
              {poze.map((p, i) => (
                <figure
                  key={p.src}
                  className="relative w-[86vw] shrink-0 snap-center sm:w-[72vw] lg:w-[64vw]"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} din ${poze.length}`}
                >
                  <button
                    type="button"
                    onClick={() => du(i)}
                    tabIndex={i === activ ? -1 : 0}
                    aria-label={i === activ ? p.alt : `Arată: ${p.alt}`}
                    className={`relative block aspect-[4/3] w-full overflow-hidden bg-cream-deep shadow-[0_40px_80px_-40px_rgba(40,48,40,0.55)] transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:aspect-[3/2] ${i === activ ? "scale-100 opacity-100" : "scale-[0.94] cursor-pointer opacity-55 hover:opacity-80"}`}
                  >
                    <Image
                      src={p.src}
                      alt={p.alt}
                      fill
                      sizes="(min-width: 1024px) 64vw, (min-width: 640px) 72vw, 86vw"
                      className="object-cover"
                    />
                  </button>
                </figure>
              ))}
            </div>
            {/* Peste fotografia din mijloc, jos: descrierea, punctele și săgețile.
                Stratul lasă degetul să treacă (swipe); doar butoanele primesc clic. */}
            <div className="pointer-events-none absolute inset-y-0 left-1/2 flex w-[86vw] -translate-x-1/2 items-end sm:w-[72vw] lg:w-[64vw]">
              <div className="flex w-full items-end justify-between gap-4 bg-gradient-to-t from-ink/80 via-ink/40 to-transparent px-4 pb-4 pt-20 sm:px-7 sm:pb-6 lg:px-9 lg:pb-7">
                <div className="min-w-0" aria-live="polite">
                  <p className="font-display text-[1.05rem] leading-none text-cream sm:text-[1.25rem]">
                    {String(activ + 1).padStart(2, "0")}
                    <span className="text-cream/50"> / {String(poze.length).padStart(2, "0")}</span>
                  </p>
                  <p className="mt-2 line-clamp-2 font-sans text-[0.82rem] leading-snug text-cream/85 sm:text-[0.95rem]">
                    {poze[activ].alt}
                  </p>
                  <div className="pointer-events-auto mt-3 hidden gap-2 sm:flex">
                    {poze.map((p, i) => (
                      <button
                        key={p.src}
                        type="button"
                        onClick={() => du(i)}
                        aria-label={`Fotografia ${i + 1}`}
                        aria-current={i === activ}
                        className={`h-1.5 transition-all duration-500 ${i === activ ? "w-8 bg-cream" : "w-3 bg-cream/35 hover:bg-cream/60"}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="pointer-events-auto flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => du(activ - 1)}
                    aria-label="Fotografia anterioară"
                    className="flex h-10 w-10 items-center justify-center border border-cream/35 bg-cream/15 text-cream backdrop-blur-md transition-colors hover:bg-cream hover:text-ink sm:h-12 sm:w-12"
                  >
                    <IconArrow className="h-5 w-5 rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={() => du(activ + 1)}
                    aria-label="Fotografia următoare"
                    className="flex h-10 w-10 items-center justify-center border border-cream/35 bg-cream/15 text-cream backdrop-blur-md transition-colors hover:bg-cream hover:text-ink sm:h-12 sm:w-12"
                  >
                    <IconArrow className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <ActionButtons variant="light" className="mt-12" />
      </div>
    </section>
  );
}

