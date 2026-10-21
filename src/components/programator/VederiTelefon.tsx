"use client";

import { useEffect, useMemo, useRef, type PointerEvent } from "react";
import { Plus, X } from "lucide-react";
import {
  DAY_END,
  DAY_START,
  LUNI_LUNGI,
  ROWS,
  STEP,
  addDays,
  isoWeekday,
  longDate,
  minToTime,
  mondayOf,
  type Month,
  type Reservation,
  type Room,
} from "@/lib/programator/reguli";
import { aleProprietarului, aleZilei, bara, cabScurt, type Ascunse } from "./telefon";

/* Vederile An, Zi și Program și foaia unei zile din vederea pe lună. */

/* ---------------------------------------------------------------- Un rând */

function Programare({ r, data, onClick }: { r: Reservation; data: Month; onClick: () => void }) {
  const p = data.people.find((x) => x.id === r.personId);
  const room = data.rooms.find((x) => x.id === r.roomId);
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-stretch gap-3 rounded-[1rem] bg-cream-warm px-3 py-3 text-left transition-colors hover:bg-cream-deep"
    >
      <span className="w-1.5 shrink-0 rounded-full" style={{ background: bara(p?.color) }} />
      <span className="w-[4.6rem] shrink-0 font-sans text-[1rem] tabular-nums text-ink-soft">
        {minToTime(r.start)}
        <br />
        {minToTime(r.end)}
      </span>
      <span className="min-w-0 flex-1 font-sans">
        <span className={`block truncate text-[1.15rem] font-semibold text-ink ${r.cancelledAt ? "line-through opacity-60" : ""}`}>
          {p?.name}
        </span>
        <span className="block truncate text-[0.95rem] text-ink-soft">
          {room?.name}
          {r.cancelledAt ? ` · anulată, se plătește ${r.cancelFee}%` : ""}
          {r.note ? ` · ${r.note}` : ""}
        </span>
      </span>
    </button>
  );
}

/* --------------------------------------------------- Foaia unei zile (lună) */

