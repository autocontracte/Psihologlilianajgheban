"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ABOUT } from "@/content/site";
import { Reveal } from "../ui/Reveal";
import { OrbitFrame } from "../ui/OrbitFrame";
import { IconCheck } from "../ui/Icons";

export function About() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 50, reduce ? 0 : -50]);

  return (
    <section
      ref={ref}
      id="despre"
      className="relative overflow-hidden bg-cream py-28 lg:py-36"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-10">
        {/* ------------------------------------------------------ Imagine */}
        <motion.div style={{ y }} className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <Reveal direction="right" duration={1}>
            <OrbitFrame
              accent="sage"
              inset="-1.5rem"
              radius="3.5rem"
              duration={22}
              tilt={3.5}
              reverse
            >
              {/* Pată de culoare în spate */}
              <div
                aria-hidden
                className="absolute -inset-5 rounded-[3.25rem] bg-sage-pale/70"
              />
              <div className="relative overflow-hidden rounded-[2.75rem] shadow-[0_36px_80px_-40px_rgba(56,62,82,0.5)]">
                <Image
                  src="/liliana-jgheban.webp"
                  alt="Liliana Jgheban în cabinetul de psihologie"
                  width={1066}
                  height={1600}
                  sizes="(max-width: 1024px) 85vw, 40vw"
                  className="h-full w-full object-cover"
                />
              </div>
            </OrbitFrame>
          </Reveal>
        </motion.div>

        {/* --------------------------------------------------------- Text */}
        <div>
          <Reveal>
            <p className="font-sans text-[0.65rem] uppercase tracking-[0.3em] text-periwinkle">
              {ABOUT.eyebrow}
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-4xl leading-tight text-ink sm:text-5xl lg:text-[3.4rem]">
              {ABOUT.title}
            </h2>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="rule-soft mt-7" />
          </Reveal>

          <div className="mt-8 space-y-5">
            {ABOUT.paragraphs.map((p, i) => (
              <Reveal key={i} delay={0.18 + i * 0.08}>
                <p className="font-sans text-[0.95rem] leading-[1.95] text-ink-soft">
                  {p}
                </p>
              </Reveal>
            ))}
          </div>

          {/* Formare & acreditări */}
          <Reveal delay={0.45}>
            <div className="mt-11 rounded-[2rem] border border-ink/10 bg-cream-warm p-8">
              <p className="font-sans text-[0.58rem] uppercase tracking-[0.24em] text-ink-muted">
                Formare și competențe
              </p>
              <ul className="mt-5 space-y-3.5">
                {ABOUT.credentials.map((c) => (
                  <li key={c} className="flex items-start gap-3.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage-pale text-sage">
                      <IconCheck className="h-3 w-3" strokeWidth={2} />
                    </span>
                    <span className="font-sans text-[0.87rem] leading-relaxed text-ink-soft">
                      {c}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
