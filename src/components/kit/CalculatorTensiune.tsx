"use client";

import { useState } from "react";

/* ----------------------------------------------------------------------------
   Calculatorul „Cât timp din viața voastră ia tensiunea?", după modelul
   calculatorului de pe kit.emthrive.ro. Cifrele sunt estimări simple, spuse
   deschis ca estimări: certuri pe săptămână × orele de tensiune de după.
   -------------------------------------------------------------------------- */

const nr = (n: number) => new Intl.NumberFormat("ro-RO").format(Math.round(n));

/** „3 zile”, dar „20 de zile” — acordul numeralului în română. */
function cate(n: number, unu: string, multe: string) {
  const v = Math.round(n);
  if (v === 1) return `1 ${unu}`;
  const r = v % 100;
  return `${nr(v)} ${v >= 20 && !(r >= 1 && r <= 19) ? "de " : ""}${multe}`;
}

function Cursor({
  eticheta,
  valoare,
  setValoare,
  min,
  max,
  pas = 1,
  afisare,
}: {
  eticheta: string;
  valoare: number;
  setValoare: (v: number) => void;
  min: number;
  max: number;
  pas?: number;
  afisare: string;
}) {
  const umplere = ((valoare - min) / (max - min)) * 100;
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-4">
        <span className="font-sans text-[0.9rem] text-cream/75">{eticheta}</span>
        <span className="shrink-0 font-display text-[1.35rem] text-cream">{afisare}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={pas}
        value={valoare}
        onChange={(e) => setValoare(Number(e.target.value))}
        className="kit-cursor mt-3 w-full"
        style={{ ["--umplere" as string]: `${umplere}%` }}
      />
    </label>
  );
}

export function CalculatorTensiune({ pretLei }: { pretLei: number }) {
  const [certuri, setCerturi] = useState(3);
  const [ore, setOre] = useState(6);
  const [ani, setAni] = useState(2);
  const [copii, setCopii] = useState(true);

  const orePeAn = certuri * 52 * ore;
  const zilePeAn = orePeAn / 24;
  // din orele în care ești treaz (16 pe zi)
  const procent = Math.min(100, (orePeAn / (16 * 365)) * 100);
  const totalZile = zilePeAn * ani;
  const certuriTotal = certuri * 52 * ani;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="glass-dark space-y-8 p-7 sm:p-9">
        <Cursor
          eticheta="Câte certuri sau momente tensionate aveți pe săptămână"
          valoare={certuri}
          setValoare={setCerturi}
          min={1}
          max={14}
          afisare={String(certuri)}
        />
        <Cursor
          eticheta="Cât durează tensiunea după una, până vă reveniți"
          valoare={ore}
          setValoare={setOre}
          min={1}
          max={48}
          afisare={ore === 1 ? "1 oră" : `${ore} ore`}
        />
        <Cursor
          eticheta="De cât timp durează situația"
          valoare={ani}
          setValoare={setAni}
          min={1}
          max={15}
          afisare={ani === 1 ? "1 an" : `${ani} ani`}
        />
        <div className="flex items-center justify-between gap-4">
          <span className="font-sans text-[0.9rem] text-cream/75">Sunt copii în casă</span>
          <div className="flex">
            {[
              [true, "Da"],
              [false, "Nu"],
            ].map(([v, t]) => (
              <button
                key={String(v)}
                type="button"
                onClick={() => setCopii(v as boolean)}
                aria-pressed={copii === v}
                className={[
                  "px-5 py-2 font-sans text-[0.85rem] transition-colors",
                  copii === v ? "bg-periwinkle-light text-ink" : "bg-cream/10 text-cream/70 hover:bg-cream/20",
                ].join(" ")}
              >
                {t as string}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between bg-cream p-7 sm:p-9">
        <div>
          <p className="font-sans text-[0.8rem] tracking-[0.02em] text-periwinkle">Timp trăit în tensiune, în fiecare an</p>
          <p className="mt-3 font-display text-[3.4rem] leading-none text-ink sm:text-[4rem]">
            {cate(zilePeAn, "zi", "zile")}
          </p>
          <p className="mt-3 font-sans text-[0.9rem] leading-relaxed text-ink-soft">
            Adică {cate(orePeAn, "oră", "ore")} pe an, cam <span className="text-ink">{nr(procent)}%</span> din timpul în care
            sunteți treji.
          </p>

          <div className="mt-6 space-y-3 border-t border-ink/10 pt-5">
            <p className="font-sans text-[0.92rem] leading-relaxed text-ink">
              În {ani === 1 ? "ultimul an" : `ultimii ${ani} ani`}:{" "}
              <span className="font-display text-[1.15rem]">{cate(totalZile, "zi", "zile")}</span> de tensiune.
            </p>
            {copii && (
              <p className="font-sans text-[0.92rem] leading-relaxed text-ink">
                Copiii au fost prin preajmă la aproximativ{" "}
                <span className="font-display text-[1.15rem]">{cate(certuriTotal, "ceartă", "certuri")}</span>. Nu divorțul îi
                afectează cel mai mult, ci conflictul prelungit dintre părinți.
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {["Oboseală", "Distanță", "Somn prost", ...(copii ? ["Copii în mijloc"] : []), "Singurătate în doi"].map(
              (t) => (
                <span key={t} className="bg-clay-pale px-3 py-1.5 font-sans text-[0.78rem] text-clay">
                  {t}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="mt-8 border-t border-ink/10 pt-5">
          <p className="font-sans text-[0.85rem] leading-relaxed text-ink-soft">
            Estimare orientativă, nu o măsurătoare. Primul pas ca lucrurile să se schimbe e să vezi clar ce se întâmplă.
            Kitul costă {pretLei} lei.
          </p>
          <a
            href="#test"
            className="mt-4 inline-flex w-full items-center justify-center bg-ink px-7 py-4 font-sans text-[0.93rem] text-cream transition-colors hover:bg-periwinkle"
          >
            Vezi cum stați, de fapt
          </a>
        </div>
      </div>
    </div>
  );
}
