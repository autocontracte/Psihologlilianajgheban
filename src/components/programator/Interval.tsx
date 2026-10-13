"use client";

import { useRef, useState, type PointerEvent } from "react";
import { ArrowRight, CircleAlert, CircleCheck, Minus, Plus } from "lucide-react";
import { DAY_END, DAY_START, STEP, minToTime } from "@/lib/programator/reguli";

/* Alegerea orelor: bara zilei, cu ce e deja ocupat în cabinet și cu intervalul
   ales (se poate trage de el sau de capete), plus butoane mari −/+ și durate
   gata făcute, pentru cine nu vrea să tragă. Spune pe loc dacă intervalul e
   liber sau peste cine se suprapune. */

export type Busy = { a: number; b: number; label: string; color: string };

const TOTAL = DAY_END - DAY_START;
const pct = (m: number) => `${((m - DAY_START) / TOTAL) * 100}%`;
const DURATE: [number, string][] = [
  [30, "30 min"],
  [60, "1 h"],
  [90, "1 h 30"],
  [120, "2 h"],
  [180, "3 h"],
];

export function durata(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return [h ? `${h} h` : "", m ? `${m} min` : ""].filter(Boolean).join(" ");
}

export function clashOf(busy: Busy[], a: number, b: number): Busy | null {
  return busy.find((x) => a < x.b && b > x.a) ?? null;
}

