"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { SERVICES, PRICE } from "@/content/site";
import { Reveal } from "../ui/Reveal";
import { ActionButtons } from "../ui/ActionButtons";
import { Lumina } from "../ui/Lumina";
import { IconArrow } from "../ui/Icons";

/* ----------------------------------------------------------------------------
   Serviciile, ca o hartă: „drumul tău".

   Un fir (ca un șnur) șerpuiește prin pagină și leagă serviciile ca pe niște
   opriri pe un traseu. Traseul întreg se vede punctat, ca pe o hartă; pe măsură
   ce derulezi, firul se „coase" peste el, iar fiecare oprire se aprinde când
   ajungi la ea. La capăt: primul pas — o discuție.

   Pe fiecare card, situațiile în care ajută serviciul sunt într-un dropdown.
   Textul lor e mereu în pagină (doar pliat), ca să-l citească și Google.

   Firul e desenat dintr-un SVG calculat după pozițiile reale ale opririlor,
   deci merge la fel pe desktop (zigzag stânga–dreapta) și pe telefon (firul pe
   margine). Nimic nu se rotește; singura mișcare e firul care se desenează.
   -------------------------------------------------------------------------- */

type Punct = { x: number; y: number };

/** Un fir moale prin toate punctele: între două opriri face o undă ușoară, ca un șnur. */
function traseu(p: Punct[], unda: number): string {
  if (p.length < 2) return "";
  let d = `M ${p[0].x} ${p[0].y}`;
  for (let i = 1; i < p.length; i++) {
    const a = p[i - 1];
    const b = p[i];
    const dy = b.y - a.y;
    const sens = i % 2 === 0 ? 1 : -1;
    d += ` C ${a.x + sens * unda} ${a.y + dy * 0.45}, ${b.x - sens * unda} ${b.y - dy * 0.45}, ${b.x} ${b.y}`;
  }
  return d;
}

function Oprire({
  numar,
  final = false,
}: {
  numar: string;
  final?: boolean;
}) {
  return (
    <motion.span
      data-oprire
      initial={{ scale: 0.7, backgroundColor: "rgba(243,244,238,1)", color: "rgb(110,133,103)" }}
      whileInView={{ scale: 1, backgroundColor: "rgb(110,133,103)", color: "rgb(243,244,238)" }}
      viewport={{ once: true, margin: "0px 0px -28% 0px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={[
        "relative z-[2] flex shrink-0 items-center justify-center border-2 border-periwinkle font-display shadow-[0_0_0_8px_rgba(233,235,225,0.9),0_14px_30px_-12px_rgba(110,133,103,0.6)]",
        final ? "h-16 w-16 text-[1.5rem]" : "h-14 w-14 text-[1.15rem]",
      ].join(" ")}
      style={{ borderRadius: "9999px" }}
    >
      {numar}
    </motion.span>
  );
}

function Card({ item }: { item: (typeof SERVICES.items)[number] }) {
  const [deschis, setDeschis] = useState(false);
  const id = `situatii-${item.number}`;

  return (
    <article className="glass lift group relative w-full p-7 sm:p-9">
      <span className="inline-flex bg-sage-pale px-3.5 py-1.5 font-sans text-[0.74rem] tracking-[0.02em] text-sage">
        {item.audience}
      </span>
      <h3 className="mt-5 font-display text-[1.5rem] leading-[1.25] text-ink sm:text-[1.7rem]">
        {item.title}
      </h3>
      <p className="mt-4 font-sans text-[0.9rem] leading-[1.85] text-ink-soft">{item.description}</p>

      {/* Situațiile — dropdown. Textul rămâne în pagină și când e pliat. */}
      <div className="mt-6 border-t border-ink/10">
        <button
          type="button"
          onClick={() => setDeschis((v) => !v)}
          aria-expanded={deschis}
          aria-controls={id}
          className="flex w-full items-center justify-between gap-4 pt-5 text-left"
        >
          <span className="font-sans text-[0.9rem] font-medium text-ink">Când te poate ajuta</span>
          <span
            aria-hidden
            className={[
              "flex h-8 w-8 shrink-0 items-center justify-center transition-colors duration-300",
              deschis ? "bg-periwinkle text-cream" : "bg-periwinkle-pale text-periwinkle",
            ].join(" ")}
          >
            <svg viewBox="0 0 12 12" className={`h-3 w-3 transition-transform duration-500 ${deschis ? "rotate-180" : ""}`}>
              <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
        <motion.div
          id={id}
          initial={false}
          animate={{ height: deschis ? "auto" : 0, opacity: deschis ? 1 : 0 }}
          transition={{ height: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.3 } }}
          className="overflow-hidden"
          aria-hidden={!deschis}
        >
          <ul className="space-y-2.5 pt-4">
            {item.situatii.map((s) => (
              <li key={s} className="flex items-start gap-3 font-sans text-[0.88rem] leading-relaxed text-ink-soft">
                <span aria-hidden className="mt-[0.55em] h-1.5 w-1.5 shrink-0 bg-periwinkle" style={{ borderRadius: 9999 }} />
                {s}
              </li>
            ))}
          </ul>
          <Link
            href="/programari"
            tabIndex={deschis ? 0 : -1}
            className="group/link mt-5 inline-flex items-center gap-2 font-sans text-[0.86rem] text-periwinkle transition-colors hover:text-ink"
          >
            Programează o ședință
            <IconArrow className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </article>
  );
}

