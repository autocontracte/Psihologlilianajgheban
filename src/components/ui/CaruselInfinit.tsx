"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import {
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { IconArrow } from "./Icons";

/* ----------------------------------------------------------------------------
   Carusel infinit, ca pe pagina iPhone de la Apple.

   Cardurile sunt puse de două ori, una după alta. Poziția crește la nesfârșit,
   iar pe ecran se afișează modulo lățimea unei ture — așa bucla nu are
   cusătură, nici când derulezi cu săgețile peste capătul listei.

   - săgețile mută cu un card;
   - se poate trage cu degetul sau cu mouse-ul;
   - `automat` îl face să curgă singur, încet, spre stânga (doar la recenzii);
     se oprește cât ții mouse-ul pe el și câteva secunde după ce ai umblat la el.
   Cu „mișcare redusă" activată nu curge singur, dar săgețile merg.
   -------------------------------------------------------------------------- */

const PAS_EASE = [0.22, 1, 0.36, 1] as const;

export function CaruselInfinit({
  children,
  automat = false,
  viteza = 40,
  eticheta,
  className = "",
  aliniere = "pl-6 lg:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]",
  antet,
}: {
  children: ReactNode;
  /** Titlul secțiunii — stă în stânga, cu săgețile în dreapta, deasupra benzii. */
  antet?: ReactNode;
  automat?: boolean;
  /** Pixeli pe secundă, când curge singur. */
  viteza?: number;
  /** Numele caruselului pentru cititoarele de ecran. */
  eticheta: string;
  className?: string;
  /** Unde începe primul card — aliniat cu textul de deasupra. */
  aliniere?: string;
}) {
  const reduce = useReducedMotion();
  const banda = useRef<HTMLDivElement>(null);
  const [tura, setTura] = useState(0); // lățimea unui set de carduri
  const [pas, setPas] = useState(340); // lățimea unui card + spațiu
  const poz = useMotionValue(0);
  const pauza = useRef(false);
  const reluare = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // după ce ai tras de bandă, click-ul de la ridicarea degetului nu trebuie să deschidă nimic
  const tras = useRef(false);

  const x = useTransform(poz, (v) => {
    if (!tura) return 0;
    return ((v % tura) - tura) % tura;
  });

  useEffect(() => {
    const el = banda.current;
    if (!el) return;
    const masoara = () => {
      setTura(el.scrollWidth / 2);
      const primul = el.firstElementChild as HTMLElement | null;
      if (primul) {
        const stil = getComputedStyle(primul);
        setPas(primul.offsetWidth + parseFloat(stil.marginRight || "0"));
      }
    };
    masoara();
    const ro = new ResizeObserver(masoara);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (!automat || reduce || pauza.current || !tura) return;
    poz.set(poz.get() - (viteza * Math.min(delta, 64)) / 1000);
  });

  const opresteUnPic = () => {
    pauza.current = true;
    clearTimeout(reluare.current);
    reluare.current = setTimeout(() => (pauza.current = false), 4000);
  };

  const muta = (directie: 1 | -1) => {
    opresteUnPic();
    // aliniem la marginea unui card, ca după săgeată să nu rămână carduri tăiate
    const tinta = Math.round((poz.get() - directie * pas) / pas) * pas;
    animate(poz, tinta, { duration: 0.6, ease: PAS_EASE });
  };

  const elemente = Children.toArray(children);

  return (
    <div
      role="region"
      aria-roledescription="carusel"
      aria-label={eticheta}
      className={`relative ${className}`}
      onMouseEnter={() => {
        pauza.current = true;
        clearTimeout(reluare.current);
      }}
      onMouseLeave={() => {
        pauza.current = false;
      }}
    >
      {/* Antetul și săgețile — sus, mari, ca să se vadă că se poate derula */}
      <div className="mx-auto mb-10 flex max-w-7xl flex-wrap items-end justify-between gap-6 px-6 lg:mb-12 lg:px-10">
        <div className="min-w-0 flex-1">{antet}</div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => muta(-1)}
            aria-label="Înapoi"
            className="flex h-14 w-14 items-center justify-center border border-ink bg-cream text-ink shadow-[0_14px_30px_-18px_rgba(54,60,69,0.6)] transition-colors hover:bg-ink hover:text-cream lg:h-16 lg:w-16"
          >
            <IconArrow className="h-6 w-6 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => muta(1)}
            aria-label="Înainte"
            className="flex h-14 w-14 items-center justify-center bg-ink text-cream shadow-[0_14px_30px_-18px_rgba(54,60,69,0.8)] transition-colors hover:bg-periwinkle lg:h-16 lg:w-16"
          >
            <IconArrow className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div
        className="overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 3%, black 97%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 3%, black 97%, transparent)",
        }}
      >
        <div className={aliniere}>
          <motion.div
            ref={banda}
            style={{ x, touchAction: "pan-y" }}
            className="flex w-max cursor-grab active:cursor-grabbing"
            onPanStart={() => {
              tras.current = true;
              opresteUnPic();
            }}
            onClickCapture={(e) => {
              if (tras.current) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            onPan={(_, info) => poz.set(poz.get() + info.delta.x)}
            onPanEnd={(_, info) => {
              // un mic avânt la final, apoi se așază pe un card
              const tinta = Math.round((poz.get() + info.velocity.x * 0.25) / pas) * pas;
              animate(poz, tinta, { duration: 0.7, ease: PAS_EASE });
              setTimeout(() => (tras.current = false), 60);
            }}
          >
            {elemente}
            {/* A doua tură, pentru bucla fără cusătură. E ascunsă cititoarelor de
                ecran, dar rămâne apăsabilă: când bucla se întoarce, pe ecran pot fi
                chiar cardurile din ea. */}
            <div aria-hidden className="contents">
              {elemente}
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
}
