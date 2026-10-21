"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Briefcase, Clock, Mail, MapPin, Phone, StickyNote } from "lucide-react";
import { PAS, ZI_END, ZI_START, minToTime, phoneDate, type LunaCal } from "@/lib/calendarTelefon";
import { Calendar } from "@/components/programator/Calendar";
import { CULOARE, cere, durata, oraImplicita } from "./comun";

/* Adăugarea, ca în calendarul telefonului: „Programare" pentru un client
   (intră confirmată, ajunge și în Google Calendar) sau „Eveniment", scris
   direct în Google Calendar și care ocupă ora pe site. Fiecare rând deschide
   sub el alegerea lui, cu butoane mari. */

type Fel = "prog" | "ev";
type Alegere = null | "serviciu" | "data" | "start" | "end";

const DURATE = [30, 45, 50, 60, 90, 120, 180];

export type Propunere = { date: string; start?: number };

export function Formular({
  data,
  propunere,
  onClose,
  onDone,
}: {
  data: LunaCal;
  propunere: Propunere;
  onClose: () => void;
  onDone: (msg: string, date: string) => void;
}) {
  const [fel, setFel] = useState<Fel>("prog");
  const [nume, setNume] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [serviceId, setServiceId] = useState(data.services[0]?.id ?? "");
  const [format, setFormat] = useState<"CABINET" | "ONLINE">("CABINET");
  const [titlu, setTitlu] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [date, setDate] = useState(propunere.date);
  const s0 = propunere.start ?? oraImplicita(propunere.date, data.today);
  const [start, setStart] = useState(s0);
  const serviciu = data.services.find((s) => s.id === serviceId);
  const [end, setEnd] = useState(Math.min(s0 + (serviciu?.duration ?? 50), 24 * 60));
  const [nota, setNota] = useState("");
  const [alegere, setAlegere] = useState<Alegere>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [peste, setPeste] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const ev = fel === "ev";
  const toata = ev && allDay;

  /* Ce mai e în ziua aleasă la ora aleasă (doar dacă ziua e în luna încărcată). */
  const suprapus = useMemo(() => {
    if (toata || date < data.start || date > data.end) return null;
    return data.events.find((e) => e.date === date && !e.allDay && !(e.kind === "google" && e.free) && e.start < end && e.end > start) ?? null;
  }, [data, date, start, end, toata]);

  const gata = (ev ? true : !!nume.trim() && !!serviceId) && (toata || end > start);

  function alege(x: Alegere) {
    setAlegere(alegere === x ? null : x);
  }

  async function salveaza(force = false) {
    if (!gata) return;
    setBusy(true);
    setError("");
    setPeste(false);
    try {
      if (ev) {
        await cere("/api/admin/calendar/eveniment", "POST", { title: titlu, allDay, date, start, end, note: nota });
        onDone("Evenimentul e în Google Calendar.", date);
      } else {
        await cere("/api/admin/calendar/programare", "POST", {
          name: nume,
          phone: telefon,
          email,
          serviceId,
          format,
          date,
          start,
          end,
          note: nota,
          force,
        });
        onDone("Programarea e salvată și apare în Google Calendar.", date);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Nu am putut salva.";
      setError(msg);
      // ceva pus în Google se poate ocupa oricum, dacă Liliana vrea
      setPeste(!ev && (err as { status?: number }).status === 409 && msg.includes("Google"));
      setBusy(false);
    }
  }

  const randBaza = "flex w-full items-center gap-4 px-5 text-left font-sans text-ink";
  const separator = <div className="mx-5 border-t border-ink/10" />;
  const camp = "min-w-0 flex-1 bg-transparent text-[1.25rem] text-ink placeholder:text-ink-muted focus:outline-none";
  const buton = (on: boolean) =>
    `flex h-12 items-center justify-center rounded-[0.9rem] border font-sans text-[1.05rem] tabular-nums transition-colors ${
      on ? "border-periwinkle bg-periwinkle text-cream" : "border-ink/15 bg-cream text-ink hover:border-ink/40"
    }`;
  const ora = (on: boolean) =>
    `mt-1 rounded-[0.8rem] px-3 py-1 font-sans text-[1.6rem] font-semibold tabular-nums ${on ? "bg-periwinkle-pale text-periwinkle" : "text-ink hover:bg-cream-deep"}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-cream sm:bg-ink/35 sm:p-6" role="dialog" aria-modal="true" aria-label="Adăugare">
      <div className="relative flex w-full max-w-lg flex-col overflow-hidden bg-cream sm:rounded-[1.75rem] sm:shadow-2xl">
        <div className="flex-1 overflow-y-auto px-3 pb-32 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-4">
          {/* Programare / Eveniment, ca Eveniment / Memento */}
          <div className="mx-auto mb-5 flex w-full max-w-[22rem] rounded-full bg-cream-deep p-1">
            {(
              [
                ["prog", "Programare"],
                ["ev", "Eveniment"],
              ] as const
            ).map(([f, label]) => (
              <button
                key={f}
                type="button"
                aria-pressed={fel === f}
                disabled={f === "ev" && !data.google.activ}
                onClick={() => {
                  setFel(f);
                  setAlegere(null);
                  setError("");
                }}
                className={`flex-1 rounded-full py-2.5 font-sans text-[1.2rem] font-semibold transition-colors disabled:opacity-40 ${fel === f ? "bg-ink text-cream" : "text-ink-muted"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="rounded-[1.6rem] bg-cream-warm py-2">
            {/* Titlul: numele clientului sau al evenimentului */}
            <div className={`${randBaza} py-5`}>
              <input
                autoFocus
                value={ev ? titlu : nume}
                onChange={(e) => (ev ? setTitlu(e.target.value) : setNume(e.target.value))}
                maxLength={ev ? 200 : 120}
                placeholder={ev ? "Titlu" : "Numele clientului"}
                className={`${camp} text-[1.6rem]`}
              />
              <span className="h-7 w-7 shrink-0 rounded-full" style={{ background: ev ? CULOARE.google : CULOARE.CONFIRMED }} />
            </div>
            {separator}

            {!ev && (
              <>
                <label className={`${randBaza} py-4`}>
                  <Phone className="h-6 w-6 shrink-0 text-ink-soft" />
                  <input type="tel" inputMode="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="Telefon" className={camp} />
                </label>
                {separator}
                <label className={`${randBaza} py-4`}>
                  <Mail className="h-6 w-6 shrink-0 text-ink-soft" />
                  <input type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (opțional)" className={camp} />
                </label>
                {separator}
                <button type="button" onClick={() => alege("serviciu")} className={`${randBaza} py-4`}>
                  <Briefcase className="h-6 w-6 shrink-0 text-ink-soft" />
                  <span className="min-w-0 flex-1 truncate text-[1.25rem]">{serviciu?.name ?? "Serviciul"}</span>
                </button>
                {alegere === "serviciu" && (
                  <div className="grid gap-2 px-4 pb-4">
                    {data.services.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setServiceId(s.id);
                          setEnd(Math.min(start + s.duration, 24 * 60));
                          setAlegere(null);
                        }}
                        className={`${buton(s.id === serviceId)} h-auto justify-between px-4 py-3 text-left`}
                      >
                        <span>{s.name}</span>
                        <span className="text-[0.9rem] opacity-80">{s.duration} min</span>
                      </button>
                    ))}
                  </div>
                )}
                {separator}
                <div className={`${randBaza} py-3`}>
                  <MapPin className="h-6 w-6 shrink-0 text-ink-soft" />
                  <div className="flex flex-1 rounded-full bg-cream-deep p-1">
                    {(
                      [
                        ["CABINET", "În cabinet"],
                        ["ONLINE", "Online"],
                      ] as const
                    ).map(([f, label]) => (
                      <button
                        key={f}
                        type="button"
                        aria-pressed={format === f}
                        onClick={() => setFormat(f)}
                        className={`flex-1 rounded-full py-2 font-sans text-[1.05rem] font-semibold ${format === f ? "bg-cream-warm text-ink shadow-sm" : "text-ink-muted"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {separator}
              </>
            )}

            {ev && (
              <>
                <label className={`${randBaza} cursor-pointer py-4`}>
                  <Clock className="h-6 w-6 shrink-0 text-ink-soft" />
                  <span className="flex-1 text-[1.25rem]">Toată ziua</span>
                  <input type="checkbox" className="peer sr-only" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
                  <span className="relative h-8 w-14 shrink-0 rounded-full bg-ink/20 transition-colors after:absolute after:left-1 after:top-1 after:h-6 after:w-6 after:rounded-full after:bg-cream after:shadow after:transition-transform peer-checked:bg-periwinkle peer-checked:after:translate-x-6 peer-focus-visible:ring-4 peer-focus-visible:ring-periwinkle/30" />
                </label>
              </>
            )}

            {/* De la → Până la */}
            <div className="flex items-start justify-between gap-2 px-4 pb-3 pt-2">
              <div className="flex flex-1 flex-col items-center">
                <button type="button" onClick={() => alege("data")} className="rounded-[0.8rem] px-2 py-1 text-center font-sans text-[1.3rem] leading-snug text-ink hover:bg-cream-deep">
                  {phoneDate(date)}
                </button>
                {!toata && (
                  <button type="button" onClick={() => alege("start")} className={ora(alegere === "start")}>
                    {minToTime(start)}
                  </button>
                )}
              </div>
              <ArrowRight className="mt-3 h-6 w-6 shrink-0 text-ink-soft" />
              <div className="flex flex-1 flex-col items-center">
                <span className="px-2 py-1 text-center font-sans text-[1.3rem] leading-snug text-ink">{phoneDate(date)}</span>
                {!toata && (
                  <button type="button" onClick={() => alege("end")} className={ora(alegere === "end")}>
                    {minToTime(end % (24 * 60))}
                  </button>
                )}
              </div>
            </div>
            {!toata && <p className="pb-2 text-center font-sans text-[0.95rem] text-ink-soft">{durata(end - start)}</p>}
            {suprapus && (
              <p className="mx-4 mb-3 rounded-[0.9rem] bg-sage-pale px-4 py-2.5 text-center font-sans text-[0.95rem] text-ink">
                La ora asta ai deja: <b>{suprapus.title}</b>, {minToTime(suprapus.start)}–{minToTime(suprapus.end % (24 * 60))}
              </p>
            )}

            {alegere === "data" && (
              <div className="mx-4 mb-4 rounded-[1rem] bg-cream p-3">
                <Calendar
                  value={date}
                  today={data.today}
                  onChange={(d) => {
                    setDate(d);
                    setAlegere(null);
                  }}
                />
              </div>
            )}
            {alegere === "start" && (
              <div className="mx-4 mb-4 grid grid-cols-4 gap-2">
                {Array.from({ length: (ZI_END - ZI_START) / (PAS / 2) }, (_, i) => ZI_START + i * (PAS / 2)).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setEnd(Math.min(24 * 60, m + (end - start)));
                      setStart(m);
                      setAlegere(null);
                    }}
                    className={buton(m === start)}
                  >
                    {minToTime(m)}
                  </button>
                ))}
              </div>
            )}
            {alegere === "end" && (
              <div className="mx-4 mb-4 grid grid-cols-3 gap-2">
                {DURATE.filter((d) => start + d <= 24 * 60).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setEnd(start + d);
                      setAlegere(null);
                    }}
                    className={`${buton(end - start === d)} h-auto flex-col py-2`}
                  >
                    <span>{minToTime((start + d) % (24 * 60))}</span>
                    <span className="text-[0.82rem] opacity-80">{durata(d)}</span>
                  </button>
                ))}
              </div>
            )}
            {separator}

            <label className={`${randBaza} py-4`}>
              <StickyNote className="h-6 w-6 shrink-0 text-ink-soft" />
              <input value={nota} maxLength={2000} onChange={(e) => setNota(e.target.value)} placeholder={ev ? "Note" : "Notă internă"} className={camp} />
            </label>
          </div>

          {!data.google.activ && <p className="mx-2 mt-4 font-sans text-[0.95rem] text-ink-muted">Google Calendar nu e conectat pe server, deci evenimentele nu se pot adăuga de aici.</p>}
          {error && (
            <div role="alert" className="mx-2 mt-4 rounded-[1rem] bg-clay-pale px-4 py-3 font-sans text-[1rem] text-clay">
              {error}
              {peste && (
                <button type="button" onClick={() => salveaza(true)} className="mt-2 block font-semibold text-ink underline underline-offset-2">
                  Salvează oricum
                </button>
              )}
            </div>
          )}
        </div>

        {/* Anulare | Salvare */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="pointer-events-auto flex items-center rounded-full bg-cream-warm px-2 py-1 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.35)]">
            <button type="button" onClick={onClose} className="px-7 py-3.5 font-sans text-[1.3rem] font-semibold text-ink">
              Anulare
            </button>
            <span className="h-6 w-px bg-ink/15" />
            <button type="button" onClick={() => salveaza()} disabled={!gata || busy} className="px-7 py-3.5 font-sans text-[1.3rem] font-semibold text-periwinkle disabled:text-ink-muted">
              {busy ? "Se salvează…" : "Salvare"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
