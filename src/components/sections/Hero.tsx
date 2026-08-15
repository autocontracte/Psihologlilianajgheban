"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { HERO } from "@/content/site";
import { IconArrow } from "../ui/Icons";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -40]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section
      ref={ref}
      id="acasa"
      className="grain relative flex min-h-screen items-center overflow-hidden bg-cream pt-32 pb-28 lg:pt-36 lg:pb-32"
    >
      {/* Forme decorative de fundal */}
      <motion.div
        aria-hidden
        animate={reduce ? {} : { y: [0, -26, 0], scale: [1, 1.04, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-32 -right-24 h-[34rem] w-[34rem] rounded-full bg-periwinkle-pale/60 blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={reduce ? {} : { y: [0, 30, 0], scale: [1, 1.06, 1] }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
        className="pointer-events-none absolute -bottom-40 -left-32 h-[30rem] w-[30rem] rounded-full bg-sage-pale/60 blur-3xl"
      />

      {/* Coloana imaginii are lățime fixă, ca portretul să nu crească peste
          înălțimea ecranului pe laptopuri cu ecran scund. */}
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1fr_24rem] lg:gap-16 lg:px-10 xl:grid-cols-[1fr_26rem] xl:gap-20">
        {/* ------------------------------------------------------- Text */}
        <motion.div style={{ y: textY, opacity: fade }} className="relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease }}
            className="font-sans text-[0.78rem] tracking-[0.02em] text-periwinkle sm:text-xs"
          >
            {HERO.eyebrow}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease }}
            className="mt-6 font-display text-[3.1rem] leading-[0.95] tracking-[-0.02em] text-ink sm:text-7xl lg:text-[5.4rem]"
          >
            Liliana
            <br />
            <span className="italic text-periwinkle">Jgheban</span>
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.7, ease }}
            className="mt-8 h-px w-24 origin-left bg-gradient-to-r from-periwinkle to-sage"
          />

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease }}
            className="mt-8 max-w-md font-serif text-xl leading-relaxed text-ink sm:text-2xl"
          >
            {HERO.tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.68, ease }}
            className="mt-5 max-w-lg font-sans text-[0.95rem] leading-[1.85] text-ink-soft"
          >
            {HERO.intro}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.82, ease }}
            className="mt-11 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <Link
              href={HERO.ctaPrimary.href}
              className="group inline-flex items-center justify-center gap-2.5 rounded-pill bg-periwinkle px-8 py-4 font-sans text-[0.7rem] tracking-[0.02em] text-cream shadow-[0_18px_40px_-16px_rgba(103,120,175,0.8)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink hover:shadow-[0_22px_48px_-18px_rgba(56,62,82,0.7)]"
            >
              {HERO.ctaPrimary.label}
              <IconArrow className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
            <Link
              href={HERO.ctaSecondary.href}
              className="group inline-flex items-center justify-center gap-2.5 rounded-pill border border-ink/20 px-8 py-4 font-sans text-[0.7rem] tracking-[0.02em] text-ink transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-ink/50 hover:bg-ink hover:text-cream"
            >
              {HERO.ctaSecondary.label}
            </Link>
          </motion.div>
        </motion.div>

        {/* ------------------------------------------------------ Imagine */}
        <motion.div
          style={{ y: imageY }}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.3, delay: 0.3, ease }}
          className="relative mx-auto w-full max-w-[19rem] sm:max-w-[21rem] lg:max-w-none"
        >
          {/* Contur decorativ în spate */}
          <motion.div
            aria-hidden
            animate={reduce ? {} : { rotate: [0, 4, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-4 rounded-[3.5rem] border border-periwinkle/25 sm:-inset-6"
          />

          <div className="relative overflow-hidden rounded-[3rem] bg-cream-deep shadow-[0_40px_90px_-40px_rgba(56,62,82,0.55)] sm:rounded-[3.5rem]">
            <Image
              src="/liliana-jgheban.webp"
              alt="Liliana Jgheban, psiholog clinician și psihoterapeut integrativ"
              width={1066}
              height={1600}
              priority
              sizes="(max-width: 1024px) 85vw, 26rem"
              className="h-full w-full object-cover"
            />
            {/* Voal cald peste imagine */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
          </div>

          {/* Card plutitor */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 1.15, ease }}
            className="absolute -bottom-6 -left-4 rounded-[1.75rem] bg-cream/90 px-6 py-4 shadow-[0_20px_50px_-24px_rgba(56,62,82,0.5)] backdrop-blur-md sm:-left-8 sm:px-7 sm:py-5"
          >
            <p className="font-sans text-[0.74rem] tracking-[0.02em] text-ink-muted">
              Ședințe
            </p>
            <p className="mt-1.5 font-display text-lg text-ink sm:text-xl">
              În cabinet & online
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Indicator de scroll */}
      <motion.div
        style={{ opacity: fade }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="pointer-events-none absolute bottom-10 left-6 hidden flex-col items-start gap-3 lg:left-10 [@media(min-width:1024px)_and_(min-height:800px)]:flex"
      >
        <span className="font-sans text-[0.72rem] tracking-[0.02em] text-ink-muted">
          Derulează
        </span>
        <div className="relative h-12 w-px overflow-hidden bg-ink/15">
          <motion.div
            animate={{ y: [-48, 48] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-x-0 h-6 bg-periwinkle"
          />
        </div>
      </motion.div>
    </section>
  );
}
