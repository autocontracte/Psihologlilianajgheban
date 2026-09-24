"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/* ----------------------------------------------------------------------------
   Valul dintre două secțiuni.

   Se pune între secțiuni, cu culoarea celei care urmează. Urcă peste marginea
   de jos a secțiunii de deasupra, așa că trecerea dintre două fundaluri nu mai
   e o linie dreaptă, ci o undă. Două straturi — unul plin, unul translucid —
   alunecă foarte încet în sensuri opuse pe măsură ce derulezi, ca apa.
   Cu „mișcare redusă" activată, valurile stau pe loc.
   -------------------------------------------------------------------------- */

const FORME = {
  1: {
    fata: "M0,62 C220,24 470,18 720,48 C970,78 1210,86 1440,44 L1440,100 L0,100 Z",
    spate: "M0,38 C210,78 470,84 730,50 C990,16 1230,22 1440,58 L1440,100 L0,100 Z",
  },
  2: {
    fata: "M0,48 C260,84 520,86 760,56 C1000,26 1240,20 1440,52 L1440,100 L0,100 Z",
    spate: "M0,66 C240,30 500,24 740,46 C980,68 1220,82 1440,40 L1440,100 L0,100 Z",
  },
} as const;

export function Val({
  culoare,
  varianta = 1,
}: {
  /** Culoarea secțiunii de dedesubt, ex. "var(--color-ink)". */
  culoare: string;
  varianta?: 1 | 2;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const mers = reduce ? 0 : 1;
  const xFata = useTransform(scrollYProgress, [0, 1], [`${-3 * mers}%`, `${3 * mers}%`]);
  const xSpate = useTransform(scrollYProgress, [0, 1], [`${4 * mers}%`, `${-4 * mers}%`]);
  const forma = FORME[varianta];

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none relative z-10 -mt-14 h-14 overflow-x-clip sm:-mt-20 sm:h-20 lg:-mt-24 lg:h-24"
    >
      <motion.svg
        style={{ x: xSpate }}
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-[-6%] h-full w-[112%]"
      >
        <path d={forma.spate} fill={culoare} opacity={0.3} />
      </motion.svg>
      <motion.svg
        style={{ x: xFata }}
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className="absolute bottom-[-3px] left-[-6%] h-[calc(100%+3px)] w-[112%]"
      >
        <path d={forma.fata} fill={culoare} />
      </motion.svg>
    </div>
  );
}
