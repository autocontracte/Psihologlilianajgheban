"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { HERO, PRICE, PHOTOS } from "@/content/site";
import { IconArrow, IconClock, IconOffice, IconPrice } from "../ui/Icons";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const photoY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 70]);
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section
      ref={ref}
      id="acasa"
      className="relative flex min-h-[92vh] items-center overflow-hidden bg-cream pt-32 pb-20 lg:min-h-screen lg:pt-36 lg:pb-24"
    >
      {/* Fotografia cabinetului, ca strat de fundal în dreapta. Se estompează
          spre stânga, ca textul să rămână lizibil fără o casetă peste ea. */}
      <motion.div
        style={{ y: photoY }}
        className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[58%]"
      >
        <div className="relative h-full w-full">
          <Image
            src={PHOTOS.hero}
            alt="Camera de consultații a cabinetului"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover"
          />
          {/* Voal: pe telefon acoperă tot, pe desktop doar dinspre stânga */}
          <div className="absolute inset-0 bg-cream/82 lg:hidden" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-cream via-cream/72 to-cream/10 lg:block" />
        </div>
      </motion.div>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="font-sans text-[0.95rem] text-periwinkle"
          >
            {HERO.eyebrow}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease }}
            className="mt-5 font-display text-[2.9rem] leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-[4.4rem]"
          >
            Liliana Jgheban
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.55, ease }}
            className="mt-7 h-[3px] w-20 origin-left bg-periwinkle"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease }}
            className="mt-7 max-w-lg font-display text-xl leading-relaxed text-ink sm:text-2xl"
          >
            {HERO.tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease }}
            className="mt-5 max-w-lg font-sans text-[1rem] leading-[1.85] text-ink-soft"
          >
            {HERO.intro}
          </motion.p>

          {/* Repere concrete, în locul etichetelor decorative */}
          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.62, ease }}
            className="mt-9 flex flex-wrap gap-x-8 gap-y-3"
          >
            {[
              { Icon: IconPrice, text: `${PRICE.standard} ${PRICE.currency} / ședință` },
              { Icon: IconClock, text: "50 de minute" },
              { Icon: IconOffice, text: "În cabinet și online" },
            ].map(({ Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-2.5 font-sans text-[0.95rem] text-ink"
              >
                <Icon className="h-5 w-5 text-periwinkle" />
                {text}
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.74, ease }}
            className="mt-10 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href={HERO.ctaPrimary.href}
              className="group inline-flex items-center justify-center gap-2.5 bg-periwinkle px-8 py-4 font-sans text-[0.95rem] text-cream transition-colors duration-400 hover:bg-ink"
            >
              {HERO.ctaPrimary.label}
              <IconArrow className="h-5 w-5 transition-transform duration-400 group-hover:translate-x-1" />
            </Link>
            <Link
              href={HERO.ctaSecondary.href}
              className="inline-flex items-center justify-center gap-2.5 border border-ink/25 px-8 py-4 font-sans text-[0.95rem] text-ink transition-colors duration-400 hover:border-ink hover:bg-ink hover:text-cream"
            >
              {HERO.ctaSecondary.label}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
