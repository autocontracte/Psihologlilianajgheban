"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Calendar,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Check,
  Columns3,
  Download,
  LayoutDashboard,
  List,
  LogOut,
  RefreshCw,
  Settings,
} from "lucide-react";
import { CULOARE, STRATURI, cere, type Strat, type Vedere } from "./comun";

/* Meniul lateral, ca în calendarul telefonului: vederile, apoi ce se vede
   (programările după status și Google Calendar), apoi panoul și contul. */

const VEDERI: [Vedere, string, typeof Calendar][] = [
  ["an", "An", CalendarRange],
  ["luna", "Lună", CalendarDays],
  ["saptamana", "Săptămână", Columns3],
  ["zi", "Zi", Calendar],
  ["program", "Program", List],
];

const linie = "my-3 border-t-2 border-dotted border-ink/15";
const rand =
  "flex w-full items-center gap-4 rounded-[1rem] px-4 py-3.5 text-left font-sans text-[1.15rem] text-ink transition-colors hover:bg-cream-deep disabled:opacity-60";

export function Sertar({
  open,
  onClose,
  vedere,
  onVedere,
  ascunse,
  onAscunse,
  google,
  onSincronizat,
  install,
}: {
  open: boolean;
  onClose: () => void;
  vedere: Vedere;
  onVedere: (v: Vedere) => void;
  ascunse: Strat[];
  onAscunse: (a: Strat[]) => void;
  google: boolean;
  onSincronizat: (msg: string) => void;
  /** promptul de instalare primit de la Chrome, dacă aplicația se poate instala */
  install: (() => void) | null;
}) {
  const [straturi, setStraturi] = useState(true);
  const [sync, setSync] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function sincronizeaza() {
    setSync(true);
    try {
      await cere("/api/calendar/sync", "POST");
      onSincronizat("Sincronizat cu Google Calendar.");
    } catch (err) {
      onSincronizat(err instanceof Error ? err.message : "Sincronizarea nu a reușit.");
    } finally {
      setSync(false);
      onClose();
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/cont/autentificare?redirect=/calendar";
  }

  return (
    <div className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
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

          <div className={linie} />

          {VEDERI.map(([v, label, Icon]) => (
            <button
              key={v}
              type="button"
              aria-current={vedere === v ? "page" : undefined}
              onClick={() => {
                onVedere(v);
                onClose();
              }}
              className={`${rand} ${vedere === v ? "bg-cream-deep font-semibold" : ""}`}
            >
              <Icon className="h-6 w-6 shrink-0" />
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
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                    style={{ borderColor: CULOARE[s], background: on ? CULOARE[s] : "transparent" }}
                  >
                    {on && <Check className="h-4 w-4 text-cream" strokeWidth={3} />}
                  </span>
                  {label}
                </button>
              );
            })}

          <div className={linie} />

          {install && (
            <button type="button" onClick={install} className={`${rand} text-periwinkle`}>
              <Download className="h-6 w-6 shrink-0" />
              Instalează aplicația
            </button>
          )}
          {google && (
            <button type="button" onClick={sincronizeaza} disabled={sync} className={rand}>
              <RefreshCw className={`h-6 w-6 shrink-0 ${sync ? "animate-spin" : ""}`} />
              {sync ? "Se sincronizează…" : "Sincronizează acum"}
            </button>
          )}
          <Link href="/admin/programari" className={rand}>
            <CalendarClock className="h-6 w-6 shrink-0" />
            Toate programările
          </Link>
          <Link href="/admin" className={rand}>
            <LayoutDashboard className="h-6 w-6 shrink-0" />
            Panoul de administrare
          </Link>
          <button type="button" onClick={logout} className={`${rand} text-clay`}>
            <LogOut className="h-6 w-6 shrink-0" />
            Ieși
          </button>

          <p className="mt-4 px-4 font-sans text-[0.9rem] text-ink-muted">
            Calendarul Lilianei
            <br />
            {google ? "Legat de Google Calendar" : "Google Calendar nu e conectat"}
          </p>
        </div>
      </aside>
    </div>
  );
}
