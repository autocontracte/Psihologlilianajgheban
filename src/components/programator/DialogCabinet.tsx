"use client";

import { useEffect, useState } from "react";
import { DoorOpen, Lock, Repeat, X } from "lucide-react";
import {
  DAY_END,
  DAY_START,
  addDays,
  daysLabel,
  longDate,
  minToTime,
  ownerSegments,
  shortDate,
  type Release,
  type Room,
  type Week,
} from "@/lib/programator/reguli";
import { AlegeData } from "./Calendar";
import { Interval } from "./Interval";
import { butonPericol, butonPlin, butonSimplu, cere, eticheta, type Me } from "./comun";

/* Fereastra unui cabinet într-o zi a proprietarului (Diana pe 2, Liliana pe 4):
   proprietarul — sau un administrator — eliberează un interval, ca să-l poată
   rezerva alții, și îl poate lua înapoi cât timp nu l-a rezervat nimeni. */

const REPETARI: [number, string][] = [
  [0, "Doar în ziua aceasta"],
  [1, "În fiecare săptămână"],
  [2, "La 2 săptămâni"],
];

export function DialogCabinet({
  room,
  date,
  from,
  week,
  me,
  onClose,
  onDone,
}: {
  room: Room;
  date: string;
  /** ora de la care s-a deschis (rândul pe care s-a dat clic) */
  from: number;
  week: Week;
  me: Me;
  onClose: () => void;
  onDone: (notice?: string) => void;
}) {
  const people = new Map(week.people.map((p) => [p.id, p]));
  const owner = people.get(room.ownerId ?? "");
  const allowed = me.manager || (!!me.personId && me.personId === room.ownerId);
  const releases = week.releases.filter((x) => x.roomId === room.id && x.date === date);
  const segs = ownerSegments(room, date, releases);
  const ownerName = owner?.name ?? "proprietar";

  // implicit: de la rândul apăsat până la capătul blocului ținut de proprietar
  const seg = segs.find((x) => x.start <= from && x.end > from) ?? segs[0];
  const [start, setStart] = useState(seg ? Math.max(seg.start, Math.min(from, seg.end - 30)) : DAY_START);
  const [end, setEnd] = useState(seg ? seg.end : DAY_END);
  const [every, setEvery] = useState(0);
  const [until, setUntil] = useState(addDays(date, 13 * 7));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ask, setAsk] = useState<Release | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const overlap = releases.find((x) => x.start < end && x.end > start);
  const problem = overlap
    ? `Deja eliberat: ${minToTime(overlap.start)}–${minToTime(overlap.end)}`
    : null;

  /** Rezervările altora făcute în intervalele eliberate. */
  const inside = (r: Release) =>
    week.reservations.filter(
      (x) => !x.cancelledAt && x.roomId === room.id && x.date === date && x.start < r.end && x.end > r.start,
    );

  async function release() {
    setBusy(true);
    setError("");
    try {
      const out = await cere<{ created: number; skipped: string[] }>("/api/programator/eliberari", "POST", {
        roomId: room.id,
        date,
        start,
        end,
        everyWeeks: every,
        until: every ? until : "",
      });
      onDone(
        out.created > 1
          ? `Am eliberat ${room.name} ${minToTime(start)}–${minToTime(end)} în ${out.created} zile.${
              out.skipped.length ? ` Sărite: ${out.skipped.map(shortDate).join(", ")}.` : ""
            }`
          : `${room.name} e liber ${longDate(date)}, ${minToTime(start)}–${minToTime(end)}. Acum îl pot rezerva și alții.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
      setBusy(false);
    }
  }

  async function takeBack(r: Release, following: boolean) {
    setBusy(true);
    setError("");
    try {
      const out = await cere<{ removed: number; kept: string[] }>(
        `/api/programator/eliberari/${r.id}${following ? "?urmatoarele=1" : ""}`,
        "DELETE",
      );
      onDone(
        out.kept.length
          ? `Am luat înapoi ${out.removed} ${out.removed === 1 ? "interval" : "intervale"}. Au rămas libere, fiindcă sunt rezervate: ${out.kept.join("; ")}.`
          : `${room.name} e din nou ocupat de ${ownerName} ${minToTime(r.start)}–${minToTime(r.end)}.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
      setBusy(false);
    }
  }

  const titlu = eticheta.replace("mb-1.5", "mb-2");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${room.name}, ${longDate(date)}`}
        className="max-h-[96dvh] w-full max-w-2xl overflow-y-auto bg-cream p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-ink">{room.name}</h2>
            <p className="mt-1 font-sans text-[0.95rem] text-ink-soft first-letter:uppercase">{longDate(date)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Închide"
            className="flex h-11 w-11 shrink-0 items-center justify-center border border-ink/15 text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="flex items-center gap-3 font-sans text-[1rem]">
          <span className="inline-block h-5 w-5" style={{ background: owner?.color }} />
          <span>
            Rezervat pentru <b>{ownerName}</b>, {daysLabel(room.ownerDays)}.
          </span>
        </p>

        {/* Ce e eliberat azi */}
        <div className="mt-4">
          <span className={titlu}>Eliberat în ziua aceasta</span>
          {releases.length === 0 ? (
            <p className="bg-cream-warm px-4 py-3 font-sans text-[0.95rem] text-ink-soft">
              <Lock className="mr-1.5 inline h-4 w-4" />
              Nimic — e ocupat de {ownerName} toată ziua.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {releases.map((r) => {
                const taken = inside(r);
                return (
                  <li key={r.id} className="bg-cream-warm px-4 py-2.5 font-sans">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[1rem]">
                        <b className="tabular-nums">
                          {minToTime(r.start)}–{minToTime(r.end)}
                        </b>{" "}
                        <span className="text-periwinkle">liber pentru alții</span>
                        {r.series && <span className="ml-1.5 text-[0.82rem] text-ink-muted">(se repetă)</span>}
                      </span>
                      {allowed && ask?.id !== r.id && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => (r.series ? setAsk(r) : takeBack(r, false))}
                          className={`${butonSimplu} min-h-10 py-1.5`}
                        >
                          Ocupă din nou
                        </button>
                      )}
                    </div>
                    {taken.length > 0 && (
                      <p className="mt-1 text-[0.85rem] text-ink-soft">
                        Rezervat:{" "}
                        {taken
                          .map((x) => `${people.get(x.personId)?.name ?? "cineva"} ${minToTime(x.start)}–${minToTime(x.end)}`)
                          .join(", ")}
                      </p>
                    )}
                    {ask?.id === r.id && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button type="button" disabled={busy} onClick={() => takeBack(r, false)} className={`${butonPericol} min-h-10`}>
                          Doar {shortDate(r.date)}
                        </button>
                        <button type="button" disabled={busy} onClick={() => takeBack(r, true)} className={`${butonPericol} min-h-10`}>
                          Și săptămânile următoare
                        </button>
                        <button type="button" disabled={busy} onClick={() => setAsk(null)} className={`${butonSimplu} min-h-10`}>
                          Renunță
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {!allowed ? (
          <div className="mt-5 space-y-4">
            <p className="font-sans text-[0.92rem] text-ink-muted">
              Doar {ownerName} sau un administrator poate elibera cabinetul în zilele acestea.
            </p>
            <button type="button" onClick={onClose} className={`${butonSimplu} min-h-12`}>
              Închide
            </button>
          </div>
        ) : segs.length === 0 ? (
          <div className="mt-5 space-y-4">
            <p className="font-sans text-[0.95rem] text-ink-soft">Toată ziua e eliberată.</p>
            {error && (
              <p role="alert" className="bg-clay-pale px-4 py-3 font-sans text-[0.95rem] text-clay">
                {error}
              </p>
            )}
            <button type="button" onClick={onClose} className={`${butonSimplu} min-h-12`}>
              Închide
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-5 border-t border-ink/10 pt-5">
            <div>
              <span className={titlu}>
                <DoorOpen className="mr-1 inline h-4 w-4" />
                Eliberează un interval
              </span>
              <Interval
                start={start}
                end={end}
                busy={[]}
                problem={problem}
                okText="Se eliberează pentru rezervări"
                onChange={(a, b) => {
                  setStart(a);
                  setEnd(b);
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setStart(DAY_START);
                  setEnd(DAY_END);
                }}
                className="mt-1.5 border border-ink/20 bg-cream-warm px-3 py-2 font-sans text-[0.88rem] text-ink transition-colors hover:border-ink"
              >
                Toată ziua
              </button>
            </div>

            <div>
              <span className={titlu}>
                <Repeat className="mr-1 inline h-3.5 w-3.5" />
                Se repetă
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {REPETARI.map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={every === v}
                    onClick={() => setEvery(v)}
                    className={`min-h-12 border-2 px-2 py-2 font-sans text-[0.9rem] leading-tight transition-colors ${
                      every === v
                        ? "border-periwinkle bg-periwinkle font-semibold text-cream"
                        : "border-ink/12 bg-cream-warm text-ink hover:border-ink/45"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {every > 0 && (
                <div className="mt-3">
                  <span className={titlu}>Până pe (inclusiv)</span>
                  <AlegeData
                    label="Până pe"
                    value={until < date ? date : until}
                    today={week.today}
                    min={date}
                    max={addDays(date, 366)}
                    onChange={setUntil}
                  />
                </div>
              )}
            </div>

            {error && (
              <p role="alert" className="bg-clay-pale px-4 py-3 font-sans text-[0.95rem] text-clay">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-2 border-t border-ink/10 pt-4">
              <button type="button" disabled={busy || !!problem} onClick={release} className={`${butonPlin} min-h-12 px-7`}>
                {busy ? "Se salvează…" : "Eliberează"}
              </button>
              <button type="button" disabled={busy} onClick={onClose} className={`${butonSimplu} min-h-12`}>
                Renunță
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
