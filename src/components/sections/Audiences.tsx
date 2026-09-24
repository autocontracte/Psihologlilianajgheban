"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AUDIENCES, SITE } from "@/content/site";
import { ICONS, IconCalendar, IconPhone, type IconName } from "../ui/Icons";
import { Reveal } from "../ui/Reveal";
import { CaruselInfinit } from "../ui/CaruselInfinit";

/* ----------------------------------------------------------------------------
   „Cui mă adresez" — carduri mari, ca pe pagina iPhone de la Apple, într-un
   carusel infinit pe care îl muți din săgeți sau cu degetul (nu curge singur).
   „+" deschide o fereastră cu explicația completă pentru fiecare categorie.
   Cui i se adresează fiecare card e titlul mare; fraza caldă vine dedesubt.
   -------------------------------------------------------------------------- */

type Item = (typeof AUDIENCES.items)[number] & { foto?: string };

/* Cardurile fără fotografie au fiecare fundalul lui, ca rândul să aibă ritm. */
const TEME: Record<string, { fundal: string; deschis: boolean; accent: string }> = {
  teens: { fundal: "bg-ink", deschis: true, accent: "bg-periwinkle-light/25 text-periwinkle-light" },
  children: { fundal: "bg-sage-pale", deschis: false, accent: "bg-sage/15 text-sage" },
  parents: { fundal: "bg-gradient-to-b from-periwinkle-light to-periwinkle", deschis: true, accent: "bg-cream/20 text-cream" },
  sandtray: { fundal: "bg-cream-deep", deschis: false, accent: "bg-periwinkle/15 text-periwinkle" },
};

function Card({ item, onDeschide }: { item: Item; onDeschide: () => void }) {
  const Icon = ICONS[item.icon as IconName];
  const tema = TEME[item.icon];
  const deschis = item.foto ? true : !!tema?.deschis;

  return (
    <article
      className={[
        "relative mr-5 flex h-[30rem] w-[18rem] shrink-0 select-none flex-col overflow-hidden p-7 sm:h-[34rem] sm:w-[21rem] lg:h-[35rem] lg:w-[22.5rem] lg:p-8",
        item.foto ? "bg-ink" : tema?.fundal,
      ].join(" ")}
    >
      {item.foto && (
        <>
          {/* Fotografia e lată, cardul e înalt: ca să-l acopere, imaginea se afișează
              de ~2,4 ori mai lată decât cardul. De aici „sizes" generos — altfel
              browserul alege o variantă mică și poza iese pixelată. */}
          <Image
            src={item.foto}
            alt=""
            fill
            sizes="(max-width: 640px) 110vw, 56rem"
            quality={85}
            draggable={false}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/25 to-ink/80" />
        </>
      )}

      <div className="relative">
        <span
          className={`flex h-12 w-12 items-center justify-center ${item.foto ? "bg-cream/20 text-cream" : tema?.accent}`}
        >
          <Icon className="h-6 w-6" />
        </span>
        <h3
          className={`mt-6 font-display text-[2rem] font-semibold leading-[1.1] sm:text-[2.25rem] ${deschis ? "text-cream" : "text-ink"}`}
        >
          {item.title}
        </h3>
        <p
          className={`mt-4 font-display text-[1.2rem] italic leading-snug sm:text-[1.35rem] ${deschis ? "text-cream/85" : "text-ink-soft"}`}
        >
          {item.slogan}
        </p>
      </div>

      <div className="relative mt-auto flex items-end justify-between gap-5">
        <p
          className={`max-w-[15rem] font-sans text-[0.9rem] leading-relaxed ${deschis ? "text-cream/80" : "text-ink-soft"}`}
        >
          {item.description}
        </p>
        <button
          type="button"
          onClick={onDeschide}
          aria-haspopup="dialog"
          aria-label={`Află mai multe: ${item.title}`}
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center transition-colors",
            deschis ? "bg-cream text-ink hover:bg-periwinkle-light" : "bg-ink text-cream hover:bg-periwinkle",
          ].join(" ")}
        >
          <span className="mi text-[1.4rem]">add</span>
        </button>
      </div>
    </article>
  );
}

/**
 * Fereastra cu explicația completă. Toate ferestrele sunt în pagină de la
 * început (doar ascunse), ca textul lor să fie citit și de Google.
 */
