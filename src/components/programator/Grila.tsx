"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, KeyRound, LogOut, Printer, Users } from "lucide-react";
import {
  DAY_END,
  DAY_START,
  KIND_LABEL,
  ROWS,
  STEP,
  ZILE,
  addDays,
  daysLabel,
  minToTime,
  mondayOf,
  ownerDay,
  shortDate,
  weekLabel,
  type Reservation,
  type Week,
} from "@/lib/programator/reguli";
import { Calendar } from "./Calendar";
import { DialogRezervare, type Draft } from "./DialogRezervare";
import { durata } from "./Interval";
import { cere, type Me } from "./comun";

type Zoom = "fit" | "m" | "l";
type Sel = { col: number; r0: number; r1: number };
type Cursor = { col: number; row: number };

const ZOOMS: [Zoom, string, string][] = [
  ["fit", "Tot", "Toată săptămâna pe ecran"],
  ["m", "Mediu", "Celule medii"],
  ["l", "Mare", "Celule mari"],
];

const unealta =
  "inline-flex h-9 items-center justify-center gap-1.5 border border-ink/20 bg-cream-warm px-2.5 font-sans text-[0.88rem] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream disabled:opacity-50";

/** Ora României, în minute de la miezul nopții. */
function nowMinutes(): number {
  const [h, m] = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Bucharest",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .format(new Date())
    .split(":")
    .map(Number);
  return h * 60 + m;
}

