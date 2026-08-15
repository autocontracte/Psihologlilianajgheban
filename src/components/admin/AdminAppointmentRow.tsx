"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  STATUS_LABEL,
  STATUS_STYLE,
  FORMAT_LABEL,
  type Format,
  type Status,
} from "@/lib/types";

export type AdminAppointment = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  hasAccount: boolean;
  serviceName: string;
  duration: number;
  dateLabel: string;
  timeLabel: string;
  format: Format;
  status: Status;
  notes: string | null;
  adminNote: string | null;
  isPast: boolean;
};

/** Ce statusuri au sens după cel curent. */
const NEXT: Record<Status, Status[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  CANCELLED: ["PENDING"],
  COMPLETED: ["CONFIRMED"],
};

const ACTION_LABEL: Record<Status, string> = {
  PENDING: "Repune în așteptare",
  CONFIRMED: "Confirmă",
  CANCELLED: "Anulează",
  COMPLETED: "Marchează finalizată",
};

const ACTION_STYLE: Record<Status, string> = {
  PENDING: "border-ink/20 text-ink-soft hover:border-ink/50 hover:text-ink",
  CONFIRMED: "border-sage/40 text-sage hover:bg-sage hover:text-cream",
  CANCELLED: "border-clay/40 text-clay hover:bg-clay hover:text-cream",
  COMPLETED:
    "border-periwinkle/40 text-periwinkle hover:bg-periwinkle hover:text-cream",
};

export function AdminAppointmentRow({ a }: { a: AdminAppointment }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState(a.adminNote ?? "");

  async function patch(payload: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/appointments/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Modificarea nu a reușit.");
      setNoteOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article
      className={[
        "rounded-[1.75rem] bg-cream p-6 transition-opacity",
        a.isPast && a.status !== "CONFIRMED" ? "opacity-70" : "",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`rounded-pill px-3.5 py-1.5 font-sans text-[0.75rem] tracking-[0.02em] ${STATUS_STYLE[a.status]}`}
            >
              {STATUS_LABEL[a.status]}
            </span>
            <span className="rounded-pill bg-ink/6 px-3 py-1.5 font-sans text-[0.75rem] tracking-[0.02em] text-ink-soft">
              {FORMAT_LABEL[a.format]}
            </span>
            {!a.hasAccount && (
              <span className="rounded-pill bg-clay-pale px-3 py-1.5 font-sans text-[0.75rem] tracking-[0.02em] text-clay">
                Fără cont
              </span>
            )}
          </div>

          <h3 className="mt-3.5 font-display text-[1.2rem] leading-snug text-ink">
            {a.dateLabel}, ora {a.timeLabel}
          </h3>

          <p className="mt-1.5 font-sans text-[0.87rem] text-ink-soft">
            {a.serviceName} · {a.duration} min
          </p>

          <div className="mt-3.5 flex flex-wrap gap-x-5 gap-y-1 font-sans text-[0.82rem]">
            <span className="text-ink">{a.clientName}</span>
            <a
              href={`tel:${a.clientPhone}`}
              className="text-ink-soft transition-colors hover:text-periwinkle"
            >
              {a.clientPhone}
            </a>
            <a
              href={`mailto:${a.clientEmail}`}
              className="text-ink-soft transition-colors hover:text-periwinkle"
            >
              {a.clientEmail}
            </a>
          </div>

          {a.notes && (
            <div className="mt-4 rounded-[1rem] bg-cream-warm px-4 py-3">
              <p className="font-sans text-[0.75rem] tracking-[0.02em] text-ink-muted">
                De la client
              </p>
              <p className="mt-1.5 font-sans text-[0.82rem] leading-relaxed text-ink-soft">
                {a.notes}
              </p>
            </div>
          )}

          {a.adminNote && !noteOpen && (
            <div className="mt-3 rounded-[1rem] bg-periwinkle-pale/50 px-4 py-3">
              <p className="font-sans text-[0.75rem] tracking-[0.02em] text-periwinkle">
                Nota mea
              </p>
              <p className="mt-1.5 font-sans text-[0.82rem] leading-relaxed text-ink-soft">
                {a.adminNote}
              </p>
            </div>
          )}
        </div>

        {/* Acțiuni */}
        <div className="flex shrink-0 flex-col items-stretch gap-2">
          {NEXT[a.status].map((next) => (
            <button
              key={next}
              type="button"
              disabled={busy}
              onClick={() => patch({ status: next })}
              className={`rounded-pill border px-4 py-2 font-sans text-[0.78rem] tracking-[0.02em] transition-all duration-400 disabled:opacity-50 ${ACTION_STYLE[next]}`}
            >
              {ACTION_LABEL[next]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setNoteOpen((v) => !v)}
            className="rounded-pill px-4 py-2 font-sans text-[0.78rem] tracking-[0.02em] text-ink-muted transition-colors duration-300 hover:text-ink"
          >
            {a.adminNote ? "Editează nota" : "Adaugă notă"}
          </button>
        </div>
      </div>

      {noteOpen && (
        <div className="mt-5 border-t border-ink/10 pt-5">
          <textarea
            rows={3}
            maxLength={2000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notă internă — vizibilă doar pentru tine."
            className="w-full resize-none rounded-[1.25rem] border border-ink/15 bg-cream-warm px-5 py-3.5 font-sans text-[0.87rem] text-ink placeholder:text-ink-muted focus:border-periwinkle focus:outline-none focus:ring-4 focus:ring-periwinkle/12"
          />
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => patch({ adminNote: note })}
              className="rounded-pill bg-periwinkle px-5 py-2.5 font-sans text-[0.78rem] tracking-[0.02em] text-cream transition-colors duration-400 hover:bg-ink disabled:opacity-60"
            >
              {busy ? "Se salvează…" : "Salvează"}
            </button>
            <button
              type="button"
              onClick={() => {
                setNote(a.adminNote ?? "");
                setNoteOpen(false);
              }}
              className="font-sans text-[0.78rem] tracking-[0.02em] text-ink-muted transition-colors hover:text-ink"
            >
              Renunță
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-[1rem] bg-clay-pale px-4 py-3 font-sans text-[0.8rem] text-clay">
          {error}
        </p>
      )}
    </article>
  );
}