export function Services() {
  const harta = useRef<HTMLDivElement>(null);
  const [cale, setCale] = useState({ d: "", w: 0, h: 0 });
  const reduce = useReducedMotion();

  // Cât din fir e „cusut": urmează derularea, netezit ca să nu sară
  const { scrollYProgress } = useScroll({ target: harta, offset: ["start 72%", "end 72%"] });
  const progres = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  // Firul se calculează din pozițiile reale ale opririlor
  useLayoutEffect(() => {
    const el = harta.current;
    if (!el) return;
    const calculeaza = () => {
      const r = el.getBoundingClientRect();
      const puncte = Array.from(el.querySelectorAll<HTMLElement>("[data-oprire]")).map((o) => {
        const b = o.getBoundingClientRect();
        return { x: b.left - r.left + b.width / 2, y: b.top - r.top + b.height / 2 };
      });
      if (puncte.length < 2) return;
      const desktop = window.innerWidth >= 1024;
      // firul pornește puțin deasupra primei opriri, ca și cum ar veni de undeva
      const start = { x: puncte[0].x, y: Math.max(0, puncte[0].y - 90) };
      setCale({ d: traseu([start, ...puncte], desktop ? 140 : 22), w: r.width, h: r.height });
    };
    calculeaza();
    const ro = new ResizeObserver(calculeaza);
    ro.observe(el);
    window.addEventListener("resize", calculeaza);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", calculeaza);
    };
  }, []);

  return (
    <section id="servicii" className="grain relative overflow-hidden bg-cream-deep py-28 lg:py-36">
      <Lumina din="dreapta" />
      {/* Fundal de hartă: o rețea fină de puncte */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: "radial-gradient(rgba(110,133,103,0.22) 1px, transparent 1.2px)",
          backgroundSize: "26px 26px",
          maskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        {/* Antet */}
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="font-sans text-[0.78rem] tracking-[0.02em] text-sage">{SERVICES.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-4xl leading-tight text-ink sm:text-5xl lg:text-[3.4rem]">
              {SERVICES.title}
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="rule-soft mx-auto mt-7" />
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-7 font-sans text-[0.95rem] leading-[1.9] text-ink-soft">
              {SERVICES.subtitle} Fiecare drum e diferit, așa că alege-ți punctul de plecare.
            </p>
          </Reveal>
        </div>

        {/* Harta */}
        <div ref={harta} className="relative mt-20 lg:mt-24">
          {cale.d && (
            <svg
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-visible"
              width={cale.w}
              height={cale.h}
              viewBox={`0 0 ${cale.w} ${cale.h}`}
            >
              {/* Traseul întreg, punctat — ca pe hartă */}
              <path
                d={cale.d}
                fill="none"
                stroke="rgba(110,133,103,0.35)"
                strokeWidth={2}
                strokeDasharray="2 9"
                strokeLinecap="round"
              />
              {/* Firul „cusut" — umbra lui, ca să pară un șnur, nu o linie */}
              <motion.path
                d={cale.d}
                fill="none"
                stroke="rgba(54,60,69,0.12)"
                strokeWidth={7}
                strokeLinecap="round"
                style={{ pathLength: reduce ? 1 : progres, translateY: 2 }}
              />
              <motion.path
                d={cale.d}
                fill="none"
                stroke="rgb(110,133,103)"
                strokeWidth={3}
                strokeLinecap="round"
                style={{ pathLength: reduce ? 1 : progres }}
              />
            </svg>
          )}

          {/* Pe desktop rândurile se întrepătrund în zigzag — drumul e compact, ca pe o hartă */}
          <ol className="relative space-y-14 lg:space-y-0">
            {SERVICES.items.map((item, i) => {
              const stanga = i % 2 === 0;
              return (
                <li
                  key={item.number}
                  className={[
                    "grid grid-cols-[3.5rem_minmax(0,1fr)] items-start gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1fr)] lg:items-center lg:gap-0",
                    i > 0 ? "lg:-mt-28" : "",
                  ].join(" ")}
                >
                  {/* Oprirea — pe telefon în stânga, pe desktop la mijloc */}
                  <div className="flex justify-center pt-6 lg:col-start-2 lg:row-start-1 lg:pt-0">
                    <Oprire numar={item.number} />
                  </div>
                  <Reveal
                    direction={stanga ? "right" : "left"}
                    className={[
                      "lg:row-start-1",
                      stanga ? "lg:col-start-1 lg:pr-4" : "lg:col-start-3 lg:pl-4",
                    ].join(" ")}
                  >
                    <Card item={item} />
                  </Reveal>
                </li>
              );
            })}

            {/* Capătul drumului: primul pas */}
            <li className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-start gap-4 sm:gap-6 lg:grid-cols-1 lg:justify-items-center lg:gap-8 lg:pt-10">
              <div className="flex justify-center pt-6 lg:pt-0">
                <Oprire numar="✓" final />
              </div>
              <Reveal className="lg:max-w-2xl lg:text-center">
                <p className="font-sans text-[0.82rem] text-periwinkle">Primul pas</p>
                <h3 className="mt-2 font-display text-3xl text-ink sm:text-4xl">O discuție, fără nicio obligație</h3>
                <p className="mt-4 font-sans text-[0.95rem] leading-[1.85] text-ink-soft">
                  Nu trebuie să știi dinainte ce serviciu ți se potrivește. Îl alegem împreună, după
                  prima întâlnire.{" "}
                  <span className="text-ink">
                    {PRICE.standard} {PRICE.currency}:
                  </span>{" "}
                  {PRICE.note.charAt(0).toLowerCase() + PRICE.note.slice(1)}
                </p>
                <ActionButtons className="mt-8 lg:justify-center" />
              </Reveal>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