export function FoaieZi({
  data,
  date,
  ascunse,
  onClose,
  onEdit,
  onAdd,
  onDay,
}: {
  data: Month;
  date: string;
  ascunse: Ascunse;
  onClose: () => void;
  onEdit: (r: Reservation) => void;
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
        className="prog-foaie flex max-h-[80dvh] w-full max-w-lg flex-col rounded-t-[1.75rem] bg-cream pb-[max(1rem,env(safe-area-inset-bottom))] sm:rounded-[1.75rem]"
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
          {list.length === 0 && <p className="px-1 py-6 text-center font-sans text-[1.05rem] text-ink-muted">Nicio programare în ziua aceasta.</p>}
          {list.map((r) => (
            <Programare key={r.id} r={r} data={data} onClick={() => onEdit(r)} />
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

/* ------------------------------------------------------------------- Swipe */

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

/* --------------------------------------------------------------------- An */

export function VedereAn({
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
                const azi = d === today;
                return (
                  <span
                    key={i}
                    className={`flex h-5 items-center justify-center rounded-[0.3rem] font-sans text-[0.72rem] tabular-nums ${
                      azi ? "bg-periwinkle font-semibold text-cream" : isoWeekday(d) === 7 ? "text-clay" : "text-ink-soft"
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

/* --------------------------------------------------------------------- Zi */

export function VedereZi({
  data,
  date,
  ascunse,
  onEdit,
  onNew,
  onOwner,
  onSwipe,
}: {
  data: Month;
  date: string;
  ascunse: Ascunse;
  onEdit: (r: Reservation) => void;
  onNew: (room: Room, start: number) => void;
  onOwner: (room: Room, from: number) => void;
  onSwipe: (dir: 1 | -1) => void;
}) {
  const swipe = useSwipe(onSwipe);
  const rooms = data.rooms.filter((r) => !ascunse.rooms.includes(r.id));
  const list = aleZilei(data, date, ascunse);
  const people = useMemo(() => new Map(data.people.map((p) => [p.id, p])), [data.people]);
  const pas = 2.75; // rem pentru 30 de minute
  const top = (m: number) => `${((m - DAY_START) / STEP) * pas}rem`;
  const inalt = (a: number, b: number) => `calc(${((b - a) / STEP) * pas}rem - 3px)`;

  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // la schimbarea zilei, de la începutul programului
    if (scroller.current) scroller.current.scrollTop = 0;
  }, [date]);

  return (
    <div className="flex min-h-0 flex-1 flex-col pb-[5.5rem]" {...swipe}>
      <div className="flex shrink-0 border-b border-ink/10 pl-[3.25rem] pr-2">
        {rooms.map((r) => (
          <div key={r.id} className="min-w-0 flex-1 truncate py-2 text-center font-sans text-[1rem] font-semibold text-ink">
            <span className="sm:hidden">{cabScurt(r)}</span>
            <span className="hidden sm:inline">{r.name}</span>
          </div>
        ))}
      </div>
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto">
        <div className="relative flex pr-2" style={{ height: `${ROWS * pas}rem` }}>
          <div className="w-[3.25rem] shrink-0">
            {Array.from({ length: ROWS / 2 }, (_, i) => (
              <div key={i} className="relative font-sans text-[0.85rem] tabular-nums text-ink-muted" style={{ height: `${2 * pas}rem` }}>
                <span className="absolute -top-2 right-2">{i === 0 ? "" : minToTime(DAY_START + i * 60)}</span>
              </div>
            ))}
          </div>
          {rooms.map((room) => {
            const segs = aleProprietarului(data, room, date);
            const owner = people.get(room.ownerId ?? "");
            return (
              <div key={room.id} className="prog-zi-col relative min-w-0 flex-1 border-l border-ink/10">
                {/* atingerea unei jumătăți de oră libere propune o rezervare de acolo */}
                {Array.from({ length: ROWS }, (_, i) => {
                  const m = DAY_START + i * STEP;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={`${room.name}, ${minToTime(m)}`}
                      onClick={() => onNew(room, m)}
                      className={`block w-full border-ink/10 hover:bg-periwinkle-pale/60 ${i % 2 ? "border-b" : "border-b border-dashed border-b-ink/5"}`}
                      style={{ height: `${pas}rem` }}
                    />
                  );
                })}
                {segs.map((s) => (
                  <button
                    key={s.start}
                    type="button"
                    onClick={() => onOwner(room, s.start)}
                    className="prog-zi-prop absolute inset-x-[2px] flex items-start overflow-hidden rounded-[0.6rem] px-1.5 py-1 text-left font-sans text-[0.85rem] font-semibold text-ink"
                    style={{ top: top(s.start), height: inalt(s.start, s.end), "--c": bara(owner?.color) } as React.CSSProperties}
                  >
                    {owner?.name.split(/\s+/)[0]}
                  </button>
                ))}
                {list
                  .filter((r) => r.roomId === room.id)
                  .map((r) => {
                    const p = people.get(r.personId);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => onEdit(r)}
                        className={`absolute inset-x-[2px] flex flex-col items-start overflow-hidden rounded-[0.6rem] border-l-4 px-1.5 py-1 text-left font-sans leading-tight text-ink ${r.cancelledAt ? "opacity-50" : ""}`}
                        style={{
                          top: top(r.start),
                          height: inalt(r.start, r.end),
                          borderColor: bara(p?.color),
                          background: `color-mix(in srgb, ${p?.color ?? "#ddd"} 55%, white)`,
                        }}
                      >
                        <b className={`block w-full truncate text-[0.92rem] ${r.cancelledAt ? "line-through" : ""}`}>{p?.name.split(/\s+/)[0]}</b>
                        <span className="block w-full truncate text-[0.8rem] tabular-nums text-ink-soft">
                          {minToTime(r.start)}–{minToTime(r.end)}
                        </span>
                      </button>
                    );
                  })}
              </div>
            );
          })}
          {date === data.today && <AcumLinie pas={pas} />}
        </div>
      </div>
    </div>
  );
}

function AcumLinie({ pas }: { pas: number }) {
  const [h, m] = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Bucharest", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .format(new Date())
    .split(":")
    .map(Number);
  const now = h * 60 + m;
  if (now < DAY_START || now >= DAY_END) return null;
  return (
    <div className="pointer-events-none absolute left-[3.25rem] right-2 z-10 border-t-2 border-clay" style={{ top: `${((now - DAY_START) / STEP) * pas}rem` }}>
      <span className="absolute -left-1.5 -top-[7px] h-3 w-3 rounded-full bg-clay" />
    </div>
  );
}

/* ---------------------------------------------------------------- Program */

export function VedereProgram({
  data,
  from,
  ascunse,
  onEdit,
  onNext,
}: {
  data: Month;
  from: string;
  ascunse: Ascunse;
  onEdit: (r: Reservation) => void;
  onNext: () => void;
}) {
  const zile = useMemo(() => {
    const out: { date: string; list: Reservation[] }[] = [];
    for (let d = from < data.start ? data.start : from; d <= data.end; d = addDays(d, 1)) {
      const list = aleZilei(data, d, ascunse);
      if (list.length) out.push({ date: d, list });
    }
    return out;
  }, [data, from, ascunse]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-28 pt-1">
      {zile.length === 0 && <p className="py-10 text-center font-sans text-[1.05rem] text-ink-muted">Nicio programare de aici până la sfârșitul lunii.</p>}
      {zile.map(({ date, list }) => (
        <section key={date} className="mb-4">
          <h2 className="sticky top-0 z-[1] bg-cream px-1 py-2 font-sans text-[1.05rem] font-semibold text-ink first-letter:uppercase">
            {date === data.today ? "Azi, " : ""}
            {longDate(date)}
          </h2>
          <div className="space-y-2">
            {list.map((r) => (
              <Programare key={r.id} r={r} data={data} onClick={() => onEdit(r)} />
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
