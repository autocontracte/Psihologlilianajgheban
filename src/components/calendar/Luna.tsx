"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { addDays, minToTime, type LunaCal } from "@/lib/calendarTelefon";
import { aleZilei, culoare, fundal, prenume, type Strat } from "./comun";

/* Vederea pe lună, ca în calendarul telefonului: 6 săptămâni, în fiecare zi
   evenimentele ca bare colorate, câte încap, apoi „+N". Un atac alege ziua,
   al doilea o deschide. Glisarea stânga–dreapta schimbă luna. */

const ZILE = ["L", "M", "M", "J", "V", "S", "D"];
const RAND = 21; // înălțimea unei bare, în pixeli
const CAP = 30; // numărul zilei, deasupra barelor

export function Luna({
  data,
  selected,
  ascunse,
  onSelect,
  onOpen,
  onSwipe,
}: {
  data: LunaCal;
  selected: string;
  ascunse: Strat[];
  onSelect: (date: string) => void;
  /** al doilea atac pe ziua aleasă */
  onOpen: (date: string) => void;
  onSwipe: (dir: 1 | -1) => void;
}) {
  const days = useMemo(() => Array.from({ length: 42 }, (_, i) => addDays(data.start, i)), [data.start]);
  const month = data.month.slice(0, 7);

  // la schimbarea lunii grila intră cu o mică animație (e montată din nou)
  const [anim, setAnim] = useState(0);
  useEffect(() => setAnim((n) => n + 1), [data.month]);

  /* Câte bare încap într-o zi depinde de înălțimea ecranului. */
  const box = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(3);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setFit(Math.max(1, Math.floor((el.clientHeight / 6 - CAP - 4) / RAND)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [anim]);

  /* Glisarea cu degetul; cu mouse-ul se folosesc săgețile din bară. */
  const swipe = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  function down(e: PointerEvent) {
    if (e.pointerType === "mouse") return;
    swipe.current = { x: e.clientX, y: e.clientY, moved: false };
  }
  function up(e: PointerEvent) {
    const s = swipe.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      s.moved = true;
      onSwipe(dx < 0 ? 1 : -1);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-1.5 pb-[5.5rem] sm:px-3">
      <div className="grid grid-cols-7 pb-1 pt-1">
        {ZILE.map((z, i) => (
          <div key={i} className={`text-center font-sans text-[0.95rem] font-semibold ${i === 6 ? "text-clay" : "text-ink-soft"}`}>
            {z}
          </div>
        ))}
      </div>

      <div
        ref={box}
        key={anim}
        className="cal-luna grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-[3px]"
        onPointerDown={down}
        onPointerUp={up}
        onPointerCancel={() => (swipe.current = null)}
      >
        {days.map((date, i) => {
          const list = aleZilei(data, date, ascunse);
          const inMonth = date.slice(0, 7) === month;
          const today = date === data.today;
          const sel = date === selected;
          const sunday = i % 7 === 6;
          const shown = list.length > fit ? list.slice(0, fit - 1) : list;
          const more = list.length - shown.length;
          return (
            <button
              key={date}
              type="button"
              aria-label={`${date}${list.length ? `, ${list.length} în calendar` : ""}`}
              aria-pressed={sel}
              onClick={() => {
                if (swipe.current?.moved) return;
                if (sel) onOpen(date);
                else onSelect(date);
              }}
              className={`relative flex min-w-0 flex-col overflow-hidden rounded-[0.6rem] text-left transition-colors ${
                sunday ? "bg-sage-pale/60" : "bg-cream-warm"
              } ${sel ? "ring-2 ring-inset ring-ink/70" : ""} ${inMonth ? "" : "opacity-45"}`}
            >
              <span className="flex h-[30px] shrink-0 items-center justify-center">
                <span
                  className={`flex h-[24px] min-w-[24px] items-center justify-center rounded-[0.45rem] px-1 font-sans text-[1.02rem] font-semibold tabular-nums ${
                    today ? "bg-periwinkle text-cream" : sunday ? "text-clay" : "text-ink"
                  }`}
                >
                  {Number(date.slice(8))}
                </span>
              </span>
              <span className="flex min-w-0 flex-col gap-[3px] px-[2px]">
                {shown.map((e) =>
                  e.allDay ? (
                    <span key={e.id} className="cal-bara cal-bara-plina" style={{ background: fundal(e, 45) }}>
                      {e.title}
                    </span>
                  ) : (
                    <span key={e.id} className="cal-bara" style={{ "--c": culoare(e) } as React.CSSProperties}>
                      <span className="hidden md:inline">{minToTime(e.start)} </span>
                      {prenume(e)}
                    </span>
                  ),
                )}
                {more > 0 && <span className="pl-1 font-sans text-[0.8rem] font-semibold text-ink-soft">+{more}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
