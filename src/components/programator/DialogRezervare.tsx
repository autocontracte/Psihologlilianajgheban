"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Ban, Check, Repeat, RotateCcw, Trash2, X } from "lucide-react";
import {
  CANCEL_FEE,
  CANCEL_FREE_HOURS,
  DAY_END,
  DAY_START,
  KIND_LABEL,
  addDays,
  daysLabel,
  lateToCancel,
  longDate,
  minToTime,
  mondayOf,
  ownerSegments,
  shortDate,
  type Reservation,
  type Week,
} from "@/lib/programator/reguli";
import { AlegeData } from "./Calendar";
import { Interval, clashOf, type Busy } from "./Interval";
import { butonPericol, butonPlin, butonSimplu, camp, cere, eticheta, type Me } from "./comun";

export type Draft =
  | { mode: "new"; roomId: string; date: string; start: number; end: number }
  | { mode: "edit"; res: Reservation };

type Created = { created: number; skipped: { date: string; reason: string }[] };

const REPETARI: [number, string][] = [
  [0, "O dată"],
  [1, "În fiecare săptămână"],
  [2, "La 2 săptămâni"],
];

export function DialogRezervare({
  draft,
  week,
  me,
  onClose,
  onDone,
}: {
  draft: Draft;
  week: Week;
  me: Me;
  onClose: () => void;
  /** după o salvare sau o ștergere; `notice` e mesajul de arătat deasupra grilei */
  onDone: (notice?: string) => void;
}) {
  const res = draft.mode === "edit" ? draft.res : null;
  const init = res
    ? { roomId: res.roomId, date: res.date, start: res.start, end: res.end }
    : (draft as Extract<Draft, { mode: "new" }>);

  const [roomId, setRoomId] = useState(init.roomId);
  const [date, setDate] = useState(init.date);
  const [start, setStart] = useState(init.start);
  const [end, setEnd] = useState(init.end);
  // un cont doar de administrare nu e în grilă, deci nu se poate propune pe el însuși
  const [personId, setPersonId] = useState(
    res?.personId ?? (week.people.some((p) => p.id === me.personId) ? (me.personId ?? "") : ""),
  );
  const [every, setEvery] = useState(0);
  const [until, setUntil] = useState(addDays(init.date, 13 * 7));
  const [note, setNote] = useState(res?.note ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [askDelete, setAskDelete] = useState(false);
  const [askCancel, setAskCancel] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  /* Rezervările zilei alese. Săptămâna deschisă în grilă le are deja; dacă ziua
     se mută în altă săptămână, se cer de la server. */
  const [other, setOther] = useState<Week | null>(null);
  const dayWeek = other && mondayOf(date) === other.start ? other : week;
  const known = mondayOf(date) === dayWeek.start;
  useEffect(() => {
    if (mondayOf(date) === week.start || mondayOf(date) === other?.start) return;
    let alive = true;
    cere<Week>(`/api/programator/saptamana?start=${date}`)
      .then((w) => alive && setOther(w))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [date, week.start, other?.start]);

  const people = useMemo(() => new Map(week.people.map((p) => [p.id, p])), [week.people]);
  const owner = res ? people.get(res.personId) : null;
  const mine = !!res && res.personId === me.personId;
  const canEdit = !res || me.manager || (mine && res.date >= week.today);
  /* Anularea: doar ședințele chiriașilor se plătesc, deci doar la ele contează
     cât de târziu e. În ultimele 24 de ore, chiriașul nu mai poate muta
     ședința, doar o poate anula. */
  const renter = owner?.kind === "CHIRIAS";
  const late = !!res && lateToCancel(res.date, res.start);
  const cancelled = !!res?.cancelledAt;
  const locked = !!res && !me.manager && renter && late;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* Ce e ocupat într-un cabinet în ziua aleasă: rezervările altora (și ale
     tale) plus, în zilele proprietarului, tot ce n-a eliberat el. */
  const dayRes = useMemo(
    () => (known ? dayWeek.reservations.filter((x) => x.date === date && x.id !== res?.id && !x.cancelledAt) : []),
    [known, dayWeek, date, res?.id],
  );

  const segsIn = (room: Week["rooms"][number]) =>
    ownerSegments(
      room,
      date,
      known ? dayWeek.releases.filter((x) => x.roomId === room.id && x.date === date) : [],
    );

  function busyIn(room: Week["rooms"][number]): Busy[] {
    const who = people.get(room.ownerId ?? "");
    const held = segsIn(room).map((x) => ({
      a: x.start,
      b: x.end,
      label: who?.name ?? "proprietar",
      color: who?.color ?? "#ddd",
    }));
    return dayRes
      .filter((x) => x.roomId === room.id)
      .map((x) => ({
        a: x.start,
        b: x.end,
        label: people.get(x.personId)?.name ?? "ocupat",
        color: people.get(x.personId)?.color ?? "#ddd",
      }))
      .concat(held);
  }

  const room = week.rooms.find((r) => r.id === roomId) ?? week.rooms[0];
  const roomBusy = busyIn(room);

  // același om nu poate fi în două cabinete la aceeași oră
  const elsewhere = dayRes.find(
    (x) => x.personId === personId && x.roomId !== roomId && x.start < end && x.end > start,
  );
  const person = people.get(personId);
  const problem = elsewhere
    ? `${person?.name ?? "Persoana"} are deja ${week.rooms.find((r) => r.id === elsewhere.roomId)?.name ?? "alt cabinet"}, ${minToTime(elsewhere.start)}–${minToTime(elsewhere.end)}`
    : null;
  const blocked = !!clashOf(roomBusy, start, end) || !!problem;

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!personId) {
      setError("Alege cine ocupă cabinetul.");
      return;
    }
    if (blocked) {
      setError("Intervalul ales nu e liber. Alege alte ore sau alt cabinet.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (res) {
        await cere(`/api/programator/rezervari/${res.id}`, "PATCH", { roomId, personId, date, start, end, note });
        onDone();
      } else {
        const out = await cere<Created>("/api/programator/rezervari", "POST", {
          roomId,
          personId,
          date,
          start,
          end,
          note,
          everyWeeks: every,
          until: every ? until : "",
        });
        onDone(
          out.skipped.length
            ? `Am creat ${out.created} ${out.created === 1 ? "rezervare" : "rezervări"}. Sărite, fiindcă intervalul era ocupat: ${out.skipped
                .map((s) => shortDate(s.date))
                .join(", ")}.`
            : out.created > 1
              ? `Am creat ${out.created} rezervări.`
              : undefined,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
      setBusy(false);
    }
  }

  async function remove(following: boolean) {
    if (!res) return;
    setBusy(true);
    setError("");
    try {
      await cere(`/api/programator/rezervari/${res.id}${following ? "?urmatoarele=1" : ""}`, "DELETE");
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
      setBusy(false);
    }
  }

  async function cancel(following: boolean) {
    if (!res) return;
    setBusy(true);
    setError("");
    try {
      const out = await cere<{ removed: number; charged: number }>(
        `/api/programator/rezervari/${res.id}/anulare${following ? "?urmatoarele=1" : ""}`,
        "POST",
        {},
      );
      const taxate =
        out.charged === 1
          ? `Ședința a fost anulată. Rămâne în grilă, tăiată: se plătește ${CANCEL_FEE}%.`
          : `${out.charged} ședințe au fost anulate târziu. Rămân în grilă, tăiate: se plătesc ${CANCEL_FEE}%.`;
      const gratuite =
        out.removed === 1 ? "Ședința a fost anulată fără cost." : `${out.removed} ședințe au fost anulate fără cost.`;
      onDone([out.removed ? gratuite : "", out.charged ? taxate : ""].filter(Boolean).join(" "));
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
      setBusy(false);
    }
  }

  async function restore() {
    if (!res) return;
    setBusy(true);
    setError("");
    try {
      await cere(`/api/programator/rezervari/${res.id}/anulare`, "DELETE");
      onDone("Ședința a fost repusă în grilă.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
      setBusy(false);
    }
  }

  /* Întrebarea de dinaintea anulării, cu urmarea spusă limpede. */
  const panouAnulare = res && (
    <div className="space-y-3 border-t border-ink/10 pt-4">
      <p className="font-sans text-[1.05rem] font-semibold text-ink">Anulezi ședința?</p>
      <p className={`px-4 py-3 font-sans text-[0.95rem] ${renter && late ? "bg-clay-pale text-clay" : "bg-periwinkle-pale text-ink"}`}>
        {renter && late
          ? `Mai sunt mai puțin de ${CANCEL_FREE_HOURS} de ore până la ședință. Cabinetul se eliberează, dar ședința rămâne trecută ca anulată și se plătește ${CANCEL_FEE}%.`
          : renter
            ? `Mai sunt peste ${CANCEL_FREE_HOURS} de ore până la ședință: anularea e fără cost, iar rezervarea dispare din grilă.`
            : "Rezervarea dispare din grilă."}
      </p>
      {res.series && renter && (
        <p className="font-sans text-[0.85rem] text-ink-muted">
          La repetări, fiecare zi se judecă separat: cele aflate la peste {CANCEL_FREE_HOURS} de ore se anulează fără cost.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {res.series ? (
          <>
            <button type="button" disabled={busy} onClick={() => cancel(false)} className={`${butonPericol} min-h-12`}>
              Doar {shortDate(res.date)}
            </button>
            <button type="button" disabled={busy} onClick={() => cancel(true)} className={`${butonPericol} min-h-12`}>
              Aceasta și cele următoare
            </button>
          </>
        ) : (
          <button type="button" disabled={busy} onClick={() => cancel(false)} className={`${butonPericol} min-h-12`}>
            {busy ? "Se anulează…" : "Da, anulează ședința"}
          </button>
        )}
        <button type="button" disabled={busy} onClick={() => setAskCancel(false)} className={`${butonSimplu} min-h-12`}>
          Renunță
        </button>
      </div>
    </div>
  );

  const cine = res && (
    <p className="flex items-center gap-3 font-sans text-[1rem]">
      <span className="inline-block h-5 w-5" style={{ background: owner?.color }} />
      <b>{owner?.name}</b>
      {owner && <span className="text-ink-soft">{KIND_LABEL[owner.kind]}</span>}
    </p>
  );
  const eroare = error && (
    <p role="alert" className="bg-clay-pale px-4 py-3 font-sans text-[0.95rem] text-clay">
      {error}
    </p>
  );

  const persons = week.people.filter((p) => p.active || p.id === res?.personId);
  const titlu = eticheta.replace("mb-1.5", "mb-2");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={res ? "Rezervare" : "Rezervare nouă"}
        className="max-h-[96dvh] w-full max-w-2xl overflow-y-auto bg-cream p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-ink">
              {res ? (cancelled ? "Ședință anulată" : canEdit && !locked ? "Modifică rezervarea" : "Rezervare") : "Rezervare nouă"}
            </h2>
            <p className="mt-1 font-sans text-[0.95rem] text-ink-soft">
              {room.name} · {longDate(date)} · {minToTime(start)}–{minToTime(end)}
            </p>
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

        {res && cancelled ? (
          <div className="space-y-4 font-sans text-[1rem]">
            {cine}
            <p className="bg-clay-pale px-4 py-3 text-clay">
              <b>Se plătește {res.cancelFee}% din ședință.</b> Cabinetul e liber la orele acestea și se poate rezerva.
            </p>
            <p className="text-[0.9rem] text-ink-soft">
              Anulată{" "}
              {new Date(res.cancelledAt!).toLocaleString("ro-RO", {
                timeZone: "Europe/Bucharest",
                weekday: "long",
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {res.cancelledBy ? `, de ${res.cancelledBy}` : ""}.
            </p>
            {res.note && <p className="text-ink-soft">{res.note}</p>}
            {eroare}
            <div className="flex flex-wrap gap-2 border-t border-ink/10 pt-4">
              {me.manager && (
                <>
                  <button type="button" disabled={busy} onClick={restore} className={`${butonPlin} min-h-12`}>
                    <RotateCcw className="h-4 w-4" />
                    Repune ședința
                  </button>
                  <button type="button" disabled={busy} onClick={() => remove(false)} className={`${butonPericol} min-h-12`}>
                    <Trash2 className="h-4 w-4" />
                    Șterge de tot (fără plată)
                  </button>
                </>
              )}
              <button type="button" disabled={busy} onClick={onClose} className={`${butonSimplu} min-h-12`}>
                Închide
              </button>
            </div>
          </div>
        ) : res && !canEdit ? (
          <div className="space-y-4 font-sans text-[1rem]">
            {cine}
            {res.note && <p className="text-ink-soft">{res.note}</p>}
            <p className="text-[0.88rem] text-ink-muted">
              {res.date < week.today && mine
                ? "Zilele trecute nu mai pot fi modificate."
                : "Doar cine a făcut rezervarea sau un administrator o poate modifica."}
            </p>
            <button type="button" onClick={onClose} className={butonSimplu}>
              Închide
            </button>
          </div>
        ) : res && locked ? (
          <div className="space-y-4 font-sans text-[1rem]">
            {cine}
            {res.note && <p className="text-ink-soft">{res.note}</p>}
            <p className="bg-periwinkle-pale px-4 py-3 text-ink">
              Mai sunt mai puțin de {CANCEL_FREE_HOURS} de ore până la ședință: nu mai poate fi mutată, doar anulată.
            </p>
            {eroare}
            {askCancel ? (
              panouAnulare
            ) : (
              <div className="flex flex-wrap gap-2 border-t border-ink/10 pt-4">
                <button type="button" onClick={() => setAskCancel(true)} className={`${butonPericol} min-h-12`}>
                  <Ban className="h-4 w-4" />
                  Anulează ședința
                </button>
                <button type="button" onClick={onClose} className={`${butonSimplu} min-h-12`}>
                  Închide
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={save} className="space-y-5">
            {/* Cine */}
            {me.manager ? (
              <div>
                <span className={titlu}>Cine</span>
                <div className="space-y-2">
                  {(["CENTRU", "CHIRIAS"] as const).map((kind) => {
                    const list = persons.filter((p) => p.kind === kind);
                    if (list.length === 0) return null;
                    return (
                      <div key={kind} className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                        {list.map((p) => {
                          const on = p.id === personId;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              aria-pressed={on}
                              onClick={() => setPersonId(p.id)}
                              className={`flex min-h-12 items-center gap-2 border-2 px-2.5 py-2 text-left font-sans text-[0.95rem] leading-tight transition-colors ${
                                on ? "border-ink bg-cream-warm font-semibold text-ink" : "border-ink/12 bg-cream-warm text-ink hover:border-ink/45"
                              }`}
                            >
                              <span
                                className="flex h-6 w-6 shrink-0 items-center justify-center"
                                style={{ background: p.color }}
                              >
                                {on && <Check className="h-4 w-4 text-ink" strokeWidth={3} />}
                              </span>
                              <span className="min-w-0">
                                {p.name}
                                {kind === "CENTRU" && (
                                  <small className="block text-[0.72rem] font-normal text-ink-muted">Therapy Home</small>
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="font-sans text-[1rem]">
                Pentru <b>{me.name}</b>
              </p>
            )}

            {/* Ziua */}
            <div>
              <span className={titlu}>Ziua</span>
              <AlegeData
                label="Ziua"
                value={date}
                today={week.today}
                min={me.manager ? undefined : week.today}
                onChange={setDate}
              />
            </div>

            {/* Cabinetul, cu starea fiecăruia în intervalul ales */}
            <div>
              <span className={titlu}>Cabinet</span>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {week.rooms.map((r) => {
                  const on = r.id === roomId;
                  const segs = segsIn(r);
                  // toată ziua a proprietarului: nu se poate alege; parțial eliberat: da
                  const owned = segs.length === 1 && segs[0].start === DAY_START && segs[0].end === DAY_END;
                  const c = clashOf(busyIn(r), start, end);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      aria-pressed={on}
                      disabled={owned}
                      onClick={() => setRoomId(r.id)}
                      className={`flex min-h-[4.25rem] flex-col items-start justify-center border-2 px-3 py-2 text-left font-sans transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${
                        on ? "border-ink bg-cream-warm" : "border-ink/12 bg-cream-warm hover:border-ink/45"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-[1rem] font-semibold text-ink">
                        {on && <Check className="h-4 w-4" strokeWidth={3} />}
                        {r.name}
                      </span>
                      <small className={`text-[0.78rem] leading-tight ${c ? "text-clay" : "text-periwinkle"}`}>
                        {owned
                          ? `${people.get(r.ownerId!)?.name ?? "Ocupat"}, ${daysLabel(r.ownerDays)}`
                          : c
                            ? `Ocupat: ${c.label}`
                            : "Liber"}
                      </small>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Orele */}
            <div>
              <span className={titlu}>Ora</span>
              <Interval
                start={start}
                end={end}
                busy={roomBusy}
                problem={problem}
                onChange={(a, b) => {
                  setStart(a);
                  setEnd(b);
                }}
              />
            </div>

            {!res && (
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
                    <p className="mt-1.5 font-sans text-[0.82rem] text-ink-muted">
                      Zilele în care intervalul e deja ocupat sunt sărite și îți spun care.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label htmlFor="rz-nota" className={titlu}>
                Notă (opțional)
              </label>
              <input
                id="rz-nota"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
                className={`${camp} h-12`}
              />
            </div>

            {res?.series && (
              <p className="font-sans text-[0.85rem] text-ink-muted">
                Face parte dintr-o repetare. Modificarea se aplică doar acestei zile.
              </p>
            )}

            {error && (
              <p role="alert" className="bg-clay-pale px-4 py-3 font-sans text-[0.95rem] text-clay">
                {error}
              </p>
            )}

            {askCancel ? (
              panouAnulare
            ) : askDelete ? (
              <div className="space-y-3 border-t border-ink/10 pt-4">
                <p className="font-sans text-[1rem]">Ce ștergi?</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={busy} onClick={() => remove(false)} className={butonPericol}>
                    Doar {shortDate(res!.date)}
                  </button>
                  <button type="button" disabled={busy} onClick={() => remove(true)} className={butonPericol}>
                    Aceasta și cele următoare
                  </button>
                  <button type="button" disabled={busy} onClick={() => setAskDelete(false)} className={butonSimplu}>
                    Renunță
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 border-t border-ink/10 pt-4">
                <button type="submit" disabled={busy || blocked} className={`${butonPlin} min-h-12 px-7`}>
                  {busy ? "Se salvează…" : res ? "Salvează" : "Rezervă"}
                </button>
                <button type="button" disabled={busy} onClick={onClose} className={`${butonSimplu} min-h-12`}>
                  Renunță
                </button>
                {res && (
                  <span className="ml-auto flex flex-wrap gap-2">
                    {/* Chiriașii anulează (din timp fără cost, târziu cu jumătate de preț) */}
                    {renter && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setAskCancel(true)}
                        className={`${butonPericol} min-h-12`}
                      >
                        <Ban className="h-4 w-4" />
                        Anulează ședința
                      </button>
                    )}
                    {/* Ștergerea fără urmă e doar a administratorilor, pentru rezervări greșite */}
                    {me.manager && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => (res.series ? setAskDelete(true) : remove(false))}
                        className={`${butonPericol} min-h-12`}
                        title="Șterge rezervarea fără urmă și fără plată"
                      >
                        <Trash2 className="h-4 w-4" />
                        Șterge
                      </button>
                    )}
                  </span>
                )}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
