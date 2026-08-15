"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { WEEKDAYS } from "@/lib/types";

export type Window = {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
};

export type Blocked = { id: string; date: string; reason: string | null };

const input =
  "rounded-[1rem] border border-ink/15 bg-cream-warm px-4 py-2.5 font-sans text-[0.85rem] text-ink focus:border-periwinkle focus:outline-none focus:ring-4 focus:ring-periwinkle/12";

export function ScheduleManager({
  windows,
  blocked,
  todayStr,
}: {
  windows: Window[];
  blocked: Blocked[];
  todayStr: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [weekday, setWeekday] = useState(1);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("20:00");

  const [blockDate, setBlockDate] = useState("");
  const [blockReason, setBlockReason] = useState("");

  async function call(url: string, options: RequestInit) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch(url, options);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Operațiunea nu a reușit.");
      if (json.warning) setNotice(json.warning);
      router.refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  const byDay = WEEKDAYS.map((name, i) => ({
    name,
    index: i,
    items: windows.filter((w) => w.weekday === i),
  }));

  return (
    <div className="space-y-12">
      {(error || notice) && (
        <div className="space-y-3">
          {error && (
            <p className="rounded-[1rem] bg-clay-pale px-4 py-3 font-sans text-[0.82rem] text-clay">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-[1rem] bg-periwinkle-pale px-4 py-3 font-sans text-[0.82rem] text-periwinkle">
              {notice}
            </p>
          )}
        </div>
      )}

      {/* ---------------------------------------------- Program săptămânal */}
      <section>
        <h2 className="font-display text-2xl text-ink">Program săptămânal</h2>
        <p className="mt-2 font-sans text-[0.85rem] text-ink-soft">
          Intervalele în care se pot face programări. Orele libere se calculează
          automat din acestea, minus ședințele deja rezervate.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {byDay.map((d) => (
            <div key={d.name} className="rounded-[1.5rem] bg-cream p-5">
              <p className="font-sans text-[0.75rem] tracking-[0.02em] text-ink-muted">
                {d.name}
              </p>

              {d.items.length === 0 ? (
                <p className="mt-3 font-sans text-[0.85rem] text-ink-muted">
                  Închis
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {d.items.map((w) => (
                    <li
                      key={w.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="font-sans text-[0.92rem] text-ink">
                        {w.startTime} – {w.endTime}
                      </span>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          call(`/api/admin/availability?id=${w.id}`, {
                            method: "DELETE",
                          })
                        }
                        className="font-sans text-[0.8rem] text-ink-muted transition-colors duration-300 hover:text-clay disabled:opacity-50"
                        aria-label={`Șterge intervalul ${w.startTime}–${w.endTime}`}
                      >
                        Șterge
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Adăugare interval */}
        <div className="mt-6 rounded-[1.5rem] bg-cream p-6">
          <p className="font-sans text-[0.75rem] tracking-[0.02em] text-ink-muted">
            Adaugă un interval
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-[0.7rem] text-ink-soft">Ziua</span>
              <select
                value={weekday}
                onChange={(e) => setWeekday(Number(e.target.value))}
                className={input}
              >
                {WEEKDAYS.map((w, i) => (
                  <option key={w} value={i}>
                    {w}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-[0.7rem] text-ink-soft">De la</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={input}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-[0.7rem] text-ink-soft">Până la</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={input}
              />
            </label>

            <button
              type="button"
              disabled={busy}
              onClick={() =>
                call("/api/admin/availability", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ weekday, startTime, endTime }),
                })
              }
              className="rounded-pill bg-periwinkle px-6 py-2.5 font-sans text-[0.8rem] tracking-[0.02em] text-cream transition-colors duration-400 hover:bg-ink disabled:opacity-60"
            >
              Adaugă
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Zile libere */}
      <section>
        <h2 className="font-display text-2xl text-ink">Zile libere</h2>
        <p className="mt-2 font-sans text-[0.85rem] text-ink-soft">
          Zilele blocate nu apar deloc în calendarul de programare. Blocarea nu
          anulează automat ședințele deja stabilite în ziua respectivă.
        </p>

        <div className="mt-6 rounded-[1.5rem] bg-cream p-6">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-[0.7rem] text-ink-soft">Data</span>
              <input
                type="date"
                min={todayStr}
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                className={input}
              />
            </label>

            <label className="flex flex-1 flex-col gap-1.5">
              <span className="font-sans text-[0.7rem] text-ink-soft">
                Motiv (opțional)
              </span>
              <input
                type="text"
                maxLength={200}
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Concediu, curs, sărbătoare…"
                className={`${input} w-full`}
              />
            </label>

            <button
              type="button"
              disabled={busy || !blockDate}
              onClick={async () => {
                const ok = await call("/api/admin/blocked", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ date: blockDate, reason: blockReason }),
                });
                if (ok) {
                  setBlockDate("");
                  setBlockReason("");
                }
              }}
              className="rounded-pill bg-periwinkle px-6 py-2.5 font-sans text-[0.8rem] tracking-[0.02em] text-cream transition-colors duration-400 hover:bg-ink disabled:opacity-60"
            >
              Blochează ziua
            </button>
          </div>

          {blocked.length > 0 && (
            <ul className="mt-6 space-y-2.5 border-t border-ink/10 pt-5">
              {blocked.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-4">
                  <span className="font-sans text-[0.88rem] text-ink">
                    {b.date}
                    {b.reason && (
                      <span className="ml-2 text-ink-muted">— {b.reason}</span>
                    )}
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      call(`/api/admin/blocked?id=${b.id}`, { method: "DELETE" })
                    }
                    className="font-sans text-[0.8rem] text-ink-muted transition-colors duration-300 hover:text-clay disabled:opacity-50"
                  >
                    Deblochează
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
