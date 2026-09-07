"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { STATUS_LABEL, STATUS_STYLE, FORMAT_LABEL, type Format, type Status } from "@/lib/types";

export type ClientAppointment = {
  id: string;
  serviceName: string;
  duration: number;
  startsAtISO: string;
  dateLabel: string;
  timeLabel: string;
  format: Format;
  status: Status;
  notes: string | null;
  canCancel: boolean;
  /** Lipsește dacă plata online nu e activată. */
  plata?: { platita: boolean; suma: number } | null;
};

export function AppointmentList({
  appointments,
  emptyText,
}: {
  appointments: ClientAppointment[];
  emptyText: string;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [platesc, setPlatesc] = useState<string | null>(null);

  async function plateste(id: string) {
    setPlatesc(id);
    setError("");
    try {
      const res = await fetch("/api/plati/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Plata nu a putut fi pornită.");
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
      setPlatesc(null);
    }
  }

  async function cancel(id: string) {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "PATCH" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Anularea nu a reușit.");
      setConfirmId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
    } finally {
      setBusyId(null);
    }
  }

  if (appointments.length === 0) {
    return (
      <p className="rounded-none bg-cream-warm px-6 py-8 text-center font-sans text-[0.88rem] text-ink-soft">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="space-y-3.5">
      {error && (
        <p className="rounded-none bg-clay-pale px-4 py-3 font-sans text-[0.82rem] text-clay">
          {error}
        </p>
      )}

      {appointments.map((a, i) => (
        <motion.article
          key={a.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: Math.min(i * 0.06, 0.3), ease: [0.22, 1, 0.36, 1] }}
          className="rounded-none bg-cream p-6 shadow-[0_18px_44px_-32px_rgba(56,62,82,0.5)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span
                className={`inline-flex rounded-none px-3.5 py-1.5 font-sans text-[0.75rem] tracking-[0.02em] ${STATUS_STYLE[a.status]}`}
              >
                {STATUS_LABEL[a.status]}
              </span>
              <h3 className="mt-3.5 font-display text-[1.2rem] leading-snug text-ink">
                {a.serviceName}
              </h3>
              <p className="mt-1.5 font-sans text-[0.85rem] text-ink-soft">
                {a.dateLabel}, ora {a.timeLabel} · {a.duration} min ·{" "}
                {FORMAT_LABEL[a.format]}
              </p>
              {a.notes && (
                <p className="mt-3 rounded-none bg-cream-warm px-4 py-3 font-sans text-[0.8rem] leading-relaxed text-ink-soft">
                  {a.notes}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              {a.plata && !a.plata.platita && (
                <button
                  type="button"
                  onClick={() => plateste(a.id)}
                  disabled={platesc === a.id}
                  className="bg-periwinkle px-4 py-2 font-sans text-[0.82rem] text-cream transition-colors hover:bg-ink disabled:opacity-60"
                >
                  {platesc === a.id
                    ? "Se deschide…"
                    : `Plătește ${(a.plata.suma / 100).toFixed(0)} lei`}
                </button>
              )}

              {a.plata?.platita && (
                <span className="bg-periwinkle-pale px-3 py-1.5 font-sans text-[0.78rem] text-periwinkle">
                  Plătită
                </span>
              )}

            {a.canCancel && (
              <div>
                {confirmId === a.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => cancel(a.id)}
                      disabled={busyId === a.id}
                      className="rounded-none bg-clay px-4 py-2 font-sans text-[0.78rem] tracking-[0.02em] text-cream transition-opacity duration-300 disabled:opacity-60"
                    >
                      {busyId === a.id ? "Se anulează…" : "Da, anulează"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      className="font-sans text-[0.78rem] tracking-[0.02em] text-ink-muted transition-colors hover:text-ink"
                    >
                      Renunță
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(a.id)}
                    className="rounded-none border border-ink/20 px-4 py-2 font-sans text-[0.78rem] tracking-[0.02em] text-ink-soft transition-all duration-400 hover:border-clay/60 hover:text-clay"
                  >
                    Anulează
                  </button>
                )}
              </div>
            )}
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
