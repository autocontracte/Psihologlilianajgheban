"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FAQ } from "@/content/site";
import { Reveal } from "../ui/Reveal";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="intrebari"
      className="grain relative overflow-hidden bg-cream-deep py-28 lg:py-36"
    >
      <div className="relative mx-auto max-w-4xl px-6 lg:px-10">
        <div className="text-center">
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
            <div className="rule-soft mx-auto mt-7" />
          </Reveal>
        </div>

        <div className="mt-14 space-y-3.5 lg:mt-16">
          {FAQ.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={Math.min(i * 0.05, 0.3)}>
                <div
                  className={[
                    "overflow-hidden rounded-[1.65rem] bg-cream transition-shadow duration-500",
                    isOpen
                      ? "shadow-[0_20px_50px_-28px_rgba(56,62,82,0.45)]"
                      : "",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 px-7 py-6 text-left transition-colors duration-300 hover:bg-cream-warm lg:px-8"
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
                        "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        isOpen
                          ? "bg-periwinkle text-cream"
                          : "bg-periwinkle-pale text-periwinkle",
                      ].join(" ")}
                      aria-hidden
                    >
                      <span className="absolute h-[1.5px] w-3 rounded-pill bg-current" />
                      <motion.span
                        animate={{ rotate: isOpen ? 0 : 90, opacity: isOpen ? 0 : 1 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute h-[1.5px] w-3 rounded-pill bg-current"
                      />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          height: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                          opacity: { duration: 0.3 },
                        }}
                      >
                        <p className="px-7 pb-7 font-sans text-[0.88rem] leading-[1.9] text-ink-soft lg:px-8">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
