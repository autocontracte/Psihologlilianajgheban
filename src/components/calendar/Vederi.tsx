"use client";

import { useEffect, useMemo, useRef, type PointerEvent } from "react";
import { Plus, X } from "lucide-react";
import {
  LUNI_LUNGI,
  PAS,
  ZI_END,
  ZI_START,
  addDays,
  isoWeekday,
  longDate,
  minToTime,
  mondayOf,
  shortDate,
  type Ev,
  type LunaCal,
} from "@/lib/calendarTelefon";
import { STATUS_LABEL } from "@/lib/types";
import { acum, aleZilei, culoare, fundal, type Strat } from "./comun";

/* Vederile Zi, Săptămână, An și Program și foaia unei zile din vederea pe lună. */

function useSwipe(onSwipe: (dir: 1 | -1) => void) {
  const s = useRef<{ x: number; y: number } | null>(null);
  return {
    onPointerDown: (e: PointerEvent) => {
      if (e.pointerType !== "mouse") s.current = { x: e.clientX, y: e.clientY };
    },
    onPointerUp: (e: PointerEvent) => {
      const st = s.current;
      s.current = null;
      if (!st) return;
      const dx = e.clientX - st.x;
      const dy = e.clientY - st.y;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) onSwipe(dx < 0 ? 1 : -1);
    },
    onPointerCancel: () => (s.current = null),
  };
}

/* ------------------------------------------------------------ Un rând */

export function Rand({ e, onClick }: { e: Ev; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-stretch gap-3 rounded-[1rem] bg-cream-warm px-3 py-3 text-left transition-colors hover:bg-cream-deep"
    >
      <span className="w-1.5 shrink-0 rounded-full" style={{ background: culoare(e) }} />
      <span className="w-[4.6rem] shrink-0 font-sans text-[1rem] tabular-nums text-ink-soft">
        {e.allDay ? (
          "Toată ziua"
        ) : (
          <>
            {minToTime(e.start)}
            <br />
            {minToTime(e.end % (24 * 60))}
          </>
        )}
      </span>
      <span className="min-w-0 flex-1 font-sans">
        <span className="block truncate text-[1.15rem] font-semibold text-ink">{e.title}</span>
        <span className="block truncate text-[0.95rem] text-ink-soft">
          {e.kind === "prog"
            ? `${e.service} · ${e.format === "ONLINE" ? "online" : "cabinet"} · ${STATUS_LABEL[e.status].toLowerCase()}`
            : e.free
              ? "Google Calendar · liber"
              : "Google Calendar"}
        </span>
      </span>
    </button>
  );
}

/* --------------------------------------------- Foaia unei zile (lună) */

