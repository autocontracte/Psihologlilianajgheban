"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Calendar,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Download,
  LayoutDashboard,
  List,
  LogOut,
  RefreshCw,
  Settings,
} from "lucide-react";
import { LUNI_LUNGI, addDays, isoWeekday, lunaPlus, mondayOf, type LunaCal } from "@/lib/calendarTelefon";
import { CULOARE, STRATURI, cere, stareSync, type Strat, type Vedere } from "./comun";

/* Meniul calendarului: vederile, apoi ce se vede (programările după status
   și Google Calendar), apoi panoul și contul. Pe telefon e un sertar care
   iese din stânga; pe calculator stă mereu la vedere, cu „Adăugare" și un
   calendar mic deasupra. */

const VEDERI: [Vedere, string, typeof Calendar][] = [
  ["an", "An", CalendarRange],
  ["luna", "Lună", CalendarDays],
  ["saptamana", "Săptămână", Columns3],
  ["zi", "Zi", Calendar],
  ["program", "Program", List],
];

type MeniuProps = {
  vedere: Vedere;
  onVedere: (v: Vedere) => void;
  ascunse: Strat[];
  onAscunse: (a: Strat[]) => void;
  google: boolean;
  /** ultima sincronizare reușită, arătată sub butonul „Sincronizează acum" */
  sync: LunaCal["sync"];
  onSincronizat: (msg: string) => void;
  /** promptul de instalare primit de la Chrome, dacă aplicația se poate instala */
  install: (() => void) | null;
};

/** Sub butonul de sincronizare: când a mers ultima dată; roșu dacă a trecut prea mult. */
function StareSync({ sync, mic }: { sync: LunaCal["sync"]; mic: boolean }) {
  const s = stareSync(sync);
  return (
    <p
      role={s.intarziat ? "alert" : undefined}
      className={`font-sans leading-snug ${mic ? "px-3 pb-1 text-[0.85rem]" : "px-4 pb-2 text-[0.95rem]"} ${
        s.intarziat ? "rounded-[0.8rem] bg-clay-pale py-2 font-semibold text-clay" : "text-ink-soft"
      }`}
    >
      {s.text}
      {s.eroare && <span className="mt-1 block break-words font-normal">{s.eroare.slice(0, 160)}</span>}
    </p>
  );
}

/** Conținutul meniului. `mic`: rândurile mai strânse ale barei de pe calculator. */
export function Meniu({
  vedere,
  onVedere,
  ascunse,
  onAscunse,
  google,
  sync: ultima,
  onSincronizat,
  install,
  mic = false,
  onDupa = () => {},
}: MeniuProps & { mic?: boolean; /** după o alegere (sertarul se închide) */ onDupa?: () => void }) {
  const [straturi, setStraturi] = useState(true);
  const [sync, setSync] = useState(false);

  const linie = `${mic ? "my-2" : "my-3"} border-t-2 border-dotted border-ink/15`;
  const rand = `flex w-full items-center gap-4 rounded-[1rem] text-left font-sans text-ink transition-colors hover:bg-cream-deep disabled:opacity-60 ${
    mic ? "gap-3 px-3 py-2 text-[0.98rem]" : "px-4 py-3.5 text-[1.15rem]"
  }`;
  const icon = mic ? "h-5 w-5 shrink-0" : "h-6 w-6 shrink-0";

  async function sincronizeaza() {
    setSync(true);
    try {
      await cere("/api/calendar/sync", "POST");
      onSincronizat("Sincronizat cu Google Calendar.");
    } catch (err) {
      onSincronizat(err instanceof Error ? err.message : "Sincronizarea nu a reușit.");
    } finally {
      setSync(false);
      onDupa();
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/cont/autentificare?redirect=/calendar";
  }

  return (
    <>
      {VEDERI.map(([v, label, Icon]) => (
        <button
          key={v}
          type="button"
          aria-current={vedere === v ? "page" : undefined}
          onClick={() => {
            onVedere(v);
            onDupa();
          }}
          className={`${rand} ${vedere === v ? "bg-cream-deep font-semibold" : ""}`}
        >
          <Icon className={icon} />
          {label}
        </button>
      ))}

      <div className={linie} />

      <button type="button" onClick={() => setStraturi(!straturi)} aria-expanded={straturi} className={`${rand} justify-between`}>
        <span className="font-semibold">Calendarele mele</span>
        <span className="text-ink-soft">{straturi ? "▴" : "▾"}</span>
      </button>
      {straturi &&
        STRATURI.filter(([s]) => s !== "google" || google).map(([s, label]) => {
          const on = !ascunse.includes(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => onAscunse(on ? [...ascunse, s] : ascunse.filter((x) => x !== s))}
              className={rand}
            >
              <span
                className={`flex shrink-0 items-center justify-center rounded-full border-2 transition-colors ${mic ? "h-5 w-5" : "h-6 w-6"}`}
                style={{ borderColor: CULOARE[s], background: on ? CULOARE[s] : "transparent" }}
              >
                {on && <Check className={mic ? "h-3.5 w-3.5 text-cream" : "h-4 w-4 text-cream"} strokeWidth={3} />}
              </span>
              {label}
            </button>
          );
        })}

      <div className={linie} />

      {install && (
        <button type="button" onClick={install} className={`${rand} text-periwinkle`}>
          <Download className={icon} />
          Instalează aplicația
        </button>
      )}
      {google && (
        <button type="button" onClick={sincronizeaza} disabled={sync} className={rand}>
          <RefreshCw className={`${icon} ${sync ? "animate-spin" : ""}`} />
          {sync ? "Se sincronizează…" : "Sincronizează acum"}
        </button>
      )}
      {google && <StareSync sync={ultima} mic={mic} />}
      <Link href="/admin/programari" className={rand}>
        <CalendarClock className={icon} />
        Toate programările
      </Link>
      <Link href="/admin" className={rand}>
        <LayoutDashboard className={icon} />
        Panoul de administrare
      </Link>
      {mic && (
        <Link href="/admin/program" className={rand}>
          <Settings className={icon} />
          Programul de lucru
        </Link>
      )}
      <button type="button" onClick={logout} className={`${rand} text-clay`}>
        <LogOut className={icon} />
        Ieși
      </button>

      <p className={`px-4 font-sans text-ink-muted ${mic ? "mt-3 text-[0.82rem]" : "mt-4 text-[0.9rem]"}`}>
        {google ? "Legat de Google Calendar" : "Google Calendar nu e conectat"}
      </p>
    </>
  );
}

