"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Repeat, Trash2, X } from "lucide-react";
import {
  DAY_END,
  DAY_START,
  KIND_LABEL,
  STEP,
  addDays,
  daysLabel,
  longDate,
  minToTime,
  ownerDay,
  shortDate,
  type Reservation,
  type Week,
} from "@/lib/programator/reguli";
import { butonPericol, butonPlin, butonSimplu, camp, cere, eticheta, type Me } from "./comun";

export type Draft =
  | { mode: "new"; roomId: string; date: string; start: number; end: number }
  | { mode: "edit"; res: Reservation };

const ORE: number[] = [];
for (let m = DAY_START; m <= DAY_END; m += STEP) ORE.push(m);

type Created = { created: number; skipped: { date: string; reason: string }[] };

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
  const panel = useRef<HTMLDivElement>(null);

  const owner = res ? week.people.find((p) => p.id === res.personId) : null;
  const canEdit = !res || me.manager || (res.personId === me.personId && res.date >= week.today);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    panel.current?.querySelector<HTMLElement>("[data-primul]")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const persons = week.people.filter((p) => p.active || p.id === res?.personId);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!personId) {
      setError("Alege cine ocupă cabinetul.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (res) {
        await cere(`/api/programator/rezervari/${res.id}`, "PATCH", {
          roomId,
          personId,
          date,
          start,
          end,
          note,
        });
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

  const roomName = week.rooms.find((r) => r.id === roomId)?.name ?? "Cabinet";

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
        className="max-h-[94dvh] w-full max-w-lg overflow-y-auto bg-cream p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] sm:p-8"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-ink">
              {res ? (canEdit ? "Modifică rezervarea" : "Rezervare") : "Rezervare nouă"}
            </h2>
            <p className="mt-1 font-sans text-[0.9rem] text-ink-soft">
              {roomName} · {longDate(date)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Închide"
            className="p-1.5 text-ink-soft transition-colors hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!canEdit && res ? (
          <div className="space-y-4 font-sans text-[0.98rem]">
            <p className="flex items-center gap-3">
              <span className="inline-block h-4 w-4" style={{ background: owner?.color }} />
              <b>{owner?.name}</b>
              {owner && <span className="text-ink-soft">{KIND_LABEL[owner.kind]}</span>}
            </p>
            <p>
              {minToTime(res.start)}–{minToTime(res.end)}
            </p>
            {res.note && <p className="text-ink-soft">{res.note}</p>}
            <p className="text-[0.85rem] text-ink-muted">
              {res.date < week.today && res.personId === me.personId
                ? "Zilele trecute nu mai pot fi modificate."
                : "Doar cine a făcut rezervarea sau un administrator o poate modifica."}
            </p>
            <button type="button" onClick={onClose} className={butonSimplu}>
              Închide
            </button>
          </div>
        ) : (
          <form onSubmit={save} className="space-y-4">
            {me.manager ? (
              <div>
                <label htmlFor="rz-cine" className={eticheta}>
                  Cine
                </label>
                <select
                  id="rz-cine"
                  data-primul
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  className={camp}
                  required
                >
                  <option value="">Alege…</option>
                  {(["CENTRU", "CHIRIAS"] as const).map((kind) => (
                    <optgroup key={kind} label={kind === "CENTRU" ? "Therapy Home" : "Chiriași"}>
                      {persons
                        .filter((p) => p.kind === kind)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            ) : (
              <p className="font-sans text-[0.98rem]">
                Pentru <b>{me.name}</b>
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="rz-cabinet" className={eticheta}>
                  Cabinet
                </label>
                <select
                  id="rz-cabinet"
                  data-primul={me.manager ? undefined : true}
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className={camp}
                >
                  {week.rooms.map((r) => {
                    const taken = ownerDay(r, date);
                    const who = week.people.find((p) => p.id === r.ownerId)?.name;
                    return (
                      <option key={r.id} value={r.id} disabled={taken}>
                        {r.name}
                        {taken ? ` — ${who}, ${daysLabel(r.ownerDays)}` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label htmlFor="rz-data" className={eticheta}>
                  Ziua
                </label>
                <input
                  id="rz-data"
                  type="date"
                  value={date}
                  min={me.manager ? undefined : week.today}
                  onChange={(e) => e.target.value && setDate(e.target.value)}
                  className={camp}
                  required
                />
              </div>
              <div>
                <label htmlFor="rz-de-la" className={eticheta}>
                  De la
                </label>
                <select
                  id="rz-de-la"
                  value={start}
                  onChange={(e) => {
                    const s = Number(e.target.value);
                    // păstrează durata când se mută începutul
                    setEnd(Math.min(DAY_END, s + (end - start)));
                    setStart(s);
                  }}
                  className={camp}
                >
                  {ORE.slice(0, -1).map((m) => (
                    <option key={m} value={m}>
                      {minToTime(m)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="rz-pana-la" className={eticheta}>
                  Până la
                </label>
                <select
                  id="rz-pana-la"
                  value={end}
                  onChange={(e) => setEnd(Number(e.target.value))}
                  className={camp}
                >
                  {ORE.filter((m) => m > start).map((m) => (
                    <option key={m} value={m}>
                      {minToTime(m)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!res && (
              <div>
                <span className={eticheta}>
                  <Repeat className="mr-1 inline h-3.5 w-3.5" />
                  Se repetă
                </span>
                <div className="grid grid-cols-3 border border-ink/20">
                  {[
                    [0, "O dată"],
                    [1, "Săptămânal"],
                    [2, "La 2 săptămâni"],
                  ].map(([v, label]) => (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={every === v}
                      onClick={() => setEvery(v as number)}
                      className={`px-2 py-2.5 font-sans text-[0.85rem] transition-colors ${
                        every === v ? "bg-periwinkle text-cream" : "bg-cream-warm text-ink hover:bg-periwinkle-pale"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {every > 0 && (
                  <div className="mt-3">
                    <label htmlFor="rz-pana" className={eticheta}>
                      Până pe (inclusiv)
                    </label>
                    <input
                      id="rz-pana"
                      type="date"
                      value={until}
                      min={date}
                      max={addDays(date, 366)}
                      onChange={(e) => e.target.value && setUntil(e.target.value)}
                      className={camp}
                      required
                    />
                  </div>
                )}
              </div>
            )}

            <div>
              <label htmlFor="rz-nota" className={eticheta}>
                Notă (opțional)
              </label>
              <input
                id="rz-nota"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
                className={camp}
              />
            </div>

            {res?.series && (
              <p className="font-sans text-[0.82rem] text-ink-muted">
                Face parte dintr-o repetare. Modificarea se aplică doar acestei zile.
              </p>
            )}

            {error && (
              <p role="alert" className="bg-clay-pale px-4 py-3 font-sans text-[0.9rem] text-clay">
                {error}
              </p>
            )}

            {askDelete ? (
              <div className="space-y-3 border-t border-ink/10 pt-4">
                <p className="font-sans text-[0.95rem]">Ce ștergi?</p>
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
                <button type="submit" disabled={busy} className={butonPlin}>
                  {busy ? "Se salvează…" : res ? "Salvează" : "Rezervă"}
                </button>
                <button type="button" disabled={busy} onClick={onClose} className={butonSimplu}>
                  Renunță
                </button>
                {res && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => (res.series ? setAskDelete(true) : remove(false))}
                    className={`${butonPericol} ml-auto`}
                  >
                    <Trash2 className="h-4 w-4" />
                    Șterge
                  </button>
                )}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
