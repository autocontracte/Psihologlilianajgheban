"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Reveal } from "../ui/Reveal";
import { IconArrow, IconCheck } from "../ui/Icons";

type Status = "idle" | "sending" | "sent" | "error";

const inputClass =
  "w-full rounded-[1.25rem] border border-ink/15 bg-cream-warm px-5 py-3.5 font-sans text-[0.9rem] text-ink placeholder:text-ink-muted transition-all duration-300 focus:border-periwinkle focus:bg-cream focus:outline-none focus:ring-4 focus:ring-periwinkle/12";

const labelClass =
  "mb-2 block font-sans text-[0.58rem] uppercase tracking-[0.22em] text-ink-muted";

const SERVICES = [
  "Psihoterapie individuală — adult",
  "Psihoterapie — adolescent",
  "Terapie pentru copil",
  "Consiliere parentală",
  "Evaluare clinică psihologică — copil / adolescent",
  "Evaluare clinică psihologică — adult",
  "Workshop / grup de dezvoltare personală",
  "Atelier experiențial (Sandtray)",
];

const SLOTS = [
  "Dimineața (10:00 – 12:00)",
  "Prânz (12:00 – 15:00)",
  "După-amiaza (15:00 – 18:00)",
  "Seara (18:00 – 20:00)",
];

export function BookingForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [format, setFormat] = useState<"cabinet" | "online">("cabinet");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      ...Object.fromEntries(fd),
      format,
      slots: fd.getAll("slots"),
    };

    try {
      const res = await fetch("/api/programari", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Cererea nu a putut fi trimisă.");

      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "A apărut o eroare neașteptată.",
      );
    }
  }

  if (status === "sent") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[2.5rem] bg-cream p-10 text-center shadow-[0_30px_70px_-40px_rgba(56,62,82,0.4)] lg:p-14"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-pale text-sage">
          <IconCheck className="h-7 w-7" strokeWidth={1.8} />
        </div>
        <h2 className="mt-7 font-display text-3xl text-ink">
          Cererea ta a fost trimisă
        </h2>
        <p className="mx-auto mt-4 max-w-md font-sans text-[0.92rem] leading-[1.9] text-ink-soft">
          Îți mulțumesc. Te contactez în cel mai scurt timp, de regulă în aceeași
          zi lucrătoare, ca să confirmăm împreună ziua și ora.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-8 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-periwinkle transition-colors duration-300 hover:text-ink"
        >
          Trimite altă cerere
        </button>
      </motion.div>
    );
  }

  return (
    <Reveal>
      <form
        onSubmit={handleSubmit}
        className="rounded-[2.5rem] bg-cream p-8 shadow-[0_30px_70px_-40px_rgba(56,62,82,0.4)] lg:p-12"
      >
        <h2 className="font-display text-2xl text-ink lg:text-3xl">
          Cerere de programare
        </h2>
        <p className="mt-2.5 font-sans text-[0.85rem] leading-relaxed text-ink-soft">
          Câmpurile marcate cu * sunt obligatorii.
        </p>

        <div className="mt-9 space-y-6">
          {/* Date personale */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="b-name" className={labelClass}>
                Nume și prenume *
              </label>
              <input
                id="b-name"
                name="name"
                required
                maxLength={100}
                placeholder="Numele tău"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="b-phone" className={labelClass}>
                Telefon *
              </label>
              <input
                id="b-phone"
                name="phone"
                type="tel"
                required
                maxLength={30}
                placeholder="07XX XXX XXX"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="b-email" className={labelClass}>
              Email *
            </label>
            <input
              id="b-email"
              name="email"
              type="email"
              required
              maxLength={150}
              placeholder="adresa@email.ro"
              className={inputClass}
            />
          </div>

          {/* Serviciu */}
          <div>
            <label htmlFor="b-service" className={labelClass}>
              Serviciul dorit *
            </label>
            <select id="b-service" name="service" required className={inputClass}>
              {SERVICES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Format — selector segmentat */}
          <div>
            <span className={labelClass}>Format ședință *</span>
            <div className="grid grid-cols-2 gap-3">
              {(["cabinet", "online"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  aria-pressed={format === f}
                  className={[
                    "rounded-[1.25rem] border px-5 py-3.5 font-sans text-[0.85rem] transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    format === f
                      ? "border-periwinkle bg-periwinkle text-cream shadow-[0_14px_30px_-16px_rgba(103,120,175,0.8)]"
                      : "border-ink/15 bg-cream-warm text-ink-soft hover:border-ink/35",
                  ].join(" ")}
                >
                  {f === "cabinet" ? "În cabinet" : "Online"}
                </button>
              ))}
            </div>
          </div>

          {/* Intervale preferate */}
          <div>
            <span className={labelClass}>
              Intervale care ți se potrivesc (poți alege mai multe)
            </span>
            <div className="grid gap-3 sm:grid-cols-2">
              {SLOTS.map((slot) => (
                <label
                  key={slot}
                  className="flex cursor-pointer items-center gap-3 rounded-[1.25rem] border border-ink/15 bg-cream-warm px-5 py-3.5 transition-colors duration-300 hover:border-ink/35 has-checked:border-periwinkle has-checked:bg-periwinkle-pale/50"
                >
                  <input
                    type="checkbox"
                    name="slots"
                    value={slot}
                    className="h-4 w-4 shrink-0 rounded border-ink/25 accent-periwinkle"
                  />
                  <span className="font-sans text-[0.83rem] text-ink-soft">
                    {slot}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Mesaj */}
          <div>
            <label htmlFor="b-message" className={labelClass}>
              Ce te aduce în terapie
            </label>
            <textarea
              id="b-message"
              name="message"
              rows={5}
              maxLength={2000}
              placeholder="Câteva rânduri despre situația ta. Nu trebuie să intri în detalii acum — le putem lăsa pentru prima întâlnire."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Capcană anti-spam */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="consent"
              required
              className="mt-1 h-4 w-4 shrink-0 rounded border-ink/25 accent-periwinkle"
            />
            <span className="font-sans text-[0.78rem] leading-relaxed text-ink-muted">
              Sunt de acord ca datele transmise să fie folosite exclusiv pentru
              stabilirea programării.
            </span>
          </label>

          {status === "error" && (
            <p className="rounded-[1rem] bg-clay-pale px-4 py-3 font-sans text-[0.82rem] text-clay">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="group inline-flex w-full items-center justify-center gap-2.5 rounded-pill bg-periwinkle px-8 py-4 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-cream transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "sending" ? "Se trimite…" : "Trimite cererea"}
            {status !== "sending" && (
              <IconArrow className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
            )}
          </button>
        </div>
      </form>
    </Reveal>
  );
}
