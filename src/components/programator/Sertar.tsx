"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Columns3,
  Download,
  KeyRound,
  List,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { KIND_LABEL, type Month } from "@/lib/programator/reguli";
import type { Me } from "./comun";
import { bara, type Ascunse, type Vedere } from "./telefon";

/* Meniul lateral, ca în calendarul telefonului: vederile, apoi ce se vede
   (cabinetele și oamenii, cu bife în culoarea lor), apoi contul. */

const VEDERI: [Vedere, string, typeof Calendar][] = [
  ["an", "An", CalendarRange],
  ["luna", "Lună", CalendarDays],
  ["saptamana", "Săptămână", Columns3],
  ["zi", "Zi", Calendar],
  ["program", "Program", List],
];

const linie = "my-3 border-t-2 border-dotted border-ink/15";
const rand =
  "flex w-full items-center gap-4 rounded-[1rem] px-4 py-3.5 text-left font-sans text-[1.15rem] text-ink transition-colors hover:bg-cream-deep";

function Bifa({ on, color }: { on: boolean; color: string }) {
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
      style={{ borderColor: color, background: on ? color : "transparent" }}
    >
      {on && <Check className="h-4 w-4 text-cream" strokeWidth={3} />}
    </span>
  );
}

export function Sertar({
  open,
  onClose,
  vedere,
  onVedere,
  data,
  ascunse,
  onAscunse,
  me,
  install,
}: {
  open: boolean;
  onClose: () => void;
  vedere: Vedere;
  onVedere: (v: Vedere) => void;
  data: Month;
  ascunse: Ascunse;
  onAscunse: (a: Ascunse) => void;
  me: Me;
  /** promptul de instalare primit de la Chrome, dacă aplicația se poate instala */
  install: (() => void) | null;
}) {
  const [deschise, setDeschise] = useState<Record<string, boolean>>({ cab: true, CENTRU: true, CHIRIAS: true });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function comuta(kind: "rooms" | "people", id: string) {
    const list = ascunse[kind];
    onAscunse({ ...ascunse, [kind]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] });
  }

  function Sectiune({ id, titlu, children }: { id: string; titlu: string; children: React.ReactNode }) {
    const on = deschise[id] ?? true;
    return (
      <div>
        <button
          type="button"
          onClick={() => setDeschise({ ...deschise, [id]: !on })}
          aria-expanded={on}
          className={`${rand} justify-between`}
        >
          <span className="font-semibold">{titlu}</span>
          {on ? <ChevronUp className="h-5 w-5 text-ink-soft" /> : <ChevronDown className="h-5 w-5 text-ink-soft" />}
        </button>
        {on && <div className="pb-1">{children}</div>}
      </div>
    );
  }

  async function logout() {
    await fetch("/api/programator/logout", { method: "POST" });
    window.location.href = "/intra";
  }

  const oameni = data.people.filter((p) => p.active || data.reservations.some((r) => r.personId === p.id));

  return (
    <div className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-ink/35 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-label="Meniu"
        className={`absolute inset-y-0 left-0 flex w-[80%] max-w-[22rem] flex-col rounded-r-[1.75rem] bg-cream-warm shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-6 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex justify-end px-2 pt-2">
            <Link
              href={me.manager ? "/oameni" : "/cont"}
              aria-label="Setări"
              className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-cream-deep"
            >
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

          <Sectiune id="cab" titlu="Cabinete">
            {data.rooms.map((r) => (
              <button key={r.id} type="button" onClick={() => comuta("rooms", r.id)} className={rand}>
                <Bifa on={!ascunse.rooms.includes(r.id)} color="var(--color-periwinkle)" />
                {r.name}
              </button>
            ))}
          </Sectiune>

          {(["CENTRU", "CHIRIAS"] as const).map((kind) => {
            const list = oameni.filter((p) => p.kind === kind);
            if (list.length === 0) return null;
            return (
              <Sectiune key={kind} id={kind} titlu={kind === "CENTRU" ? KIND_LABEL.CENTRU : "Chiriași"}>
                {list.map((p) => (
                  <button key={p.id} type="button" onClick={() => comuta("people", p.id)} className={rand}>
                    <Bifa on={!ascunse.people.includes(p.id)} color={bara(p.color)} />
                    <span className="min-w-0 truncate">
                      {p.name}
                      {p.id === me.personId && <span className="text-ink-muted"> (tu)</span>}
                    </span>
                  </button>
                ))}
              </Sectiune>
            );
          })}

          <div className={linie} />

          {install && (
            <button type="button" onClick={install} className={`${rand} text-periwinkle`}>
              <Download className="h-6 w-6 shrink-0" />
              Instalează aplicația
            </button>
          )}
          {me.manager && (
            <Link href="/oameni" className={rand}>
              <Users className="h-6 w-6 shrink-0" />
              Oameni și cabinete
            </Link>
          )}
          {me.manager && (
            <Link href="/situatie" className={rand}>
              <ClipboardList className="h-6 w-6 shrink-0" />
              Situație lunară
            </Link>
          )}
          {me.personId && (
            <Link href="/cont" className={rand}>
              <KeyRound className="h-6 w-6 shrink-0" />
              Parola mea
            </Link>
          )}
          <button type="button" onClick={logout} className={`${rand} text-clay`}>
            <LogOut className="h-6 w-6 shrink-0" />
            Ieși
          </button>

          <p className="mt-4 px-4 font-sans text-[0.9rem] text-ink-muted">
            {me.name}
            <br />
            Programator cabinete · Therapy Home
          </p>
        </div>
      </aside>
    </div>
  );
}
