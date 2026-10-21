"use client";

import { useEffect, useState } from "react";
import { CalendarDays, CreditCard, ExternalLink, Mail, MapPin, MessageSquareText, Phone, StickyNote, Trash2, X } from "lucide-react";
import { longDate, minToTime, type Ev } from "@/lib/calendarTelefon";
import { STATUS_LABEL, type Status } from "@/lib/types";
import { cere, culoare, durata, idGoogle } from "./comun";

/* Ce se deschide la atingerea unui eveniment: o foaie de jos, cu tot ce
   trebuie știut și cu acțiunile de pe loc (confirmare, anulare, sunat). */

export function Detalii({ e, onClose, onDone }: { e: Ev; onClose: () => void; onDone: (msg: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [intreaba, setIntreaba] = useState(false);
  const [nota, setNota] = useState(e.kind === "prog" ? (e.adminNote ?? "") : "");

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function fa(fn: () => Promise<unknown>, msg: string) {
    setBusy(true);
    setError("");
    try {
      await fn();
      onDone(msg);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nu a mers.");
      setBusy(false);
    }
  }

  const status = (s: Status, msg: string) => fa(() => cere(`/api/admin/appointments/${e.id}`, "PATCH", { status: s }), msg);

  const cand = e.allDay ? "Toată ziua" : `${minToTime(e.start)}–${minToTime(e.end % (24 * 60))} · ${durata(e.end - e.start)}`;
  const linie = "flex items-start gap-4 px-5 py-3 font-sans text-[1.05rem] text-ink";
  const buton = "flex flex-1 items-center justify-center gap-2 rounded-full py-3.5 font-sans text-[1.05rem] font-semibold transition-colors disabled:opacity-60";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/35 sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-label={e.title}
        onClick={(ev) => ev.stopPropagation()}
        className="cal-foaie flex max-h-[88dvh] w-full max-w-lg flex-col rounded-t-[1.75rem] bg-cream pb-[max(1rem,env(safe-area-inset-bottom))] sm:rounded-[1.75rem]"
      >
        <div className="flex items-start gap-3 px-5 pb-2 pt-5">
          <span className="mt-2 h-4 w-4 shrink-0 rounded-full" style={{ background: culoare(e) }} />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-[1.6rem] leading-tight text-ink">{e.title}</h2>
            <p className="mt-0.5 font-sans text-[0.95rem] text-ink-soft">
              {e.kind === "prog" ? STATUS_LABEL[e.status] : e.free ? "Google Calendar · marcat liber" : "Google Calendar"}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Închide" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-cream-deep">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-2">
          <div className={linie}>
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-ink-soft" />
            <span>
              <span className="first-letter:uppercase">{longDate(e.date)}</span>
              <br />
              <span className="text-ink-soft">{cand}</span>
            </span>
          </div>

          {e.kind === "prog" && (
            <>
              <div className={linie}>
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-ink-soft" />
                <span>
                  {e.service}
                  <br />
                  <span className="text-ink-soft">{e.format === "ONLINE" ? "Online" : "În cabinet"}</span>
                </span>
              </div>
              <div className={linie}>
                <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-ink-soft" />
                <span>{e.paid ? "Plătită online" : e.paymentMethod === "ONLINE" ? "Plată online, neîncheiată" : "Plata la cabinet"}</span>
              </div>
              {e.client.phone && (
                <a href={`tel:${e.client.phone.replace(/\s+/g, "")}`} className={`${linie} hover:bg-cream-deep`}>
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-periwinkle" />
                  <span className="text-periwinkle underline-offset-2 hover:underline">{e.client.phone}</span>
                </a>
              )}
              {e.client.email && (
                <a href={`mailto:${e.client.email}`} className={`${linie} hover:bg-cream-deep`}>
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-periwinkle" />
                  <span className="min-w-0 break-all text-periwinkle">{e.client.email}</span>
                </a>
              )}
              {e.notes && (
                <div className={linie}>
                  <MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-ink-soft" />
                  <span className="whitespace-pre-line text-ink-soft">„{e.notes}”</span>
                </div>
              )}
              <label className={linie}>
                <StickyNote className="mt-3 h-5 w-5 shrink-0 text-ink-soft" />
                <textarea
                  value={nota}
                  onChange={(ev) => setNota(ev.target.value)}
                  maxLength={2000}
                  rows={2}
                  placeholder="Notă internă (o vezi doar tu)"
                  className="min-w-0 flex-1 resize-none rounded-[0.9rem] bg-cream-warm px-3 py-2.5 text-[1rem] text-ink placeholder:text-ink-muted focus:outline-none focus:ring-4 focus:ring-periwinkle/20"
                />
              </label>
              {nota !== (e.adminNote ?? "") && (
                <div className="px-5 pb-2 pl-[3.75rem]">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => fa(() => cere(`/api/admin/appointments/${e.id}`, "PATCH", { adminNote: nota }), "Nota a fost salvată.")}
                    className="rounded-full bg-ink px-5 py-2.5 font-sans text-[0.95rem] font-semibold text-cream"
                  >
                    Salvează nota
                  </button>
                </div>
              )}
            </>
          )}

          {e.kind === "google" && e.link && (
            <a href={e.link} target="_blank" rel="noopener noreferrer" className={`${linie} hover:bg-cream-deep`}>
              <ExternalLink className="mt-0.5 h-5 w-5 shrink-0 text-periwinkle" />
              <span className="text-periwinkle">Deschide în Google Calendar</span>
            </a>
          )}

          {error && <p role="alert" className="mx-5 mt-2 rounded-[1rem] bg-clay-pale px-4 py-3 font-sans text-[0.98rem] text-clay">{error}</p>}
        </div>

        {/* Acțiunile */}
        <div className="space-y-2 px-4 pt-2">
          {e.kind === "prog" && !intreaba && (
            <div className="flex gap-2">
              {e.status === "PENDING" && (
                <button type="button" disabled={busy} onClick={() => status("CONFIRMED", `Programarea e confirmată.${e.client.email ? " Clientul a fost anunțat pe email." : ""}`)} className={`${buton} bg-periwinkle text-cream hover:bg-ink`}>
                  Confirmă
                </button>
              )}
              {e.status === "CONFIRMED" && (
                <button type="button" disabled={busy} onClick={() => status("COMPLETED", "Ședința e marcată finalizată.")} className={`${buton} border border-ink/20 text-ink hover:border-ink`}>
                  Finalizată
                </button>
              )}
              {e.status !== "COMPLETED" && (
                <button type="button" disabled={busy} onClick={() => setIntreaba(true)} className={`${buton} border border-clay/40 text-clay hover:bg-clay hover:text-cream`}>
                  Anulează
                </button>
              )}
            </div>
          )}
          {e.kind === "google" && !intreaba && (
            <button type="button" disabled={busy} onClick={() => setIntreaba(true)} className={`${buton} w-full border border-clay/40 text-clay hover:bg-clay hover:text-cream`}>
              <Trash2 className="h-5 w-5" />
              Șterge din Google Calendar
            </button>
          )}
          {intreaba && (
            <div className="rounded-[1.25rem] bg-clay-pale p-4">
              <p className="font-sans text-[1rem] text-ink">
                {e.kind === "prog"
                  ? `Sigur anulezi programarea?${e.client.email ? " Clientul primește un email," : ""} Evenimentul dispare din Google Calendar.`
                  : "Sigur ștergi evenimentul din Google Calendar?"}
              </p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => setIntreaba(false)} className={`${buton} border border-ink/20 bg-cream text-ink`}>
                  Nu
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    e.kind === "prog"
                      ? status("CANCELLED", "Programarea a fost anulată.")
                      : fa(() => cere(`/api/admin/calendar/eveniment/${encodeURIComponent(idGoogle(e))}`, "DELETE"), "Evenimentul a fost șters.")
                  }
                  className={`${buton} bg-clay text-cream`}
                >
                  {busy ? "…" : e.kind === "prog" ? "Da, anulează" : "Da, șterge"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