export function Grila({ initial, me }: { initial: Week; me: Me }) {
  const [week, setWeek] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState<Zoom>("fit");
  const [sel, setSel] = useState<Sel | null>(null);
  const [cursor, setCursor] = useState<Cursor | null>(null);
  const [kbd, setKbd] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [focusPerson, setFocusPerson] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [now, setNow] = useState<number | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; a: number; b: number } | null>(null);
  const [calOpen, setCalOpen] = useState(false);
  const calBox = useRef<HTMLDivElement>(null);

  const scroller = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const drag = useRef<{ col: number; r0: number; y0: number; moved: boolean } | null>(null);
  const skipClick = useRef(false);
  const busyRef = useRef(false);

  const R = week.rooms.length;
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(week.start, i)), [week.start]);
  const people = useMemo(() => new Map(week.people.map((p) => [p.id, p])), [week.people]);

  /* O coloană = un cabinet într-o zi. */
  const cols = useMemo(
    () =>
      days.flatMap((date, d) =>
        week.rooms.map((room, r) => ({
          date,
          d,
          r,
          room,
          owned: ownerDay(room, date),
          last: r === R - 1,
        })),
      ),
    [days, week.rooms, R],
  );

  const byCol = useMemo(() => {
    const map = new Map<number, Reservation[]>();
    for (const res of week.reservations) {
      const d = days.indexOf(res.date);
      const r = week.rooms.findIndex((x) => x.id === res.roomId);
      if (d < 0 || r < 0) continue;
      const c = d * R + r;
      map.set(c, [...(map.get(c) ?? []), res]);
    }
    return map;
  }, [week.reservations, week.rooms, days, R]);

  const rowOf = (min: number) => (min - DAY_START) / STEP;

  const resAt = useCallback(
    (col: number, row: number) =>
      (byCol.get(col) ?? []).find((x) => rowOf(x.start) <= row && rowOf(x.end) > row) ?? null,
    [byCol],
  );

  /** Rândurile libere, legate, din jurul unui rând — cât se poate întinde o selecție. */
  const freeSpan = useCallback(
    (col: number, row: number): [number, number] => {
      let lo = row;
      let hi = row;
      while (lo > 0 && !resAt(col, lo - 1)) lo--;
      while (hi < ROWS - 1 && !resAt(col, hi + 1)) hi++;
      return [lo, hi];
    },
    [resAt],
  );

  /* ------------------------------------------------------------- Încărcare */

  const load = useCallback(async (start: string, quiet = false) => {
    if (busyRef.current) return;
    busyRef.current = true;
    if (!quiet) setLoading(true);
    try {
      const data = await cere<Week>(`/api/programator/saptamana?start=${start}`);
      setWeek(data);
      setError("");
      if (!quiet) window.history.replaceState(null, "", `?s=${data.start}`);
    } catch (err) {
      if (!quiet) setError(err instanceof Error ? err.message : "Nu am putut încărca săptămâna.");
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }, []);

  function go(start: string) {
    setSel(null);
    setCursor(null);
    setNotice("");
    load(start);
  }

  /* Grila e folosită de mai mulți oameni: se reîmprospătează singură la un
     minut și când fereastra revine în față, dar nu peste o fereastră deschisă. */
  const idle = !draft;
  useEffect(() => {
    if (!idle) return;
    const refresh = () => {
      if (document.visibilityState === "visible" && !drag.current) load(week.start, true);
    };
    const timer = setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [idle, week.start, load]);

  useEffect(() => {
    // implicit toată săptămâna pe ecran; pe telefon, câte o zi
    const saved = window.localStorage.getItem("prog-marime");
    if (saved === "fit" || saved === "m" || saved === "l") setZoom(saved);
    else if (window.innerWidth < 900) setZoom("m");
    setNow(nowMinutes());
    const timer = setInterval(() => setNow(nowMinutes()), 60_000);
    return () => clearInterval(timer);
  }, []);

  function pickZoom(z: Zoom) {
    setZoom(z);
    window.localStorage.setItem("prog-marime", z);
  }

  /* La deschidere și la schimbarea săptămânii, ziua de azi vine în față. */
  useEffect(() => {
    const el = grid.current?.querySelector<HTMLElement>("[data-prinde-azi]");
    const box = scroller.current;
    if (!box) return;
    const timeCol = grid.current?.querySelector<HTMLElement>(".prog-colt")?.offsetWidth ?? 0;
    box.scrollLeft = el ? el.offsetLeft - timeCol : 0;
  }, [week.start, zoom]);

  /* ------------------------------------------------------- Deschide ferestre */

  const openNew = useCallback(
    (col: number, lo: number, hi: number) => {
      const c = cols[col];
      if (!c || c.owned) return;
      setSel({ col, r0: lo, r1: hi });
      setDraft({
        mode: "new",
        roomId: c.room.id,
        date: c.date,
        start: DAY_START + lo * STEP,
        end: DAY_START + (hi + 1) * STEP,
      });
    },
    [cols],
  );

  /** Un clic simplu propune o oră întreagă, dacă e loc. */
  const openAt = useCallback(
    (col: number, row: number) => {
      const [, hi] = freeSpan(col, row);
      openNew(col, row, Math.min(row + 1, hi));
    },
    [freeSpan, openNew],
  );

  const closeDialog = useCallback(() => {
    setDraft(null);
    setSel(null);
    scroller.current?.focus({ preventScroll: true });
  }, []);

  const doneDialog = useCallback(
    (msg?: string) => {
      setDraft(null);
      setSel(null);
      setNotice(msg ?? "");
      load(week.start, true);
      scroller.current?.focus({ preventScroll: true });
    },
    [load, week.start],
  );

  /* ------------------------------------------------------------------ Mouse */

  /** Linia de oră cea mai apropiată de cursor: 0 = 08:00 … ROWS = 22:00. */
  function lineAt(clientY: number): number {
    const ore = grid.current!.querySelectorAll<HTMLElement>(".prog-ora");
    const top = ore[0].getBoundingClientRect().top;
    const bottom = ore[ore.length - 1].getBoundingClientRect().bottom;
    const line = Math.round((clientY - top) / ((bottom - top) / ROWS));
    return Math.max(0, Math.min(ROWS, line));
  }

  /* Rândurile acoperite când se trage din rândul r0 până la cursor. Capătul e
     linia cea mai apropiată, nu rândul în care a ajuns cursorul: cine trage
     „până la 9:30" se oprește pe linia de 9:30, nu ia și jumătatea următoare. */
  function rowsTo(d: { col: number; r0: number }, clientY: number): [number, number] {
    const [lo, hi] = freeSpan(d.col, d.r0);
    const line = Math.max(lo, Math.min(hi + 1, lineAt(clientY)));
    return line > d.r0 ? [d.r0, line - 1] : [line, d.r0];
  }

  function cellOf(target: EventTarget): Cursor | null {
    const el = (target as HTMLElement).closest<HTMLElement>(".prog-cel");
    if (!el) return null;
    return { col: Number(el.dataset.c), row: Number(el.dataset.r) };
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0 || e.pointerType !== "mouse") return;
    const cell = cellOf(e.target);
    if (!cell) return;
    setKbd(false);
    drag.current = { col: cell.col, r0: cell.row, y0: e.clientY, moved: false };
    setSel({ col: cell.col, r0: cell.row, r1: cell.row });
    setCursor(cell);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // fără captură, tragerea merge cât timp cursorul rămâne deasupra
    }
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    if (Math.abs(e.clientY - d.y0) > 4) d.moved = true;
    if (!d.moved) return;
    const [a, b] = rowsTo(d, e.clientY);
    setSel((s) => (s && s.r0 === a && s.r1 === b ? s : { col: d.col, r0: a, r1: b }));
    setTip({ x: e.clientX, y: e.clientY, a, b });
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    setTip(null);
    skipClick.current = true;
    setTimeout(() => (skipClick.current = false), 0);
    if (e.type === "pointercancel") {
      setSel(null);
      return;
    }
    if (!d.moved) {
      openAt(d.col, d.r0);
      return;
    }
    // direct din poziția cursorului, nu din starea afișată, care poate fi cu un pas în urmă
    const [a, b] = rowsTo(d, e.clientY);
    openNew(d.col, a, b);
  }

  /* Pe ecrane tactile nu se trage (degetul derulează grila): o atingere
     deschide direct fereastra, iar orele se aleg acolo. */
  function onClick(e: MouseEvent<HTMLDivElement>) {
    if (skipClick.current) return;
    const cell = cellOf(e.target);
    if (cell) openAt(cell.col, cell.row);
  }

  /* ------------------------------------------------------------------ Taste */

  function stepCol(from: number, dir: 1 | -1): number {
    for (let c = from + dir; c >= 0 && c < cols.length; c += dir) {
      if (!cols[c].owned) return c;
    }
    return from;
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (draft || e.target !== e.currentTarget) return;
    if (e.key === "Escape") {
      setSel(null);
      return;
    }

    const start: Cursor =
      cursor ??
      (() => {
        const today = Math.max(0, days.indexOf(week.today));
        const first = cols.findIndex((c) => c.d === today && !c.owned);
        return { col: Math.max(0, first), row: now ? Math.max(0, Math.min(ROWS - 1, Math.floor(rowOf(now)))) : 2 };
      })();

    if (e.key.startsWith("Arrow")) {
      e.preventDefault();
      setKbd(true);
      if (!cursor) {
        setCursor(start);
        return;
      }
      let { col, row } = start;
      if (e.key === "ArrowUp") row = Math.max(0, row - 1);
      if (e.key === "ArrowDown") row = Math.min(ROWS - 1, row + 1);
      if (e.key === "ArrowLeft") col = stepCol(col, -1);
      if (e.key === "ArrowRight") col = stepCol(col, 1);

      const vertical = e.key === "ArrowUp" || e.key === "ArrowDown";
      if (e.shiftKey && vertical && !resAt(col, start.row)) {
        const anchor = sel && sel.col === col ? sel.r0 : start.row;
        const [lo, hi] = freeSpan(col, anchor);
        row = Math.max(lo, Math.min(hi, row));
        setSel({ col, r0: anchor, r1: row });
      } else {
        setSel(null);
      }
      setCursor({ col, row });
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!cursor) return;
      if (sel && sel.col === cursor.col) {
        openNew(sel.col, Math.min(sel.r0, sel.r1), Math.max(sel.r0, sel.r1));
        return;
      }
      const res = resAt(cursor.col, cursor.row);
      if (res) setDraft({ mode: "edit", res });
      else openAt(cursor.col, cursor.row);
    }
  }

  useEffect(() => {
    if (!kbd || !cursor) return;
    grid.current
      ?.querySelector(`[data-c="${cursor.col}"][data-r="${cursor.row}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [kbd, cursor]);

  useEffect(() => {
    if (!calOpen) return;
    const away = (e: globalThis.MouseEvent) => {
      if (!calBox.current?.contains(e.target as Node)) setCalOpen(false);
    };
    const esc = (e: globalThis.KeyboardEvent) => e.key === "Escape" && setCalOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [calOpen]);

  /* ---------------------------------------------------------------- Randare */

  const cells = useMemo(() => {
    const out = [];
    for (let c = 0; c < cols.length; c++) {
      const col = cols[c];
      if (col.owned) continue;
      for (let r = 0; r < ROWS; r++) {
        out.push(
          <div
            key={`${c}-${r}`}
            className="prog-cel"
            data-c={c}
            data-r={r}
            data-jumate={r % 2 === 1 ? "" : undefined}
            data-capat={col.last ? "" : undefined}
            data-weekend={col.d >= 5 ? "" : undefined}
            data-azi={col.date === week.today ? "" : undefined}
            data-trecut={col.date < week.today ? "" : undefined}
            style={{ gridColumn: c + 2, gridRow: r + 3 }}
          />,
        );
      }
    }
    return out;
  }, [cols, week.today]);

  const template = `var(--tw) ${cols
    .map((c) => (c.owned ? "var(--cwp)" : "minmax(var(--cw), 1fr)"))
    .join(" ")}`;

  const todayIdx = days.indexOf(week.today);
  const showNow = todayIdx >= 0 && now !== null && now >= DAY_START && now < DAY_END;

  const legend = week.people.filter(
    (p) => p.active || week.reservations.some((x) => x.personId === p.id),
  );

  async function logout() {
    await fetch("/api/programator/logout", { method: "POST" });
    window.location.href = "/intra";
  }

  return (
    <div className="prog-app">
      {/* Un singur rând de unelte, ca grila să înceapă cât mai sus */}
      <header className="prog-bara border-b border-ink/10 bg-cream px-3 py-1.5 lg:px-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h1 className="mr-1 font-display text-lg text-ink">Programator cabinete</h1>

          <div className="flex items-center gap-1">
            <button type="button" onClick={() => go(addDays(week.start, -7))} className={unealta} aria-label="Săptămâna trecută">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(mondayOf(week.today))}
              disabled={week.start === mondayOf(week.today)}
              className={unealta}
            >
              Azi
            </button>
            <button type="button" onClick={() => go(addDays(week.start, 7))} className={unealta} aria-label="Săptămâna viitoare">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Săptămâna afișată; la apăsare, calendarul pentru salt la altă săptămână */}
          <div ref={calBox} className="relative">
            <button
              type="button"
              aria-expanded={calOpen}
              aria-label={`Săptămâna ${weekLabel(week.start)}. Alege altă săptămână`}
              onClick={() => setCalOpen(!calOpen)}
              className={`inline-flex h-9 items-center gap-2 border px-2.5 transition-colors ${
                calOpen ? "border-periwinkle bg-periwinkle-pale" : "border-ink/20 bg-cream-warm hover:border-ink"
              }`}
            >
              <CalendarDays className="h-4 w-4 text-periwinkle" />
              <strong className="font-display text-[1.05rem] font-semibold text-ink" aria-live="polite">
                {weekLabel(week.start)}
              </strong>
              <ChevronDown className="h-4 w-4 text-ink-soft" />
            </button>
            {calOpen && (
              <div className="absolute left-0 top-full z-30 mt-1 w-[19.5rem] max-w-[calc(100vw-1.5rem)] border border-ink/20 bg-cream p-3 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.55)]">
                <Calendar
                  wholeWeek
                  value={days.includes(week.today) ? week.today : week.start}
                  today={week.today}
                  onChange={(d) => {
                    setCalOpen(false);
                    go(mondayOf(d));
                  }}
                />
              </div>
            )}
          </div>
          {loading && <span className="font-sans text-[0.8rem] text-ink-muted">Se încarcă…</span>}

          <div className="ml-auto flex items-center gap-2">
            <div className="flex border border-ink/20" role="group" aria-label="Mărimea celulelor">
              {ZOOMS.map(([z, label, title]) => (
                <button
                  key={z}
                  type="button"
                  title={title}
                  aria-pressed={zoom === z}
                  onClick={() => pickZoom(z)}
                  className={`h-9 px-3 font-sans text-[0.85rem] transition-colors ${
                    zoom === z ? "bg-periwinkle text-cream" : "bg-cream-warm text-ink hover:bg-periwinkle-pale"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="hidden md:inline-flex">
              <button type="button" onClick={() => window.print()} className={unealta} title="Tipărește săptămâna" aria-label="Tipărește săptămâna">
                <Printer className="h-4 w-4" />
              </button>
            </span>
          </div>

          <nav className="flex items-center gap-3.5 font-sans text-[0.85rem] text-ink-soft">
            <span className="hidden xl:inline">{me.name}</span>
            {me.manager && (
              <Link href="/oameni" className="inline-flex items-center gap-1.5 transition-colors hover:text-periwinkle">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Oameni și cabinete</span>
              </Link>
            )}
            {me.personId && (
              <Link href="/cont" className="inline-flex items-center gap-1.5 transition-colors hover:text-periwinkle">
                <KeyRound className="h-4 w-4" />
                <span className="hidden lg:inline">Parola mea</span>
              </Link>
            )}
            <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 transition-colors hover:text-clay">
              <LogOut className="h-4 w-4" />
              Ieși
            </button>
          </nav>
        </div>

        {/* Legenda: un clic pe un nume îi scoate în față rezervările */}
        <div className="prog-legenda mt-1.5 flex w-full items-center gap-x-4 gap-y-1 overflow-x-auto whitespace-nowrap font-sans text-[0.8rem] md:flex-wrap md:overflow-visible">
          {(["CENTRU", "CHIRIAS"] as const).map((kind) => {
            const list = legend.filter((p) => p.kind === kind);
            if (list.length === 0) return null;
            return (
              <div key={kind} className="flex shrink-0 items-center gap-1.5 md:shrink md:flex-wrap">
                <span className="mr-0.5 text-ink-muted">{kind === "CENTRU" ? KIND_LABEL.CENTRU : "Chiriași"}:</span>
                {list.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={focusPerson === p.id}
                    onClick={() => setFocusPerson(focusPerson === p.id ? null : p.id)}
                    className={`inline-flex items-center gap-1.5 border px-2 py-0.5 transition-colors ${
                      focusPerson === p.id ? "border-ink bg-ink text-cream" : "border-ink/15 bg-cream-warm text-ink hover:border-ink/50"
                    }`}
                  >
                    <span className="inline-block h-3 w-3" style={{ background: p.color }} />
                    {p.name}
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {(notice || error) && (
          <p
            role="status"
            className={`mt-1.5 flex w-full items-start justify-between gap-4 px-4 py-2 font-sans text-[0.9rem] ${
              error ? "bg-clay-pale text-clay" : "bg-periwinkle-pale text-ink"
            }`}
          >
            <span>{error || notice}</span>
            <button
              type="button"
              className="underline underline-offset-2"
              onClick={() => {
                setNotice("");
                setError("");
              }}
            >
              Închide
            </button>
          </p>
        )}
      </header>

      {/* Grila */}
      <div
        ref={scroller}
        className="prog-scroll"
        tabIndex={0}
        role="grid"
        aria-label={`Cabinete, săptămâna ${weekLabel(week.start)}. Săgețile mută celula, Shift cu săgeți întinde intervalul, Enter rezervă.`}
        onKeyDown={onKeyDown}
      >
        <div
          ref={grid}
          className="prog-grila"
          data-zoom={zoom}
          style={
            {
              "--rows": ROWS,
              "--rooms": R,
              "--cwp": zoom === "fit" ? "1.5rem" : "2.4rem",
              gridTemplateColumns: template,
            } as React.CSSProperties
          }
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClick={onClick}
        >
          <div className="prog-colt" />

          {days.map((date, d) => (
            <div
              key={date}
              className="prog-zi"
              data-azi={date === week.today ? "" : undefined}
              style={{ gridColumn: `${2 + d * R} / span ${R}` }}
            >
              <span>
                <b>{ZILE[d]}</b>
                <small>{shortDate(date)}</small>
              </span>
            </div>
          ))}

          {days.map((date, d) => (
            <div
              key={date}
              className="prog-prinde"
              data-prinde-azi={date === week.today ? "" : undefined}
              style={{ gridColumn: 2 + d * R }}
            />
          ))}

          {cols.map((c, i) => (
            <div
              key={i}
              className="prog-cab"
              data-azi={c.date === week.today ? "" : undefined}
              data-capat={c.last ? "" : undefined}
              style={{ gridColumn: i + 2 }}
              title={c.room.name}
            >
              <span className="prog-lung">{c.room.name}</span>
              <span className="prog-scurt">{c.room.name.replace(/^cabinet(ul)?\s*/i, "C")}</span>
            </div>
          ))}

          {Array.from({ length: ROWS }, (_, r) => (
            <div
              key={r}
              className="prog-ora"
              data-jumate={r % 2 === 1 ? "" : undefined}
              data-prima={r === 0 ? "" : undefined}
              style={{ gridRow: r + 3 }}
            >
              <span>{minToTime(DAY_START + r * STEP)}</span>
              {r === ROWS - 1 && <span className="prog-ora-final">{minToTime(DAY_END)}</span>}
            </div>
          ))}

          {cells}

          {/* Zilele în care cabinetul e al proprietarului */}
          {cols.map((c, i) => {
            if (!c.owned) return null;
            const owner = people.get(c.room.ownerId!);
            return (
              <div
                key={`p${i}`}
                className="prog-prop"
                data-capat={c.last ? "" : undefined}
                data-estompat={focusPerson && focusPerson !== owner?.id ? "" : undefined}
                style={{ gridColumn: i + 2, gridRow: `3 / span ${ROWS}`, "--c": owner?.color } as React.CSSProperties}
                title={`${c.room.name} — ${owner?.name ?? ""}, ${daysLabel(c.room.ownerDays)}`}
              >
                <span>
                  <b>{owner?.name}</b>
                </span>
              </div>
            );
          })}

          {/* Rezervările */}
          {[...byCol.entries()].flatMap(([c, list]) =>
            list.map((res) => {
              const p = people.get(res.personId);
              const mine = res.personId === me.personId;
              return (
                <button
                  key={res.id}
                  type="button"
                  className="prog-rez"
                  data-estompat={focusPerson && focusPerson !== res.personId ? "" : undefined}
                  data-mic={res.end - res.start <= STEP ? "" : undefined}
                  style={
                    {
                      gridColumn: c + 2,
                      gridRow: `${rowOf(res.start) + 3} / span ${rowOf(res.end) - rowOf(res.start)}`,
                      "--c": p?.color ?? "#ddd",
                    } as React.CSSProperties
                  }
                  title={`${p?.name ?? ""} · ${minToTime(res.start)}–${minToTime(res.end)}${res.note ? ` · ${res.note}` : ""}`}
                  onClick={() => setDraft({ mode: "edit", res })}
                >
                  <b>
                    <span className="prog-lung">{p?.name}</span>
                    <span className="prog-scurt">{p?.initials}</span>
                  </b>
                  <span className="prog-rez-ora">
                    {minToTime(res.start)}–{minToTime(res.end)}
                    {mine ? " · tu" : ""}
                  </span>
                  {res.note && <span className="prog-rez-ora">{res.note}</span>}
                </button>
              );
            }),
          )}

          {sel && (
            <div
              className="prog-sel"
              style={{
                gridColumn: sel.col + 2,
                gridRow: `${Math.min(sel.r0, sel.r1) + 3} / span ${Math.abs(sel.r1 - sel.r0) + 1}`,
              }}
            >
              {minToTime(DAY_START + Math.min(sel.r0, sel.r1) * STEP)}–
              {minToTime(DAY_START + (Math.max(sel.r0, sel.r1) + 1) * STEP)}
            </div>
          )}

          {kbd && cursor && (
            <div className="prog-cursor" style={{ gridColumn: cursor.col + 2, gridRow: cursor.row + 3 }} />
          )}

          {showNow && (
            <div
              className="prog-acum"
              style={
                {
                  gridColumn: `${2 + todayIdx * R} / span ${R}`,
                  gridRow: Math.floor(rowOf(now!)) + 3,
                  "--f": ((now! - DAY_START) % STEP) / STEP,
                } as React.CSSProperties
              }
            />
          )}
        </div>
      </div>

      {tip && (
        <div
          className="pointer-events-none fixed z-40 bg-ink px-3 py-1.5 font-sans text-[1.05rem] font-semibold tabular-nums text-cream shadow-lg"
          style={{ left: tip.x + 18, top: tip.y + 14 }}
        >
          {minToTime(DAY_START + tip.a * STEP)}–{minToTime(DAY_START + (tip.b + 1) * STEP)}
          <span className="ml-2 font-normal opacity-75">{durata((tip.b - tip.a + 1) * STEP)}</span>
        </div>
      )}

      {draft && <DialogRezervare draft={draft} week={week} me={me} onClose={closeDialog} onDone={doneDialog} />}
    </div>
  );
}
