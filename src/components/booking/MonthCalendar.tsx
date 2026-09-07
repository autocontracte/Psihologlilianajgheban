"use client";

import { useMemo, useState } from "react";
import { IconArrow } from "../ui/Icons";

export type DayInfo = { date: string; free: number; closed: boolean };

const ZILE = ["L", "M", "M", "J", "V", "S", "D"];

/** Ziua săptămânii pentru "YYYY-MM-DD", cu luni pe prima poziție. */
function coloana(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

function numeLuna(luna: string): string {
  const [y, m] = luna.split("-").map(Number);
  const text = new Intl.DateTimeFormat("ro-RO", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, 1)));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Zilele grupate pe luni, pentru cine vrea să se programeze peste câteva
 * săptămâni. Banda orizontală e bună pentru „săptămâna asta"; pentru mai
 * departe, un calendar se citește mult mai repede.
 */
export function MonthCalendar({
  days,
  selected,
  onPick,
}: {
  days: DayInfo[];
  selected: string;
  onPick: (date: string) => void;
}) {
  const luni = useMemo(() => {
    const grupe = new Map<string, DayInfo[]>();
    for (const d of days) {
      const luna = d.date.slice(0, 7);
      if (!grupe.has(luna)) grupe.set(luna, []);
      grupe.get(luna)!.push(d);
    }
    return [...grupe.entries()];
  }, [days]);

  const [index, setIndex] = useState(0);
  const curenta = luni[index];

  if (!curenta) return null;

  const [luna, zile] = curenta;
  const gol = coloana(zile[0].date);

  return (
    <div className="border border-ink/12 bg-cream-warm p-5">
      {/* Navigarea între luni */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          aria-label="Luna anterioară"
          className="flex h-9 w-9 items-center justify-center border border-ink/20 text-ink transition-colors hover:border-periwinkle hover:bg-periwinkle hover:text-cream disabled:opacity-30 disabled:hover:border-ink/20 disabled:hover:bg-transparent disabled:hover:text-ink"
        >
          <IconArrow className="h-4 w-4" style={{ transform: "rotate(180deg)" }} />
        </button>

        <span className="font-display text-[1.15rem] text-ink">
          {numeLuna(luna)}
        </span>

        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(luni.length - 1, i + 1))}
          disabled={index === luni.length - 1}
          aria-label="Luna următoare"
          className="flex h-9 w-9 items-center justify-center border border-ink/20 text-ink transition-colors hover:border-periwinkle hover:bg-periwinkle hover:text-cream disabled:opacity-30 disabled:hover:border-ink/20 disabled:hover:bg-transparent disabled:hover:text-ink"
        >
          <IconArrow className="h-4 w-4" />
        </button>
      </div>

      {/* Capul de tabel */}
      <div className="mt-5 grid grid-cols-7 gap-1">
        {ZILE.map((z, i) => (
          <span
            key={i}
            className="pb-2 text-center font-sans text-[0.75rem] text-ink-muted"
          >
            {z}
          </span>
        ))}

        {/* Casete goale până în ziua în care începe luna */}
        {Array.from({ length: gol }).map((_, i) => (
          <span key={`gol-${i}`} />
        ))}

        {zile.map((d) => {
          const zi = Number(d.date.slice(8));
          const liber = !d.closed && d.free > 0;
          const ales = selected === d.date;

          return (
            <button
              key={d.date}
              type="button"
              disabled={!liber}
              onClick={() => onPick(d.date)}
              aria-label={`${zi} ${numeLuna(luna)}${liber ? `, ${d.free} intervale libere` : ", indisponibil"}`}
              className={[
                "flex aspect-square flex-col items-center justify-center border transition-colors duration-200",
                ales
                  ? "border-periwinkle bg-periwinkle text-cream"
                  : liber
                    ? "border-ink/12 bg-cream text-ink hover:border-periwinkle"
                    : "cursor-not-allowed border-transparent text-ink-muted/40",
              ].join(" ")}
            >
              <span className="font-sans text-[0.95rem]">{zi}</span>
              {/* Un punct arată că ziua are locuri, fără să încarce caseta */}
              {liber && !ales && (
                <span className="mt-0.5 h-1 w-1 bg-periwinkle" />
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-4 font-sans text-[0.8rem] text-ink-muted">
        Zilele cu punct au intervale libere.
      </p>
    </div>
  );
}
