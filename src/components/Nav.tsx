"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NAV, SITE } from "@/content/site";
import { IconArrow, IconUser } from "./ui/Icons";
import { Logo } from "./ui/Logo";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Blochează scroll-ul paginii cât timp meniul mobil e deschis
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className={[
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          // Marginea rămâne mereu transparentă sau albă: fără culoare explicită,
          // la întoarcerea sus trecea prin culoarea textului și apărea o bară neagră.
          scrolled
            ? "glass !border-x-0 !border-t-0 py-3"
            : "border-b border-transparent bg-transparent py-6",
        ].join(" ")}
      >
        {/* Trei coloane: logo în stânga, meniul la mijloc, acțiunile în dreapta */}
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-6 px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-10">
          {/* Logo */}
          <Link
            href="/#acasa"
            onClick={() => setOpen(false)}
            aria-label="Liliana Jgheban, prima pagină"
            className="flex items-center justify-self-start transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105"
          >
            <Logo marime={scrolled ? 50 : 60} className="transition-all duration-500" />
          </Link>

          {/* Meniu desktop */}
          <nav className="hidden items-center gap-6 xl:gap-9 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link font-sans text-[0.92rem] text-ink-soft transition-colors duration-300 hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Acțiuni */}
          <div className="hidden items-center justify-self-end gap-4 lg:flex">
            {/* Cont — iconiță, cu etichetă la hover */}
            <Link
              href="/cont"
              aria-label="Contul meu"
              className="group relative flex h-10 w-10 items-center justify-center rounded-none border border-ink/15 text-ink-soft transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-periwinkle hover:bg-periwinkle hover:text-cream"
            >
              <IconUser className="h-[1.15rem] w-[1.15rem]" />
              <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-none bg-ink px-3 py-1.5 font-sans text-[0.75rem] tracking-[0.02em] text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Contul meu
              </span>
            </Link>
            <Link
              href="/programari"
              className="group inline-flex items-center gap-2 rounded-none bg-ink px-6 py-3 font-sans text-[0.8rem] tracking-[0.02em] text-cream transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-periwinkle"
            >
              Programare
              <IconArrow className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Buton meniu mobil */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Închide meniul" : "Deschide meniul"}
            aria-expanded={open}
            className="relative z-50 flex h-11 w-11 items-center justify-center justify-self-end rounded-none border border-ink/15 transition-colors duration-300 hover:border-ink/40 lg:hidden"
          >
            <span className="sr-only">Meniu</span>
            <div className="flex w-5 flex-col items-end gap-[5px]">
              <motion.span
                animate={
                  open ? { rotate: 45, y: 6.5, width: 20 } : { rotate: 0, y: 0 }
                }
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="block h-[1.5px] w-5 rounded-none bg-ink"
              />
              <motion.span
                animate={open ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="block h-[1.5px] w-3.5 rounded-none bg-ink"
              />
              <motion.span
                animate={
                  open ? { rotate: -45, y: -7, width: 20 } : { rotate: 0, y: 0 }
                }
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="block h-[1.5px] w-5 rounded-none bg-ink"
              />
            </div>
          </button>
        </div>
      </motion.header>

      {/* Meniu mobil */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-strong fixed inset-0 z-40 !border-0 lg:hidden"
          >
            <div className="flex h-full flex-col justify-center px-8">
              <nav className="flex flex-col gap-1">
                {NAV.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: 0.1 + i * 0.07,
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block border-b border-ink/10 py-4 font-display text-3xl text-ink transition-colors duration-300 hover:text-periwinkle"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.6 }}
                className="mt-10 flex flex-col gap-4"
              >
                <Link
                  href="/programari"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-none bg-periwinkle px-8 py-4 font-sans text-xs tracking-[0.02em] text-cream"
                >
                  Programează o ședință
                  <IconArrow className="h-4 w-4" />
                </Link>
                <Link
                  href="/cont"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center gap-2.5 rounded-none border border-ink/20 px-8 py-3.5 font-sans text-[0.72rem] tracking-[0.02em] text-ink-soft transition-colors hover:border-periwinkle hover:text-periwinkle"
                >
                  <IconUser className="h-4 w-4" />
                  Contul meu
                </Link>
                <a
                  href={`tel:${SITE.phoneHref}`}
                  className="text-center font-sans text-sm text-ink-soft"
                >
                  {SITE.phone}
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
