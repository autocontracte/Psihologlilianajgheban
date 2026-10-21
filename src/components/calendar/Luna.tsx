"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { addDays, isoWeekday, minToTime, type LunaCal } from "@/lib/calendarTelefon";
import { aleZilei, culoare, fundal, prenume, type Strat } from "./comun";

/* Vederea pe lună, ca în calendarul telefonului: doar săptămânile lunii (4–6),
   în fiecare zi evenimentele ca bare colorate, câte încap, apoi „+N". Un atac
   alege ziua, al doilea o deschide. Glisarea stânga–dreapta schimbă luna. */

const ZILE = ["L", "M", "M", "J", "V", "S", "D"];
const ZILE_LUNGI = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];
/* Înălțimea unei bare (cu spațiul de sub ea) și a numărului zilei, în pixeli;
   pe calculator, mai mari (vezi .cal-bara în calendar.css). */
const MASURI = { telefon: { rand: 21, cap: 30 }, mare: { rand: 25, cap: 36 } };

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
  const month = data.month.slice(0, 7);
  // câte săptămâni are luna pe ecran: fără rândul gol din luna următoare
  const rows = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const zile = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return Math.ceil((isoWeekday(data.month) - 1 + zile) / 7);
  }, [month, data.month]);
  const days = useMemo(() => Array.from({ length: rows * 7 }, (_, i) => addDays(data.start, i)), [data.start, rows]);

  // la schimbarea lunii grila intră cu o mică animație (e montată din nou)
  const [anim, setAnim] = useState(0);
  useEffect(() => setAnim((n) => n + 1), [data.month]);

  /* Câte bare încap într-o zi depinde de înălțimea ecranului. */
  const box = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(3);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const { rand, cap } = window.matchMedia("(min-width: 1024px)").matches ? MASURI.mare : MASURI.telefon;
      setFit(Math.max(1, Math.floor((el.clientHeight / rows - cap - 4) / rand)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [anim, rows]);

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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col px-1.5 pb-[5.5rem] sm:px-3 min-[600px]:pb-3 lg:px-5 lg:pb-5">
      <div className="grid grid-cols-7 pb-1.5 pt-1">
        {ZILE.map((z, i) => (
          <div key={i} className={`text-center font-sans text-[0.95rem] font-semibold ${i === 6 ? "text-clay" : "text-ink-soft"}`}>
            <span className="xl:hidden">{z}</span>
            <span className="hidden xl:inline">{ZILE_LUNGI[i]}</span>
          </div>
        ))}
      </div>

      <div
        ref={box}
        key={anim}
        className="cal-luna grid min-h-0 flex-1 grid-cols-7 gap-[3px] lg:gap-1.5"
        style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
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
              className={`relative flex min-w-0 flex-col overflow-hidden rounded-[0.7rem] border text-left transition-colors ${
                sunday ? "border-clay/10 bg-clay-pale/45" : "border-ink/[0.06] bg-white/85 hover:border-ink/20"
              } ${sel ? "!border-ink/70 ring-1 ring-inset ring-ink/70" : ""} ${inMonth ? "" : "opacity-40"}`}
            >
              <span className="flex h-[30px] shrink-0 items-center justify-center lg:h-[36px]">
                <span
                  className={`flex h-[24px] min-w-[24px] items-center justify-center rounded-[0.45rem] px-1 font-sans text-[1.02rem] font-semibold tabular-nums lg:h-[28px] lg:min-w-[28px] lg:text-[1.05rem] ${
                    today ? "bg-periwinkle text-cream" : sunday ? "text-clay" : "text-ink"
                  }`}
                >
                  {Number(date.slice(8))}
                </span>
              </span>
              <span className="flex min-w-0 flex-col gap-[3px] px-[3px] lg:gap-[5px] lg:px-1.5">
                {shown.map((e) =>
                  e.allDay ? (
                    <span key={e.id} className="cal-bara cal-bara-plina" style={{ background: fundal(e, 45) }}>
                      {e.title}
                    </span>
                  ) : (
                    <span key={e.id} className="cal-bara" style={{ "--c": culoare(e) } as React.CSSProperties}>
                      <span className="hidden 2xl:inline">{minToTime(e.start)} </span>
                      <span className="lg:hidden">{prenume(e)}</span>
                      <span className="hidden lg:inline">{e.title}</span>
                    </span>
                  ),
                )}
                {more > 0 && <span className="pl-1 font-sans text-[0.8rem] font-semibold text-ink-soft lg:text-[0.85rem]">+{more}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
