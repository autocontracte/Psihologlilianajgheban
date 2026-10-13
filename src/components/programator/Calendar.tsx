"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, longDate, mondayOf } from "@/lib/programator/reguli";

/* Calendar propriu, în locul câmpului de dată al browserului (care arată
   diferit pe fiecare telefon și e greu de nimerit). */

const LUNI = [
  "ianuarie",
  "februarie",
  "martie",
  "aprilie",
  "mai",
  "iunie",
  "iulie",
  "august",
  "septembrie",
  "octombrie",
  "noiembrie",
  "decembrie",
];
const ZILE_SCURT = ["L", "Ma", "Mi", "J", "V", "S", "D"];

function shiftMonth(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
}

export function Calendar({
  value,
  onChange,
  today,
  min,
  max,
  wholeWeek = false,
}: {
  value: string;
  onChange: (date: string) => void;
  today: string;
  min?: string;
  max?: string;
  /** scoate în evidență toată săptămâna zilei alese (pentru saltul la o săptămână) */
  wholeWeek?: boolean;
}) {
  const [month, setMonth] = useState(value.slice(0, 7));
  const first = mondayOf(`${month}-01`);
  const days = Array.from({ length: 42 }, (_, i) => addDays(first, i));
  const [y, m] = month.split("-").map(Number);
  const weekStart = mondayOf(value);

  return (
    <div className="select-none">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Luna trecută"
          onClick={() => setMonth(shiftMonth(month, -1))}
          className="flex h-10 w-10 items-center justify-center border border-ink/15 bg-cream text-ink transition-colors hover:border-ink"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <strong className="font-display text-lg text-ink">
          {LUNI[m - 1]} {y}
        </strong>
        <button
          type="button"
          aria-label="Luna viitoare"
          onClick={() => setMonth(shiftMonth(month, 1))}
          className="flex h-10 w-10 items-center justify-center border border-ink/15 bg-cream text-ink transition-colors hover:border-ink"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center font-sans">
        {ZILE_SCURT.map((z) => (
          <span key={z} className="py-1 text-[0.75rem] font-semibold text-ink-muted">
            {z}
          </span>
        ))}
        {days.map((d) => {
          const off = (min && d < min) || (max && d > max);
          const on = d === value;
          const inWeek = wholeWeek && d >= weekStart && d <= addDays(weekStart, 6);
          const other = d.slice(0, 7) !== month;
          return (
            <button
              key={d}
              type="button"
              disabled={!!off}
              aria-pressed={on}
              aria-label={longDate(d)}
              onClick={() => onChange(d)}
              className={`h-10 text-[0.95rem] transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                on
                  ? "bg-periwinkle font-semibold text-cream"
                  : inWeek
                    ? "bg-periwinkle-pale text-ink"
                    : `hover:bg-periwinkle-pale ${other ? "text-ink-muted" : "text-ink"}`
              } ${d === today && !on ? "font-semibold underline decoration-2 underline-offset-4" : ""}`}
            >
              {Number(d.slice(8))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Ziua aleasă, cu săgeți pentru ziua dinainte / de după și calendar la apăsare. */
export function AlegeData({
  value,
  onChange,
  today,
  min,
  max,
  label,
}: {
  value: string;
  onChange: (date: string) => void;
  today: string;
  min?: string;
  max?: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const sageata =
    "flex h-12 w-12 shrink-0 items-center justify-center border border-ink/20 bg-cream-warm text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-30";
  const scurtatura = (d: string, text: string) =>
    (!min || d >= min) && (!max || d <= max) ? (
      <button
        type="button"
        onClick={() => {
          onChange(d);
          setOpen(false);
        }}
        className="border border-ink/20 bg-cream px-3 py-2 font-sans text-[0.88rem] text-ink transition-colors hover:border-ink"
      >
        {text}
      </button>
    ) : null;

  return (
    <div>
      <div className="flex items-stretch gap-1.5">
        <button
          type="button"
          aria-label="Ziua dinainte"
          disabled={!!min && value <= min}
          onClick={() => onChange(addDays(value, -1))}
          className={sageata}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label={`${label}: ${longDate(value)}. Deschide calendarul`}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className={`flex h-12 min-w-0 flex-1 items-center justify-center gap-2 border px-3 font-sans text-[1rem] transition-colors ${
            open ? "border-periwinkle bg-periwinkle-pale text-ink" : "border-ink/20 bg-cream-warm text-ink hover:border-ink"
          }`}
        >
          <CalendarDays className="h-4.5 w-4.5 shrink-0 text-periwinkle" />
          <span className="truncate font-semibold first-letter:uppercase">{longDate(value)}</span>
          {value === today && <span className="shrink-0 text-[0.82rem] text-ink-soft">azi</span>}
        </button>
        <button
          type="button"
          aria-label="Ziua următoare"
          disabled={!!max && value >= max}
          onClick={() => onChange(addDays(value, 1))}
          className={sageata}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <div className="mt-2 border border-ink/15 bg-cream-warm p-3">
          <Calendar
            value={value}
            today={today}
            min={min}
            max={max}
            onChange={(d) => {
              onChange(d);
              setOpen(false);
            }}
          />
          <div className="mt-3 flex gap-2">
            {scurtatura(today, "Azi")}
            {scurtatura(addDays(today, 1), "Mâine")}
          </div>
        </div>
      )}
    </div>
  );
}