/** Sertarul de pe telefon (și de pe ecranele înguste). */
export function Sertar({ open, onClose, ...meniu }: MeniuProps & { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-40 lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-ink/35 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <aside
        aria-label="Meniu"
        className={`absolute inset-y-0 left-0 flex w-[80%] max-w-[22rem] flex-col rounded-r-[1.75rem] bg-cream-warm shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-6 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex justify-end px-2 pt-2">
            <Link href="/admin/program" aria-label="Programul de lucru" className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-cream-deep">
              <Settings className="h-6 w-6" />
            </Link>
          </div>
          <div className="my-3 border-t-2 border-dotted border-ink/15" />
          <Meniu {...meniu} onDupa={onClose} />
        </div>
      </aside>
    </div>
  );
}

/* ------------------------------------------------- Bara de pe calculator */

/** Calendarul mic din bara laterală: luna zilei alese, cu puncte în zilele ocupate. */
function MiniLuna({ data, selected, onSelect }: { data: LunaCal; selected: string; onSelect: (d: string) => void }) {
  const first = `${selected.slice(0, 7)}-01`;
  const start = mondayOf(first);
  const ocupate = new Set(data.events.map((e) => e.date));
  return (
    <div className="px-1">
      <div className="mb-1 flex items-center justify-between">
        <span className="pl-2 font-sans text-[1rem] font-semibold text-ink first-letter:uppercase">
          {LUNI_LUNGI[Number(first.slice(5, 7)) - 1]} {first.slice(0, 4)}
        </span>
        <span className="flex">
          <button type="button" aria-label="Luna trecută" onClick={() => onSelect(lunaPlus(first, -1))} className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-cream-deep">
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <button type="button" aria-label="Luna viitoare" onClick={() => onSelect(lunaPlus(first, 1))} className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-cream-deep">
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </span>
      </div>
      <div className="grid grid-cols-7 text-center font-sans">
        {["L", "M", "M", "J", "V", "S", "D"].map((z, i) => (
          <span key={i} className={`pb-1 text-[0.72rem] font-semibold ${i === 6 ? "text-clay" : "text-ink-muted"}`}>
            {z}
          </span>
        ))}
        {Array.from({ length: 42 }, (_, i) => {
          const d = addDays(start, i);
          const alta = d.slice(0, 7) !== first.slice(0, 7);
          const azi = d === data.today;
          const ales = d === selected;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onSelect(d)}
              className={`relative mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[0.82rem] tabular-nums transition-colors ${
                azi ? "bg-periwinkle font-semibold text-cream" : ales ? "bg-ink/10 font-semibold text-ink" : alta ? "text-ink-muted/60" : isoWeekday(d) === 7 ? "text-clay" : "text-ink"
              } ${azi ? "" : "hover:bg-cream-deep"}`}
            >
              {Number(d.slice(8))}
              {ocupate.has(d) && !azi && <span className="absolute bottom-[3px] h-1 w-1 rounded-full bg-periwinkle" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Bara laterală, mereu la vedere pe ecranele late. */
export function BaraLaterala({
  data,
  selected,
  onSelect,
  onAdauga,
  ...meniu
}: MeniuProps & {
  data: LunaCal;
  selected: string;
  onSelect: (d: string) => void;
  onAdauga: () => void;
}) {
  return (
    <aside aria-label="Meniu" className="hidden w-[17.5rem] shrink-0 flex-col overflow-y-auto border-r border-ink/10 bg-cream-warm px-3 pb-6 pt-4 lg:flex">
      <button
        type="button"
        onClick={onAdauga}
        className="mb-5 flex items-center gap-3 self-start rounded-[1.1rem] bg-periwinkle py-3.5 pl-4 pr-6 font-sans text-[1.05rem] font-semibold text-cream shadow-[0_10px_30px_-12px_rgba(110,133,103,0.9)] transition-colors hover:bg-ink"
      >
        <span className="text-[1.5rem] leading-none">+</span>
        Adăugare
      </button>
      <MiniLuna data={data} selected={selected} onSelect={onSelect} />
      <div className="my-3 border-t-2 border-dotted border-ink/15" />
      <Meniu {...meniu} mic />
    </aside>
  );
}
