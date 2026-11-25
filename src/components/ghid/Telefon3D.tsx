"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { CHESTIONARE, SCALA } from "@/lib/ghid/chestionare";
import { PARTI, PRET_PARTE_LEI } from "@/lib/ghid/parti";
import { Coperta } from "./Coperta";
import s from "./telefon3d.module.css";

/* ----------------------------------------------------------------------------
   Telefonul 3D din pagina ghidului. Ecranul arată, în buclă, drumul real al
   unui vizitator: întrebarea de deschidere, trei afirmații, rezultatul și
   partea recomandată. Bucla se oprește când telefonul nu e pe ecran, iar la
   „mișcare redusă” rămâne pe rezultat.
   -------------------------------------------------------------------------- */

const C = CHESTIONARE[0];
const P = PARTI[0];
const AFIRMATII = [
  { a: C.zone[0].afirmatii[0], ales: "4", nr: 1 },
  { a: C.zone[1].afirmatii[0], ales: "3", nr: 5 },
  { a: C.zone[1].afirmatii[2], ales: "4", nr: 7 },
];
const DURATE = [2800, 2300, 2300, 2300, 3600, 3800];
const ZONE = [
  { nume: C.zone[0].nume, pct: 63, culoare: "#b97a55" },
  { nume: C.zone[1].nume, pct: 56, culoare: "#b97a55" },
  { nume: C.zone[2].nume, pct: 38, culoare: "#a08b6f" },
];