function Fereastra({ item, deschisa, onInchide }: { item: Item; deschisa: boolean; onInchide: () => void }) {
  const Icon = ICONS[item.icon as IconName];
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`pentru-${item.icon}`}
      aria-hidden={!deschisa}
      onClick={onInchide}
      className={[
        "fixed inset-0 z-[60] flex items-end justify-center bg-ink/55 p-3 backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:items-center sm:p-6",
        deschisa ? "visible opacity-100" : "invisible opacity-0",
      ].join(" ")}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={[
          "glass-strong relative max-h-[88svh] w-full max-w-2xl overflow-y-auto !bg-cream-warm/95 p-7 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:p-10",
          deschisa ? "translate-y-0" : "translate-y-8",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={onInchide}
          aria-label="Închide"
          tabIndex={deschisa ? 0 : -1}
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors hover:bg-ink hover:text-cream"
        >
          <span className="mi text-[1.4rem]">close</span>
        </button>

        <span className="flex h-12 w-12 items-center justify-center bg-periwinkle-pale text-periwinkle">
          <Icon className="h-6 w-6" />
        </span>
        <p className="mt-6 font-sans text-[0.82rem] text-periwinkle">Pentru cine</p>
        <h3 id={`pentru-${item.icon}`} className="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">
          {item.title}
        </h3>
        <p className="mt-3 font-display text-xl italic text-ink-soft">{item.slogan}</p>

        <div className="mt-6 space-y-4">
          {item.detalii.text.map((t) => (
            <p key={t} className="font-sans text-[0.95rem] leading-[1.85] text-ink-soft">
              {t}
            </p>
          ))}
        </div>

        <p className="mt-7 font-sans text-[0.82rem] text-ink-muted">Te poate ajuta dacă te confrunți cu:</p>
        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 sm:gap-x-6">
          {item.detalii.semne.map((x) => (
            <li key={x} className="flex items-start gap-3 font-sans text-[0.9rem] leading-relaxed text-ink">
              <span aria-hidden className="mt-[0.6em] h-[5px] w-[5px] shrink-0 bg-periwinkle" />
              {x}
            </li>
          ))}
        </ul>

        <h4 className="mt-8 font-display text-[1.15rem] text-ink">Cum lucrăm</h4>
        <p className="mt-2 font-sans text-[0.95rem] leading-[1.85] text-ink-soft">{item.detalii.cum}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/programari"
            tabIndex={deschisa ? 0 : -1}
            className="inline-flex items-center justify-center gap-2.5 bg-periwinkle px-6 py-3.5 font-sans text-[0.92rem] text-cream transition-colors hover:bg-ink"
          >
            <IconCalendar className="h-5 w-5" />
            Programează o ședință
          </Link>
          <a
            href={`tel:${SITE.phoneHref}`}
            tabIndex={deschisa ? 0 : -1}
            className="glass-btn inline-flex items-center justify-center gap-2.5 px-6 py-3.5 font-sans text-[0.92rem] text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            <IconPhone className="h-5 w-5" />
            Sună acum
          </a>
        </div>
      </div>
    </div>
  );
}

export function Audiences() {
  const items = AUDIENCES.items as readonly Item[];
  const [deschis, setDeschis] = useState<number | null>(null);

  useEffect(() => {
    if (deschis === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDeschis(null);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [deschis]);

  return (
    <section id="pentru-cine" className="relative overflow-hidden bg-cream py-28 lg:py-36">
      {/* Lumină caldă, ca de la o fereastră, în colțul de sus */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10rem] h-[44rem] w-[44rem]"
        style={{ background: "radial-gradient(closest-side, rgba(255, 244, 222, 0.9), transparent)" }}
      />

      <Reveal direction="left" duration={1.1}>
        <CaruselInfinit
          eticheta="Cui mă adresez"
          antet={
            <div className="max-w-2xl">
              <p className="font-sans text-[0.78rem] tracking-[0.02em] text-periwinkle">
                {AUDIENCES.eyebrow}
              </p>
              <h2 className="mt-5 font-display text-4xl leading-tight text-ink sm:text-5xl">
                {AUDIENCES.title}
              </h2>
              <div className="rule-soft mt-7" />
              <p className="mt-7 font-sans text-[0.95rem] leading-[1.9] text-ink-soft">
                {AUDIENCES.subtitle}
              </p>
            </div>
          }
        >
          {items.map((item, i) => (
            <Card key={item.icon} item={item} onDeschide={() => setDeschis(i)} />
          ))}
        </CaruselInfinit>
      </Reveal>

      {items.map((item, i) => (
        <Fereastra key={item.icon} item={item} deschisa={deschis === i} onInchide={() => setDeschis(null)} />
      ))}
    </section>
  );
}