export function FoaieZi({
  data,
  date,
  ascunse,
  onClose,
  onEv,
  onAdd,
  onDay,
}: {
  data: LunaCal;
  date: string;
  ascunse: Strat[];
  onClose: () => void;
  onEv: (e: Ev) => void;
  onAdd: () => void;
  onDay: () => void;
}) {
  const list = aleZilei(data, date, ascunse);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/35 sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-label={longDate(date)}
        onClick={(e) => e.stopPropagation()}
        className="cal-foaie flex max-h-[80dvh] w-full max-w-lg flex-col rounded-t-[1.75rem] bg-cream pb-[max(1rem,env(safe-area-inset-bottom))] sm:rounded-[1.75rem]"
      >
        <div className="flex items-center justify-between px-5 pb-2 pt-5">
          <button type="button" onClick={onDay} className="text-left font-display text-[1.45rem] text-ink first-letter:uppercase hover:text-periwinkle">
            {longDate(date)}
          </button>
          <button type="button" onClick={onClose} aria-label="Închide" className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-cream-deep">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-3">
          {list.length === 0 && <p className="px-1 py-6 text-center font-sans text-[1.05rem] text-ink-muted">Nimic în ziua aceasta.</p>}
          {list.map((e) => (
            <Rand key={e.id} e={e} onClick={() => onEv(e)} />
          ))}
        </div>
        <div className="flex gap-2 px-4 pt-1">
          <button type="button" onClick={onDay} className="flex-1 rounded-full border border-ink/20 py-3.5 font-sans text-[1.05rem] font-semibold text-ink hover:border-ink">
            Vezi ziua pe ore
          </button>
          <button type="button" onClick={onAdd} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-periwinkle py-3.5 font-sans text-[1.05rem] font-semibold text-cream hover:bg-ink">
            <Plus className="h-5 w-5" />
            Adăugare
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------- Zi și Săptămână, pe ore */

type Asezat = { e: Ev; lane: number; lanes: number };

/** Evenimentele care se suprapun stau alăturat, pe „benzi". */
function aseaza(list: Ev[]): Asezat[] {
  const out: Asezat[] = [];
  let grup: Asezat[] = [];
  let capat = -1;
  const inchide = () => {
    const n = Math.max(1, ...grup.map((x) => x.lane + 1));
    for (const x of grup) x.lanes = n;
    out.push(...grup);
    grup = [];
  };
  for (const e of [...list].sort((a, b) => a.start - b.start || b.end - a.end)) {
    if (e.start >= capat && grup.length) inchide();
    const ocupate = new Set(grup.filter((x) => x.e.end > e.start).map((x) => x.lane));
    let lane = 0;
    while (ocupate.has(lane)) lane++;
    grup.push({ e, lane, lanes: 1 });
    capat = Math.max(capat, e.end);
  }
  if (grup.length) inchide();
  return out;
}

export function Ore({
  data,
  dates,
  ascunse,
  onEv,
  onNew,
  onSwipe,
  onDay,
}: {
  data: LunaCal;
  /** o zi (vederea Zi) sau șapte (Săptămână) */
  dates: string[];
  ascunse: Strat[];
  onEv: (e: Ev) => void;
  onNew: (date: string, start: number) => void;
  onSwipe: (dir: 1 | -1) => void;
  onDay: (date: string) => void;
}) {
  const swipe = useSwipe(onSwipe);
  const pas = dates.length > 1 ? 2.1 : 2.75; // rem pentru 30 de minute
  const rows = (ZI_END - ZI_START) / PAS;
  const pct = (m: number) => Math.max(0, Math.min(rows, (m - ZI_START) / PAS)) * pas;

  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // la deschidere, ziua de lucru (de la 9:00) e în față
    if (scroller.current) scroller.current.scrollTop = ((9 * 60 - ZI_START) / PAS) * pas * 16;
  }, [dates[0], pas]); // eslint-disable-line react-hooks/exhaustive-deps

  const zile = dates.map((d) => {
    const list = aleZilei(data, d, ascunse);
    return { date: d, toata: list.filter((e) => e.allDay), ore: aseaza(list.filter((e) => !e.allDay)) };
  });
  const areToata = zile.some((z) => z.toata.length);
  const now = acum();

  return (
    <div className="flex min-h-0 flex-1 flex-col pb-[5.5rem]" {...swipe}>
      {dates.length > 1 && (
        <div className="flex shrink-0 pl-[3.25rem] pr-2">
          {dates.map((d) => (
            <button key={d} type="button" onClick={() => onDay(d)} className="flex min-w-0 flex-1 flex-col items-center py-1.5 font-sans">
              <span className={`text-[0.85rem] font-semibold ${isoWeekday(d) === 7 ? "text-clay" : "text-ink-soft"}`}>
                {["L", "M", "M", "J", "V", "S", "D"][isoWeekday(d) - 1]}
              </span>
              <span
                className={`flex h-8 min-w-8 items-center justify-center rounded-[0.5rem] px-1 text-[1.05rem] font-semibold tabular-nums ${
                  d === data.today ? "bg-periwinkle text-cream" : "text-ink"
                }`}
              >
                {Number(d.slice(8))}
              </span>
            </button>
          ))}
        </div>
      )}
      {areToata && (
        <div className="flex shrink-0 gap-0 border-b border-ink/10 pb-1 pl-[3.25rem] pr-2">
          {zile.map((z) => (
            <div key={z.date} className="flex min-w-0 flex-1 flex-col gap-[2px] px-[1px]">
              {z.toata.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => onEv(e)}
                  className="truncate rounded-[0.4rem] px-1.5 py-0.5 text-left font-sans text-[0.82rem] font-semibold text-ink"
                  style={{ background: fundal(e, 45) }}
                >
                  {e.title}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto border-t border-ink/10">
        <div className="relative flex pr-2" style={{ height: `${rows * pas}rem` }}>
          <div className="w-[3.25rem] shrink-0">
            {Array.from({ length: rows / 2 }, (_, i) => (
              <div key={i} className="relative font-sans text-[0.85rem] tabular-nums text-ink-muted" style={{ height: `${2 * pas}rem` }}>
                <span className="absolute -top-2 right-2">{i === 0 ? "" : minToTime(ZI_START + i * 60)}</span>
              </div>
            ))}
          </div>
          {zile.map((z) => (
            <div key={z.date} className={`relative min-w-0 flex-1 border-l border-ink/10 ${isoWeekday(z.date) === 7 ? "bg-sage-pale/30" : ""}`}>
              {/* atingerea unei jumătăți de oră libere propune ceva nou de acolo */}
              {Array.from({ length: rows }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`${shortDate(z.date)}, ${minToTime(ZI_START + i * PAS)}`}
                  onClick={() => onNew(z.date, ZI_START + i * PAS)}
                  className={`block w-full hover:bg-periwinkle-pale/60 ${i % 2 ? "border-b border-ink/10" : "border-b border-dashed border-ink/5"}`}
                  style={{ height: `${pas}rem` }}
                />
              ))}
              {z.ore.map(({ e, lane, lanes }) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => onEv(e)}
                  className="absolute flex flex-col items-start overflow-hidden rounded-[0.55rem] border-l-4 px-1.5 py-0.5 text-left font-sans leading-tight text-ink"
                  style={{
                    top: `${pct(e.start)}rem`,
                    height: `calc(${Math.max(pct(e.end) - pct(e.start), pas * 0.8)}rem - 2px)`,
                    left: `calc(${(lane / lanes) * 100}% + 1px)`,
                    width: `calc(${100 / lanes}% - 2px)`,
                    borderColor: culoare(e),
                    background: fundal(e, 30),
                  }}
                >
                  <b className="block w-full truncate text-[0.88rem]">{e.title}</b>
                  {dates.length === 1 && (
                    <span className="block w-full truncate text-[0.8rem] tabular-nums text-ink-soft">
                      {minToTime(e.start)}–{minToTime(e.end % (24 * 60))}
                      {e.kind === "prog" ? ` · ${e.service}` : ""}
                    </span>
                  )}
                </button>
              ))}
              {z.date === data.today && now >= ZI_START && now < ZI_END && (
                <div className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-clay" style={{ top: `${pct(now)}rem` }}>
                  <span className="absolute -left-1.5 -top-[7px] h-3 w-3 rounded-full bg-clay" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- An */

export function An({
  year,
  today,
  onMonth,
  onSwipe,
}: {
  year: number;
  today: string;
  onMonth: (first: string) => void;
  onSwipe: (dir: 1 | -1) => void;
}) {
  const swipe = useSwipe(onSwipe);
  return (
    <div className="grid flex-1 grid-cols-2 content-start gap-x-4 gap-y-5 overflow-y-auto px-4 pb-10 pt-2 sm:grid-cols-3 lg:grid-cols-4" {...swipe}>
      {LUNI_LUNGI.map((nume, m) => {
        const first = `${year}-${String(m + 1).padStart(2, "0")}-01`;
        const start = mondayOf(first);
        const curent = today.slice(0, 7) === first.slice(0, 7);
        return (
          <button key={m} type="button" onClick={() => onMonth(first)} className="rounded-[1rem] p-2 text-left transition-colors hover:bg-cream-warm">
            <span className={`mb-1.5 block font-sans text-[1.15rem] font-semibold ${curent ? "text-periwinkle" : "text-ink"}`}>{nume}</span>
            <span className="grid grid-cols-7 gap-y-0.5">
              {Array.from({ length: 42 }, (_, i) => {
                const d = addDays(start, i);
                if (d.slice(0, 7) !== first.slice(0, 7)) return <span key={i} />;
                return (
                  <span
                    key={i}
                    className={`flex h-5 items-center justify-center rounded-[0.3rem] font-sans text-[0.72rem] tabular-nums ${
                      d === today ? "bg-periwinkle font-semibold text-cream" : isoWeekday(d) === 7 ? "text-clay" : "text-ink-soft"
                    }`}
                  >
                    {Number(d.slice(8))}
                  </span>
                );
              })}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------- Program */

export function Program({
  data,
  from,
  ascunse,
  onEv,
  onNext,
}: {
  data: LunaCal;
  from: string;
  ascunse: Strat[];
  onEv: (e: Ev) => void;
  onNext: () => void;
}) {
  const zile = useMemo(() => {
    const out: { date: string; list: Ev[] }[] = [];
    for (let d = from < data.start ? data.start : from; d <= data.end; d = addDays(d, 1)) {
      const list = aleZilei(data, d, ascunse);
      if (list.length) out.push({ date: d, list });
    }
    return out;
  }, [data, from, ascunse]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-28 pt-1">
      {zile.length === 0 && <p className="py-10 text-center font-sans text-[1.05rem] text-ink-muted">Nimic de aici până la sfârșitul lunii.</p>}
      {zile.map(({ date, list }) => (
        <section key={date} className="mb-4">
          <h2 className="sticky top-0 z-[1] bg-cream px-1 py-2 font-sans text-[1.05rem] font-semibold text-ink first-letter:uppercase">
            {date === data.today ? "Azi, " : ""}
            {longDate(date)}
          </h2>
          <div className="space-y-2">
            {list.map((e) => (
              <Rand key={e.id} e={e} onClick={() => onEv(e)} />
            ))}
          </div>
        </section>
      ))}
      <button type="button" onClick={onNext} className="mx-auto mt-2 block rounded-full border border-ink/20 px-6 py-3 font-sans text-[1rem] font-semibold text-ink hover:border-ink">
        Luna următoare →
      </button>
    </div>
  );
}