export function Telefon3D({
  rotatieY = -18,
  rotatieX = 8,
  rotatieZ = 2,
  className = "",
}: {
  rotatieY?: number;
  rotatieX?: number;
  rotatieZ?: number;
  className?: string;
}) {
  const [scena, setScena] = useState(0);
  const [vizibil, setVizibil] = useState(false);
  const cutie = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setScena(4);
      return;
    }
    const obs = new IntersectionObserver(([e]) => setVizibil(e.isIntersecting), { threshold: 0.2 });
    if (cutie.current) obs.observe(cutie.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!vizibil) return;
    const t = setTimeout(() => setScena((x) => (x + 1) % DURATE.length), DURATE[scena]);
    return () => clearTimeout(t);
  }, [scena, vizibil]);

  const cl = (i: number) => `${s.scenaEcran} ${scena === i ? s.activ : ""}`;
  const rezultat = scena >= 4;

  return (
    <div ref={cutie} className={`${s.scena} ${className}`} aria-hidden>
      <div
        className={s.telefon}
        style={{ "--ry": `${rotatieY}deg`, "--rx": `${rotatieX}deg`, "--rz": `${rotatieZ}deg` } as CSSProperties}
      >
        <div className={s.ecran}>
          <div className={s.insula} />
          {/* bara de stare */}
          <div className="absolute inset-x-0 top-0 z-[2] flex items-center justify-between px-[9cqw] pt-[5.2cqw] font-sans text-ink" style={{ fontSize: "3.6cqw" }}>
            <span className="font-semibold">9:41</span>
            <span className="flex items-center gap-[1.4cqw]">
              <span className="flex items-end gap-[0.6cqw]">
                {[1, 2, 3, 4].map((h) => (
                  <span key={h} className="block w-[0.9cqw] bg-ink" style={{ height: `${h * 0.8 + 0.6}cqw` }} />
                ))}
              </span>
              <span className="block h-[2.4cqw] w-[5cqw] rounded-[0.6cqw] border border-ink/70 p-[0.3cqw]">
                <span className="block h-full w-[70%] rounded-[0.3cqw] bg-ink" />
              </span>
            </span>
          </div>

          {/* 0 · întrebarea de deschidere */}
          <div className={cl(0)}>
            <span className="self-start bg-periwinkle-pale px-[3cqw] py-[1.4cqw] font-sans text-periwinkle" style={{ fontSize: "3.4cqw" }}>
              Chestionar gratuit · Partea 1
            </span>
            <p className="mt-[6cqw] font-display leading-[1.12] text-ink" style={{ fontSize: "8.6cqw" }}>
              {C.carlig}
            </p>
            <p className="mt-[4cqw] font-sans leading-relaxed text-ink-soft" style={{ fontSize: "3.9cqw" }}>
              Afli dacă ești în pragul despărțirii sau ce poți face ca să nu ajungi acolo.
            </p>
            <div className="mt-auto space-y-[2.4cqw]">
              {["În jur de 5 minute", "Rezultat imediat", "Fără cont"].map((t) => (
                <p key={t} className="flex items-center gap-[2cqw] font-sans text-ink" style={{ fontSize: "3.6cqw" }}>
                  <span className="block h-[1.6cqw] w-[1.6cqw] bg-periwinkle" />
                  {t}
                </p>
              ))}
              <div className="mt-[4cqw] bg-periwinkle py-[4cqw] text-center font-sans text-cream" style={{ fontSize: "4.2cqw" }}>
                Începe chestionarul
              </div>
            </div>
          </div>

          {/* 1–3 · afirmațiile */}
          {AFIRMATII.map((x, i) => (
            <div key={x.a.id} className={cl(i + 1)}>
              <div className="flex items-center gap-[2.4cqw]">
                <div className="h-[1cqw] flex-1 bg-cream-deep">
                  <div className="h-full bg-periwinkle" style={{ width: `${((x.nr + 3) / 16) * 100}%` }} />
                </div>
                <span className="font-sans text-ink-muted" style={{ fontSize: "3.1cqw" }}>
                  {x.nr} / 12
                </span>
              </div>
              <p className="mt-[7cqw] font-sans text-ink-muted" style={{ fontSize: "3.3cqw" }}>
                Cât de adevărat e pentru tine?
              </p>
              <p className="mt-[2cqw] font-display leading-[1.2] text-ink" style={{ fontSize: "6.6cqw" }}>
                {x.a.text}
              </p>
              <div className="relative mt-auto space-y-[2cqw]">
                {SCALA.map((o) => {
                  const ales = scena === i + 1 && o.valoare === x.ales;
                  return (
                    <div
                      key={o.valoare}
                      className={`relative flex items-center gap-[3cqw] border px-[3.4cqw] py-[2.5cqw] font-sans transition-colors duration-500 ${
                        ales ? "border-periwinkle bg-periwinkle text-cream delay-700" : "border-ink/15 bg-cream text-ink-soft"
                      }`}
                      style={{ fontSize: "3.7cqw" }}
                    >
                      <span
                        className={`flex h-[5.6cqw] w-[5.6cqw] items-center justify-center font-display transition-colors duration-500 ${
                          ales ? "bg-cream text-periwinkle delay-700" : "bg-periwinkle-pale text-periwinkle"
                        }`}
                      >
                        {o.valoare}
                      </span>
                      {o.eticheta}
                      {ales && <span className={s.atingere} style={{ left: "78%", top: "50%" }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* 4 · rezultatul */}
          <div className={cl(4)}>
            <p className="font-sans text-periwinkle" style={{ fontSize: "3.4cqw" }}>
              Rezultatul tău
            </p>
            <div className="mt-[5cqw] flex items-center gap-[5cqw]">
              <div className="relative h-[28cqw] w-[28cqw] shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#e9ebe1" strokeWidth="9" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#b97a55"
                    strokeWidth="9"
                    strokeDasharray="264"
                    strokeDashoffset={rezultat ? 264 * (1 - 0.52) : 264}
                    style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1) 0.3s" }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-display text-ink" style={{ fontSize: "8.5cqw" }}>
                  52
                </span>
              </div>
              <div>
                <p className="font-sans uppercase tracking-[0.08em] text-ink-muted" style={{ fontSize: "2.7cqw" }}>
                  Cât de greu e acum
                </p>
                <p className="mt-[1.5cqw] font-display leading-tight text-ink" style={{ fontSize: "5.4cqw" }}>
                  Sub presiune
                </p>
              </div>
            </div>
            <p className="mt-[5cqw] font-display leading-snug text-ink" style={{ fontSize: "5cqw" }}>
              {C.niveluri.presiune.titlu}
            </p>
            <div className="mt-auto space-y-[4cqw]">
              {ZONE.map((z, i) => (
                <div key={z.nume}>
                  <div className="flex justify-between font-sans text-ink" style={{ fontSize: "3.4cqw" }}>
                    <span>{z.nume}</span>
                    <span style={{ color: z.culoare }}>{z.pct}</span>
                  </div>
                  <div className="mt-[1.4cqw] h-[1.6cqw] bg-cream-deep">
                    <div
                      className={`h-full ${s.bara}`}
                      style={{ width: rezultat ? `${z.pct}%` : "0%", background: z.culoare, transitionDelay: `${0.4 + i * 0.15}s` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5 · partea recomandată */}
          <div className={cl(5)}>
            <p className="font-sans text-sage" style={{ fontSize: "3.3cqw" }}>
              Recomandată pentru tine
            </p>
            <div className="mx-auto mt-[5cqw] w-[56cqw] shadow-[0_18px_30px_-14px_rgba(30,35,30,0.6)]" style={{ aspectRatio: "0.72" }}>
              <Coperta parte={P} />
            </div>
            <p className="mt-[5cqw] text-center font-display text-ink" style={{ fontSize: "5.6cqw" }}>
              Partea 1: {P.titlu}
            </p>
            <p className="mt-[1.5cqw] text-center font-sans text-ink-soft" style={{ fontSize: "3.3cqw" }}>
              Raport personal + {P.pagini} de pagini din ghid
            </p>
            <div className="mt-auto bg-periwinkle py-[4cqw] text-center font-sans text-cream" style={{ fontSize: "4.1cqw" }}>
              Obține partea 1 · {PRET_PARTE_LEI} lei
            </div>
          </div>

          <div className={s.luciu} />
        </div>
      </div>
    </div>
  );
}
