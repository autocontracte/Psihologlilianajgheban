"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { CONTACT, SITE } from "@/content/site";
import { Reveal } from "../ui/Reveal";
import {
  IconArrow,
  IconClock,
  IconLocation,
  IconMail,
  IconPhone,
} from "../ui/Icons";

type Status = "idle" | "sending" | "sent" | "error";

const inputClass =
  "w-full rounded-[1.25rem] border border-ink/15 bg-cream-warm px-5 py-3.5 font-sans text-[0.9rem] text-ink placeholder:text-ink-muted transition-all duration-300 focus:border-periwinkle focus:bg-cream focus:outline-none focus:ring-4 focus:ring-periwinkle/12";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? "Mesajul nu a putut fi trimis.");

      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "A apărut o eroare neașteptată.",
      );
    }
  }

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-cream-deep py-28 lg:py-36"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          {/* ------------------------------------------------ Date contact */}
          <div>
            <Reveal>
              <p className="font-sans text-[0.78rem] tracking-[0.02em] text-periwinkle">
                {CONTACT.eyebrow}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5 font-display text-4xl leading-tight text-ink sm:text-5xl">
                {CONTACT.title}
              </h2>
            </Reveal>
            <Reveal delay={0.14}>
              <div className="rule-soft mt-7" />
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-7 max-w-md font-sans text-[0.95rem] leading-[1.9] text-ink-soft">
                {CONTACT.subtitle}
              </p>
            </Reveal>

            <div className="mt-11 space-y-5">
              {[
                {
                  Icon: IconPhone,
                  label: "Telefon",
                  value: SITE.phone,
                  href: `tel:${SITE.phoneHref}`,
                },
                {
                  Icon: IconMail,
                  label: "Email",
                  value: SITE.email,
                  href: `mailto:${SITE.email}`,
                },
                {
                  Icon: IconLocation,
                  label: "Cabinet",
                  value: SITE.city,
                  note: SITE.addressNote,
                },
              ].map(({ Icon, label, value, href, note }, i) => (
                <Reveal key={label} delay={0.26 + i * 0.07}>
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.95rem] bg-periwinkle-pale text-periwinkle">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <div className="pt-0.5">
                      <p className="font-sans text-[0.74rem] tracking-[0.02em] text-ink-muted">
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          className="mt-1 block font-sans text-[0.95rem] text-ink transition-colors duration-300 hover:text-periwinkle"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="mt-1 font-sans text-[0.95rem] text-ink">
                          {value}
                        </p>
                      )}
                      {note && (
                        <p className="mt-1 font-sans text-[0.78rem] leading-relaxed text-ink-muted">
                          {note}
                        </p>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}

              {/* Program */}
              <Reveal delay={0.47}>
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.95rem] bg-sage-pale text-sage">
                    <IconClock className="h-4.5 w-4.5" />
                  </span>
                  <div className="pt-0.5">
                    <p className="font-sans text-[0.74rem] tracking-[0.02em] text-ink-muted">
                      Program
                    </p>
                    <ul className="mt-2 space-y-1">
                      {SITE.schedule.map((s) => (
                        <li
                          key={s.days}
                          className="flex gap-3 font-sans text-[0.85rem] text-ink-soft"
                        >
                          <span className="w-28 shrink-0">{s.days}</span>
                          <span className="text-ink">{s.hours}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* ----------------------------------------------------- Formular */}
          <Reveal direction="left" delay={0.1}>
            <div className="rounded-[2.5rem] bg-cream p-8 shadow-[0_30px_70px_-40px_rgba(56,62,82,0.4)] lg:p-11">
              {status === "sent" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="flex min-h-[26rem] flex-col items-center justify-center text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage-pale text-sage">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-7 w-7"
                    >
                      <path d="m5 12.5 4.5 4.5L19 7.5" />
                    </svg>
                  </div>
                  <h3 className="mt-7 font-display text-2xl text-ink">
                    Mesajul a ajuns la mine
                  </h3>
                  <p className="mt-3 max-w-sm font-sans text-[0.9rem] leading-[1.85] text-ink-soft">
                    Îți mulțumesc că ai făcut primul pas. Îți răspund în cel mai
                    scurt timp, de regulă în aceeași zi lucrătoare.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="mt-8 font-sans text-[0.7rem] tracking-[0.02em] text-periwinkle transition-colors duration-300 hover:text-ink"
                  >
                    Trimite alt mesaj
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block font-sans text-[0.74rem] tracking-[0.02em] text-ink-muted"
                      >
                        Nume *
                      </label>
                      <input
                        id="name"
                        name="name"
                        required
                        maxLength={100}
                        placeholder="Numele tău"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block font-sans text-[0.74rem] tracking-[0.02em] text-ink-muted"
                      >
                        Telefon
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        maxLength={30}
                        placeholder="07XX XXX XXX"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block font-sans text-[0.74rem] tracking-[0.02em] text-ink-muted"
                    >
                      Email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      maxLength={150}
                      placeholder="adresa@email.ro"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-2 block font-sans text-[0.74rem] tracking-[0.02em] text-ink-muted"
                    >
                      Ce te aduce aici
                    </label>
                    <select id="subject" name="subject" className={inputClass}>
                      <option>Psihoterapie individuală — adult</option>
                      <option>Psihoterapie — adolescent</option>
                      <option>Terapie pentru copil</option>
                      <option>Consiliere parentală</option>
                      <option>Evaluare clinică psihologică</option>
                      <option>Workshop / grup de dezvoltare personală</option>
                      <option>Atelier experiențial (Sandtray)</option>
                      <option>Altceva</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block font-sans text-[0.74rem] tracking-[0.02em] text-ink-muted"
                    >
                      Mesaj *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      maxLength={2000}
                      placeholder="Scrie pe scurt ce te preocupă. Nu trebuie să intri în detalii acum."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {/* Capcană anti-spam, ascunsă pentru utilizatori */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute left-[-9999px] h-0 w-0 opacity-0"
                  />

                  <label className="flex items-start gap-3 pt-1">
                    <input
                      type="checkbox"
                      name="consent"
                      required
                      className="mt-1 h-4 w-4 shrink-0 rounded border-ink/25 accent-periwinkle"
                    />
                    <span className="font-sans text-[0.78rem] leading-relaxed text-ink-muted">
                      Sunt de acord ca datele transmise să fie folosite exclusiv
                      pentru a-mi fi oferit un răspuns.
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
                    className="group inline-flex w-full items-center justify-center gap-2.5 rounded-pill bg-periwinkle px-8 py-4 font-sans text-[0.7rem] tracking-[0.02em] text-cream transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "sending" ? "Se trimite…" : "Trimite mesajul"}
                    {status !== "sending" && (
                      <IconArrow className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                    )}
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