export function Interval({
  start,
  end,
  onChange,
  busy,
  problem,
}: {
  start: number;
  end: number;
  onChange: (start: number, end: number) => void;
  /** ce e ocupat în cabinetul și ziua alese */
  busy: Busy[];
  /** altă piedică decât cabinetul ocupat (de ex. omul e în alt cabinet la ora aceea) */
  problem?: string | null;
}) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ mode: "a" | "b" | "move"; a0: number; b0: number; x0: number } | null>(null);
  const cur = useRef({ start, end });
  cur.current = { start, end };
  const [list, setList] = useState<"a" | "b" | null>(null);

  const clash = clashOf(busy, start, end);
  const bad = !!clash || !!problem;

  function set(a: number, b: number) {
    a = Math.max(DAY_START, Math.min(DAY_END - STEP, a));
    b = Math.max(a + STEP, Math.min(DAY_END, b));
    if (a !== cur.current.start || b !== cur.current.end) onChange(a, b);
  }

  /** Mută începutul păstrând durata. */
  function moveStart(a: number) {
    const d = cur.current.end - cur.current.start;
    a = Math.max(DAY_START, Math.min(DAY_END - d, a));
    set(a, a + d);
  }

  const snap = (v: number) => Math.round(v / STEP) * STEP;

  function minAt(clientX: number): number {
    const r = track.current!.getBoundingClientRect();
    return DAY_START + Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * TOTAL;
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const handle = target.dataset.h as "a" | "b" | undefined;
    const x0 = minAt(e.clientX);
    let { start: a0, end: b0 } = cur.current;
    let mode: "a" | "b" | "move" = handle ?? "move";
    if (!handle && !target.closest(".prog-tr-sel")) {
      // un clic pe bară aduce intervalul acolo
      const d = b0 - a0;
      a0 = Math.max(DAY_START, Math.min(DAY_END - d, snap(x0 - d / 2)));
      b0 = a0 + d;
      set(a0, b0);
    }
    if (!handle) mode = "move";
    drag.current = { mode, a0, b0, x0 };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // fără captură, tragerea merge cât timp cursorul rămâne deasupra
    }
    e.preventDefault();
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    const x = minAt(e.clientX);
    if (d.mode === "a") set(Math.min(snap(x), cur.current.end - STEP), cur.current.end);
    else if (d.mode === "b") set(cur.current.start, Math.max(snap(x), cur.current.start + STEP));
    else {
      const len = d.b0 - d.a0;
      const a = Math.max(DAY_START, Math.min(DAY_END - len, d.a0 + snap(x - d.x0)));
      set(a, a + len);
    }
  }

  function onPointerUp() {
    drag.current = null;
  }

  // prima rezervare de după început: până acolo se poate întinde intervalul
  const nextBusy = busy.reduce((n, x) => (x.a >= start && x.a < n ? x.a : n), DAY_END);

  const pas = (key: "a" | "b", dir: 1 | -1) =>
    key === "a" ? moveStart(start + dir * STEP) : set(start, Math.max(start + STEP, end + dir * STEP));

  const stepper = (key: "a" | "b", label: string) => {
    const value = key === "a" ? start : end;
    const atMin = key === "a" ? start <= DAY_START : end <= start + STEP;
    const atMax = key === "a" ? end >= DAY_END : end >= DAY_END;
    const buton =
      "flex h-12 w-11 shrink-0 items-center justify-center border border-ink/20 bg-cream-warm text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink/20 disabled:hover:bg-cream-warm disabled:hover:text-ink";
    return (
      <div className="min-w-0">
        <span className="mb-1.5 block font-sans text-[0.78rem] font-semibold text-ink-soft">{label}</span>
        <div className="flex">
          <button type="button" aria-label={`${label}: mai devreme`} disabled={atMin} onClick={() => pas(key, -1)} className={buton}>
            <Minus className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label={`${label}: ${minToTime(value)}. Alege din listă`}
            aria-expanded={list === key}
            onClick={() => setList(list === key ? null : key)}
            className={`h-12 min-w-0 flex-1 border-y px-1 font-sans text-[1.2rem] font-semibold tabular-nums transition-colors ${
              list === key ? "border-periwinkle bg-periwinkle-pale text-ink" : "border-ink/20 bg-cream text-ink hover:bg-periwinkle-pale"
            }`}
          >
            {minToTime(value)}
          </button>
          <button type="button" aria-label={`${label}: mai târziu`} disabled={atMax} onClick={() => pas(key, 1)} className={buton}>
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  // lista de ore: pentru început, orele ocupate; pentru sfârșit, cele care ar trece peste altă rezervare
  const ore: number[] = [];
  if (list === "a") for (let m = DAY_START; m < DAY_END; m += STEP) ore.push(m);
  if (list === "b") for (let m = start + STEP; m <= DAY_END; m += STEP) ore.push(m);
  const ocupat = (m: number) =>
    list === "a" ? busy.some((x) => m >= x.a && m < x.b) : !!clashOf(busy, start, m);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="font-display text-[1.9rem] leading-none text-ink tabular-nums">
          {minToTime(start)}
          <span className="mx-1 text-ink-muted">–</span>
          {minToTime(end)}
          <small className="ml-2.5 font-sans text-[0.9rem] text-ink-soft">{durata(end - start)}</small>
        </p>
        <p
          role="status"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 font-sans text-[0.9rem] font-semibold ${
            bad ? "bg-clay-pale text-clay" : "bg-periwinkle-pale text-periwinkle"
          }`}
        >
          {bad ? <CircleAlert className="h-4.5 w-4.5 shrink-0" /> : <CircleCheck className="h-4.5 w-4.5 shrink-0" />}
          {clash
            ? `Ocupat: ${clash.label}, ${minToTime(clash.a)}–${minToTime(clash.b)}`
            : (problem ?? (busy.length ? "Intervalul e liber" : "Toată ziua e liberă"))}
        </p>
      </div>

      {/* Bara zilei */}
      <div>
        <div
          ref={track}
          className="prog-tr-track"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {busy.map((x, i) => (
            <span
              key={i}
              className="prog-tr-blk"
              title={`${x.label} · ${minToTime(x.a)}–${minToTime(x.b)}`}
              style={{ left: pct(x.a), width: `${((x.b - x.a) / TOTAL) * 100}%`, "--c": x.color } as React.CSSProperties}
            >
              <em>{x.label}</em>
            </span>
          ))}
          <div
            className="prog-tr-sel"
            data-rau={bad ? "" : undefined}
            style={{ left: pct(start), width: `${((end - start) / TOTAL) * 100}%` }}
          >
            <span className="prog-tr-h" data-h="a" />
            <span className="prog-tr-h" data-h="b" />
          </div>
        </div>
        <div className="prog-tr-ticks" aria-hidden>
          {Array.from({ length: TOTAL / 60 + 1 }, (_, i) => DAY_START + i * 60).map((m) => (
            <span key={m} style={{ left: pct(m) }} data-impar={(m / 60) % 2 ? "" : undefined}>
              {m / 60}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        {stepper("a", "De la")}
        <ArrowRight className="mb-3.5 h-5 w-5 text-ink-muted" />
        {stepper("b", "Până la")}
      </div>

      {list && (
        <div className="border border-ink/15 bg-cream-warm p-2">
          <div className="grid grid-cols-4 gap-1 sm:grid-cols-7">
            {ore.map((m) => {
              const on = m === (list === "a" ? start : end);
              const off = ocupat(m);
              return (
                <button
                  key={m}
                  type="button"
                  disabled={off}
                  aria-pressed={on}
                  onClick={() => {
                    if (list === "a") moveStart(m);
                    else set(start, m);
                    setList(null);
                  }}
                  className={`h-10 font-sans text-[0.95rem] tabular-nums transition-colors disabled:cursor-not-allowed ${
                    on
                      ? "bg-periwinkle font-semibold text-cream"
                      : off
                        ? "bg-ink/5 text-ink-muted line-through"
                        : "bg-cream text-ink hover:bg-periwinkle-pale"
                  }`}
                >
                  {minToTime(m)}
                </button>
              );
            })}
          </div>
          {ore.some(ocupat) && (
            <p className="mt-2 px-1 font-sans text-[0.8rem] text-ink-muted">Orele tăiate sunt ocupate.</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {DURATE.map(([d, text]) => (
          <button
            key={d}
            type="button"
            aria-pressed={end - start === d}
            disabled={start + d > DAY_END}
            onClick={() => set(start, start + d)}
            className={`border px-3 py-2 font-sans text-[0.88rem] transition-colors disabled:opacity-30 ${
              end - start === d ? "border-periwinkle bg-periwinkle text-cream" : "border-ink/20 bg-cream-warm text-ink hover:border-ink"
            }`}
          >
            {text}
          </button>
        ))}
        {nextBusy > start + STEP && nextBusy !== end && (
          <button
            type="button"
            onClick={() => set(start, nextBusy)}
            className="border border-ink/20 bg-cream-warm px-3 py-2 font-sans text-[0.88rem] text-ink transition-colors hover:border-ink"
          >
            {nextBusy === DAY_END ? `Până la închidere (${minToTime(DAY_END)})` : `Până la ${minToTime(nextBusy)}`}
          </button>
        )}
      </div>
    </div>
  );
}
