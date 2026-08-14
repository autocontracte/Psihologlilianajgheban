"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NAV, SITE } from "@/content/site";
import { IconArrow, IconUser } from "./ui/Icons";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className={[
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          scrolled
            ? "bg-cream/85 py-3 shadow-[0_10px_40px_-24px_rgba(56,62,82,0.45)] backdrop-blur-xl"
            : "bg-transparent py-6",
        ].join(" ")}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10">
          {/* Logo */}
          <Link
            href="/#acasa"
            className="group flex flex-col leading-none"
            onClick={() => setOpen(false)}
          >
            <span className="font-display text-lg tracking-tight text-ink transition-colors duration-500 group-hover:text-periwinkle sm:text-xl">
              Liliana Jgheban
            </span>
            <span className="mt-1 font-sans text-[0.55rem] uppercase tracking-[0.28em] text-ink-muted">
              Psiholog · Psihoterapeut
            </span>
          </Link>

          {/* Meniu desktop */}
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link font-sans text-[0.7rem] uppercase tracking-[0.16em] text-ink-soft transition-colors duration-300 hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            {/* Cont — iconiță, cu etichetă la hover */}
            <Link
              href="/cont"
              aria-label="Contul meu"
              className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink-soft transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-periwinkle hover:bg-periwinkle hover:text-cream"
            >
              <IconUser className="h-[1.15rem] w-[1.15rem]" />
              <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-pill bg-ink px-3 py-1.5 font-sans text-[0.6rem] uppercase tracking-[0.14em] text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Contul meu
              </span>
            </Link>
            <Link
              href="/programari"
              className="group inline-flex items-center gap-2 rounded-pill bg-ink px-6 py-3 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-cream transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-periwinkle"
            >
              Programare
              <IconArrow className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </nav>

          {/* Buton meniu mobil */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Închide meniul" : "Deschide meniul"}
            aria-expanded={open}
            className="relative z-50 flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 transition-colors duration-300 hover:border-ink/40 lg:hidden"
          >
            <span className="sr-only">Meniu</span>
            <div className="flex w-5 flex-col items-end gap-[5px]">
              <motion.span
                animate={
                  open ? { rotate: 45, y: 6.5, width: 20 } : { rotate: 0, y: 0 }
                }
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="block h-[1.5px] w-5 rounded-pill bg-ink"
              />
              <motion.span
                animate={open ? { opacity: 0, x: 8 } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="block h-[1.5px] w-3.5 rounded-pill bg-ink"
              />
              <motion.span
                animate={
                  open ? { rotate: -45, y: -7, width: 20 } : { rotate: 0, y: 0 }
                }
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="block h-[1.5px] w-5 rounded-pill bg-ink"
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
            className="fixed inset-0 z-40 bg-cream lg:hidden"
          >
            <div className="flex h-full flex-col justify-center px-8">
              <nav className="flex flex-col gap-1">
                {NAV.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
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
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.6 }}
                className="mt-10 flex flex-col gap-4"
              >
                <Link
                  href="/programari"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-pill bg-periwinkle px-8 py-4 font-sans text-xs uppercase tracking-[0.16em] text-cream"
                >
                  Programează o ședință
                  <IconArrow className="h-4 w-4" />
                </Link>
                <Link
                  href="/cont"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center gap-2.5 rounded-pill border border-ink/20 px-8 py-3.5 font-sans text-[0.72rem] uppercase tracking-[0.16em] text-ink-soft transition-colors hover:border-periwinkle hover:text-periwinkle"
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
