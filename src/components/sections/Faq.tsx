"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FAQ } from "@/content/site";
import { Reveal } from "../ui/Reveal";
import { Pete } from "../ui/Pete";
import { Lumina } from "../ui/Lumina";
import { AnaPanou } from "../ana/AnaPanou";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="intrebari"
      className="grain relative overflow-clip bg-cream-deep py-28 lg:py-36"
    >
      <Lumina din="stanga" />
      <Pete varianta={1} />
      {/* overflow-clip, nu hidden: altfel panoul Anei nu mai poate sta „sticky" */}
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-2xl">
          <Reveal>
            <p className="font-sans text-[0.78rem] tracking-[0.02em] text-periwinkle">
              {FAQ.eyebrow}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-4xl leading-tight text-ink sm:text-5xl">
              {FAQ.title}
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="rule-soft mt-7" />
          </Reveal>
        </div>

        {/* Stânga: întrebările clasice (pentru oameni și pentru Google).
            Dreapta: Ana, care rămâne pe ecran cât derulezi prin întrebări. */}
        <div className="mt-14 grid items-start gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
        <div className="space-y-3.5">
          {FAQ.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={Math.min(i * 0.05, 0.3)}>
                <div
                  className={[
                    "glass overflow-hidden rounded-none transition-shadow duration-500",
                    isOpen
                      ? "shadow-[0_20px_50px_-28px_rgba(56,62,82,0.45)]"
                      : "",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 px-7 py-6 text-left transition-colors duration-300 hover:bg-white/35 lg:px-8"
                  >
                    <span
                      className={[
                        "font-display text-[1.05rem] leading-snug transition-colors duration-300 lg:text-[1.15rem]",
                        isOpen ? "text-periwinkle" : "text-ink",
                      ].join(" ")}
                    >
                      {item.q}
                    </span>

                    {/* Indicator plus / minus */}
                    <span
                      className={[
                        "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        isOpen
                          ? "bg-periwinkle text-cream"
                          : "bg-periwinkle-pale text-periwinkle",
                      ].join(" ")}
                      aria-hidden
                    >
                      <span className="absolute h-[1.5px] w-3 rounded-none bg-current" />
                      <motion.span
                        animate={{ rotate: isOpen ? 0 : 90, opacity: isOpen ? 0 : 1 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute h-[1.5px] w-3 rounded-none bg-current"
                      />
                    </span>
                  </button>

                  {/* Răspunsul stă mereu în pagină (îl citește și Google); doar se pliază. */}
                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{
                      height: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                      opacity: { duration: 0.3 },
                    }}
                    className="overflow-hidden"
                    aria-hidden={!isOpen}
                  >
                    <p className="px-7 pb-7 font-sans text-[0.88rem] leading-[1.9] text-ink-soft lg:px-8">
                      {item.a}
                    </p>
                  </motion.div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1} className="lg:sticky lg:top-28">
          <AnaPanou />
        </Reveal>
        </div>
      </div>
    </section>
  );
}
