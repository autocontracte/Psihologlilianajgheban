"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CircleAlert, Clock, MapPin, Repeat, StickyNote, User } from "lucide-react";
import { DAY_END, DAY_START, STEP, addDays, minToTime, phoneDate, type Month } from "@/lib/programator/reguli";
import { Calendar } from "./Calendar";
import { cere, type Me } from "./comun";
import { durata } from "./Interval";
import { aleProprietarului, bara, ocupat, oraImplicita, ore } from "./telefon";

/* Adăugarea, ca în calendarul telefonului: o foaie cu rânduri mari, fiecare
   deschide sub el alegerea lui (persoana, ziua, orele, cabinetul, repetarea).
   „Eliberare" e pentru proprietarii cabinetelor: dau altora ore din ziua lor. */

type Fel = "rez" | "elib";
type Alegere = null | "cine" | "data" | "start" | "end" | "cab" | "rep" | "until";

const REPETARI: [number, string][] = [
  [0, "Nu se repetă"],
  [1, "Săptămânal"],
  [2, "La 2 săptămâni"],
];

export type Propunere = { date: string; start?: number; end?: number; roomId?: string };

export function FormularNou({
  data,
  me,
  propunere,
  onClose,
  onDone,
}: {
  data: Month;
  me: Me;
  propunere: Propunere;
  onClose: () => void;
  onDone: (notice: string, date: string) => void;
}) {
  const people = useMemo(() => new Map(data.people.map((p) => [p.id, p])), [data.people]);
  const mele = data.rooms.filter((r) => r.ownerId && (me.manager || r.ownerId === me.personId));
  const poateElibera = mele.length > 0;

  const s0 = propunere.start ?? oraImplicita(propunere.date, data.today);
  const [fel, setFel] = useState<Fel>("rez");
  const [personId, setPersonId] = useState(data.people.some((p) => p.id === me.personId) ? (me.personId ?? "") : "");
  const [date, setDate] = useState(propunere.date);
  const [allDay, setAllDay] = useState(false);
  const [start, setStart] = useState(s0);
  const [end, setEnd] = useState(Math.min(propunere.end ?? s0 + 60, DAY_END));
  const [roomId, setRoomId] = useState(propunere.roomId ?? "");
  const [every, setEvery] = useState(0);
  const [until, setUntil] = useState(addDays(propunere.date, 13 * 7));
  const [note, setNote] = useState("");
  const [alegere, setAlegere] = useState<Alegere>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const a = allDay ? DAY_START : start;
  const b = allDay ? DAY_END : end;
  const inRange = date >= data.start && date <= data.end;

  /* Cabinetele, cu ce le ocupă la ora aleasă. Ziua se știe doar dacă e în luna încărcată. */
  const stare = useMemo(
    () =>
      new Map(
        data.rooms.map((r) => {
          if (!inRange) return [r.id, null];
          if (fel === "elib") {
            const segs = aleProprietarului(data, r, date);
            const tine = segs.some((s) => s.start <= a && s.end >= b);
            return [r.id, tine ? null : segs.length ? "Intervalul nu e ținut de proprietar" : "Nu e zi a proprietarului"];
          }
          return [r.id, ocupat(data, r, date, a, b, personId)];
        }),
      ),
    [data, date, a, b, personId, fel, inRange],
  );

  /* Dacă nu s-a ales un cabinet, primul liber la ora aleasă. */
  const lista = fel === "elib" ? mele : data.rooms;
  const room = lista.find((r) => r.id === roomId) ?? lista.find((r) => !stare.get(r.id)) ?? lista[0];
  const problema = room ? stare.get(room.id) : "Nu există cabinete.";
  const person = people.get(personId);
  const gata = !!room && !problema && b > a && (fel === "elib" || !!personId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function alege(x: Alegere) {
    setAlegere(alegere === x ? null : x);
  }

  async function salveaza() {
    if (!gata || !room) return;
    setBusy(true);
    setError("");
    try {
      const repetare = { everyWeeks: every, until: every ? until : "" };
      if (fel === "rez") {
        const r = await cere<{ created: number; skipped: { date: string; reason: string }[] }>(
          "/api/programator/rezervari",
          "POST",
          { roomId: room.id, personId, date, start: a, end: b, note, ...repetare },
        );
        const sarite = r.skipped.length ? ` ${r.skipped.length} zile au fost sărite, fiindcă erau ocupate.` : "";
        onDone(r.created > 1 ? `Am salvat ${r.created} rezervări.${sarite}` : `Rezervarea a fost salvată.${sarite}`, date);
      } else {
        await cere("/api/programator/eliberari", "POST", { roomId: room.id, date, start: a, end: b, ...repetare });
        onDone(`${room.name} e liber pentru alții, ${minToTime(a)}–${minToTime(b)}.`, date);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nu am putut salva.");
      setBusy(false);
    }
  }

  const randBaza = "flex w-full items-center gap-4 px-5 text-left font-sans text-ink";
  const separator = <div className="mx-5 border-t border-ink/10" />;
  const buton = (on: boolean) =>
    `flex h-12 items-center justify-center rounded-[0.9rem] border font-sans text-[1.05rem] tabular-nums transition-colors ${
      on ? "border-periwinkle bg-periwinkle text-cream" : "border-ink/15 bg-cream text-ink hover:border-ink/40"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-cream sm:bg-ink/35 sm:p-6" role="dialog" aria-modal="true" aria-label="Adăugare">
      <div className="relative flex w-full max-w-lg flex-col overflow-hidden bg-cream sm:rounded-[1.75rem] sm:shadow-2xl">
        <div className="flex-1 overflow-y-auto px-3 pb-32 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-4">
          {/* Rezervare / Eliberare, ca Eveniment / Memento */}
          {poateElibera ? (
            <div className="mx-auto mb-5 flex w-full max-w-[22rem] rounded-full bg-cream-deep p-1">
              {(
                [
                  ["rez", "Rezervare"],
                  ["elib", "Eliberare"],
                ] as const
              ).map(([f, label]) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={fel === f}
                  onClick={() => {
                    setFel(f);
                    setRoomId("");
                    setAlegere(null);
                  }}
                  className={`flex-1 rounded-full py-2.5 font-sans text-[1.2rem] font-semibold transition-colors ${
                    fel === f ? "bg-ink text-cream" : "text-ink-muted"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <p className="mb-5 text-center font-display text-[1.5rem] text-ink">Rezervare nouă</p>
          )}

          <div className="rounded-[1.6rem] bg-cream-warm py-2 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            {/* Cine — în locul titlului */}
            {fel === "rez" ? (
              <>
                <button
                  type="button"
                  disabled={!me.manager}
                  onClick={() => alege("cine")}
                  className={`${randBaza} py-5`}
                >
                  <span className={`min-w-0 flex-1 truncate text-[1.6rem] ${person ? "text-ink" : "text-ink-muted"}`}>
                    {person?.name ?? "Cine ocupă cabinetul?"}
                  </span>
                  <span className="h-7 w-7 shrink-0 rounded-full" style={{ background: bara(person?.color) }} />
                </button>
                {alegere === "cine" && (
                  <div className="grid gap-2 px-5 pb-4">
                    {data.people
                      .filter((p) => p.active)
                      .map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setPersonId(p.id);
                            setAlegere(null);
                          }}
                          className={`${buton(p.id === personId)} justify-start gap-3 px-4`}
                        >
                          <span className="h-4 w-4 rounded-full" style={{ background: bara(p.color) }} />
                          {p.name}
                        </button>
                      ))}
                  </div>
                )}
              </>
            ) : (
              <div className={`${randBaza} py-5`}>
                <User className="h-6 w-6 shrink-0 text-ink-soft" />
                <span className="text-[1.25rem]">Dau altora ore din ziua mea</span>
              </div>
            )}
            {separator}

            {/* Toată ziua */}
            <label className={`${randBaza} cursor-pointer py-4`}>
              <Clock className="h-6 w-6 shrink-0 text-ink-soft" />
              <span className="flex-1 text-[1.25rem]">Toată ziua</span>
              <input
                type="checkbox"
                className="peer sr-only"
                checked={allDay}
                onChange={(e) => {
                  setAllDay(e.target.checked);
                  setAlegere(null);
                }}
              />
              <span className="relative h-8 w-14 shrink-0 rounded-full bg-ink/20 transition-colors after:absolute after:left-1 after:top-1 after:h-6 after:w-6 after:rounded-full after:bg-cream after:shadow after:transition-transform peer-checked:bg-periwinkle peer-checked:after:translate-x-6 peer-focus-visible:ring-4 peer-focus-visible:ring-periwinkle/30" />
            </label>

            {/* De la → Până la */}
            <div className="flex items-start justify-between gap-2 px-4 pb-4 pt-1">
              <div className="flex flex-1 flex-col items-center">
                <button type="button" onClick={() => alege("data")} className="rounded-[0.8rem] px-2 py-1 text-center font-sans text-[1.3rem] leading-snug text-ink hover:bg-cream-deep">
                  {phoneDate(date)}
                </button>
                {!allDay && (
                  <button
                    type="button"
                    onClick={() => alege("start")}
                    className={`mt-1 rounded-[0.8rem] px-3 py-1 font-sans text-[1.6rem] font-semibold tabular-nums ${alegere === "start" ? "bg-periwinkle-pale text-periwinkle" : "text-ink hover:bg-cream-deep"}`}
                  >
                    {minToTime(start)}
                  </button>
                )}
              </div>
              <ArrowRight className="mt-3 h-6 w-6 shrink-0 text-ink-soft" />
              <div className="flex flex-1 flex-col items-center">
                <span className="px-2 py-1 text-center font-sans text-[1.3rem] leading-snug text-ink">{phoneDate(date)}</span>
                {!allDay && (
                  <button
                    type="button"
                    onClick={() => alege("end")}
                    className={`mt-1 rounded-[0.8rem] px-3 py-1 font-sans text-[1.6rem] font-semibold tabular-nums ${alegere === "end" ? "bg-periwinkle-pale text-periwinkle" : "text-ink hover:bg-cream-deep"}`}
                  >
                    {minToTime(end)}
                  </button>
                )}
              </div>
            </div>
            {!allDay && <p className="-mt-2 pb-3 text-center font-sans text-[0.95rem] text-ink-soft">{durata(b - a)}</p>}

            {alegere === "data" && (
              <div className="mx-4 mb-4 rounded-[1rem] bg-cream p-3">
                <Calendar
                  value={date}
                  today={data.today}
                  min={me.manager ? undefined : data.today}
                  onChange={(d) => {
                    setDate(d);
                    setAlegere(null);
                  }}
                />
              </div>
            )}
            {alegere === "start" && (
              <div className="mx-4 mb-4 grid grid-cols-4 gap-2">
                {ore(DAY_START, DAY_END - STEP).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      const len = end - start;
                      setStart(m);
                      setEnd(Math.min(DAY_END, m + Math.max(STEP, len)));
                      setAlegere("end");
                    }}
                    className={buton(m === start)}
                  >
                    {minToTime(m)}
                  </button>
                ))}
              </div>
            )}
            {alegere === "end" && (
              <div className="mx-4 mb-4 grid grid-cols-4 gap-2">
                {ore(start + STEP, DAY_END).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setEnd(m);
                      setAlegere(null);
                    }}
                    className={buton(m === end)}
                  >
                    {minToTime(m)}
                  </button>
                ))}
              </div>
            )}
            {separator}

            {/* Cabinetul — în locul „Locație" */}
            <button type="button" onClick={() => alege("cab")} className={`${randBaza} py-4`}>
              <MapPin className="h-6 w-6 shrink-0 text-ink-soft" />
              <span className="min-w-0 flex-1">
                <span className="block text-[1.25rem]">{room?.name ?? "Cabinet"}</span>
                {problema ? (
                  <span className="flex items-center gap-1.5 text-[0.95rem] text-clay">
                    <CircleAlert className="h-4 w-4 shrink-0" />
                    {problema}
                  </span>
                ) : inRange ? (
                  <span className="text-[0.95rem] text-periwinkle">Liber</span>
                ) : null}
              </span>
            </button>
            {alegere === "cab" && (
              <div className="grid gap-2 px-4 pb-4">
                {lista.map((r) => {
                  const why = stare.get(r.id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setRoomId(r.id);
                        setAlegere(null);
                      }}
                      className={`${buton(r.id === room?.id)} h-auto flex-col items-start px-4 py-2.5`}
                    >
                      <span className="font-semibold">{r.name}</span>
                      <span className={`text-[0.9rem] ${r.id === room?.id ? "text-cream/85" : why ? "text-clay" : "text-periwinkle"}`}>
                        {why ?? (inRange ? "Liber" : "")}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {separator}

            {/* Repetarea */}
            <button type="button" onClick={() => alege("rep")} className={`${randBaza} py-4`}>
              <Repeat className="h-6 w-6 shrink-0 text-ink-soft" />
              <span className={`text-[1.25rem] ${every ? "text-ink" : "text-ink-muted"}`}>
                {REPETARI.find(([n]) => n === every)?.[1]}
              </span>
            </button>
            {alegere === "rep" && (
              <div className="grid gap-2 px-4 pb-4">
                {REPETARI.map(([n, label]) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setEvery(n);
                      setAlegere(n ? "until" : null);
                    }}
                    className={`${buton(n === every)} justify-start px-4`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            {every > 0 && (
              <button type="button" onClick={() => alege("until")} className={`${randBaza} pb-4 pl-[4.25rem]`}>
                <span className="text-[1.05rem] text-ink-soft">
                  până pe <b className="font-semibold text-ink">{phoneDate(until)} {until.slice(0, 4)}</b>
                </span>
              </button>
            )}
            {alegere === "until" && (
              <div className="mx-4 mb-4 rounded-[1rem] bg-cream p-3">
                <Calendar
                  value={until}
                  today={data.today}
                  min={addDays(date, 7)}
                  onChange={(d) => {
                    setUntil(d);
                    setAlegere(null);
                  }}
                />
              </div>
            )}

            {fel === "rez" && (
              <>
                {separator}
                <label className={`${randBaza} py-4`}>
                  <StickyNote className="h-6 w-6 shrink-0 text-ink-soft" />
                  <input
                    value={note}
                    maxLength={200}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Note"
                    className="min-w-0 flex-1 bg-transparent text-[1.25rem] text-ink placeholder:text-ink-muted focus:outline-none"
                  />
                </label>
              </>
            )}
          </div>

          {error && (
            <p role="alert" className="mx-2 mt-4 rounded-[1rem] bg-clay-pale px-4 py-3 font-sans text-[1rem] text-clay">
              {error}
            </p>
          )}
        </div>

        {/* Anulare | Salvare */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="pointer-events-auto flex items-center rounded-full bg-cream-warm px-2 py-1 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.35)]">
            <button type="button" onClick={onClose} className="px-7 py-3.5 font-sans text-[1.3rem] font-semibold text-ink">
              Anulare
            </button>
            <span className="h-6 w-px bg-ink/15" />
            <button
              type="button"
              onClick={salveaza}
              disabled={!gata || busy}
              className="px-7 py-3.5 font-sans text-[1.3rem] font-semibold text-periwinkle disabled:text-ink-muted"
            >
              {busy ? "Se salvează…" : "Salvare"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
