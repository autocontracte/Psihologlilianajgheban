"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { IconArrow, IconCheck, IconOffice, IconOnline } from "../ui/Icons";
import { FORMAT_LABEL, type Format } from "@/lib/types";

type Service = {
  id: string;
  name: string;
  duration: number;
  description: string | null;
};

type DayInfo = { date: string; free: number; closed: boolean };
type SlotInfo = { time: string; available: boolean };

const STEPS = ["Serviciul", "Data și ora", "Confirmare"] as const;

const ease = [0.22, 1, 0.36, 1] as const;

const guestField =
  "w-full rounded-[1.25rem] border border-ink/15 bg-cream-warm px-5 py-3.5 font-sans text-[0.9rem] text-ink placeholder:text-ink-muted transition-all duration-300 focus:border-periwinkle focus:bg-cream focus:outline-none focus:ring-4 focus:ring-periwinkle/12";

/* Etichete de dată calculate fără fus orar: șirul "YYYY-MM-DD" e tratat ca UTC,
   deci ziua afișată e exact cea cerută. */
function dayLabel(date: string, opts: Intl.DateTimeFormatOptions) {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("ro-RO", { timeZone: "UTC", ...opts }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

export function BookingFlow({
  services,
  loggedIn,
}: {
  services: Service[];
  /** Când e fals, datele de contact se cer în ultimul pas. */
  loggedIn: boolean;
}) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [format, setFormat] = useState<Format>("CABINET");
  const [notes, setNotes] = useState("");

  // Folosite doar pentru programările fără cont
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const [days, setDays] = useState<DayInfo[]>([]);
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [loadingDays, setLoadingDays] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  /* Lista de zile se derulează pe orizontală. Fără un semn, mulți nu își dau
     seama că mai există zile în dreapta — mai ales pe telefon. */
  const daysRef = useRef<HTMLDivElement | null>(null);
  const [showSwipe, setShowSwipe] = useState(false);

  const checkSwipe = useCallback(() => {
    const el = daysRef.current;
    if (!el) return;
    setShowSwipe(el.scrollWidth > el.clientWidth + 8 && el.scrollLeft < 8);
  }, []);

  /* Pașii sunt învelite în AnimatePresence mode="wait", care montează
     conținutul nou abia după animația de ieșire a celui vechi. Un useEffect ar
     măsura prea devreme, când banda încă nu există în pagină. Ref-callback-ul
     se declanșează exact în momentul montării. */
  const attachDays = useCallback(
    (node: HTMLDivElement | null) => {
      daysRef.current = node;
      if (node) requestAnimationFrame(checkSwipe);
    },
    [checkSwipe],
  );

  useEffect(() => {
    window.addEventListener("resize", checkSwipe);
    return () => window.removeEventListener("resize", checkSwipe);
  }, [checkSwipe]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const service = services.find((s) => s.id === serviceId);

  /* ------------------------------------------------- încărcarea zilelor */
  const loadDays = useCallback(async (id: string) => {
    setLoadingDays(true);
    setError("");
    try {
      const res = await fetch(`/api/slots/days?serviceId=${id}&days=28`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Nu am putut încărca zilele.");
      setDays(json.days);
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
    } finally {
      setLoadingDays(false);
    }
  }, []);

  useEffect(() => {
    if (serviceId) loadDays(serviceId);
  }, [serviceId, loadDays]);

  /* -------------------------------------------------- încărcarea orelor */
  useEffect(() => {
    if (!serviceId || !date) return;
    let cancelled = false;

    (async () => {
      setLoadingSlots(true);
      setTime("");
      try {
        const res = await fetch(`/api/slots?serviceId=${serviceId}&date=${date}`);
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(json.error ?? "Nu am putut încărca orele.");
        setSlots(json.slots);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "A apărut o eroare.");
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [serviceId, date]);

  /* ------------------------------------------------------------ trimitere */
  async function submit() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          date,
          time,
          format,
          notes,
          ...(loggedIn
            ? {}
            : { name: guestName, email: guestEmail, phone: guestPhone }),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Programarea nu a reușit.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
      // Slotul poate fi între timp ocupat — reîmprospătăm orele
      if (serviceId && date) {
        const res = await fetch(`/api/slots?serviceId=${serviceId}&date=${date}`);
        if (res.ok) setSlots((await res.json()).slots);
      }
    } finally {
      setBusy(false);
    }
  }

  /* ----------------------------------------------------------- confirmare */
  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease }}
      >
        <div className="rounded-[2.25rem] bg-cream p-10 text-center shadow-[0_30px_70px_-40px_rgba(56,62,82,0.4)] lg:p-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-pale text-sage">
              <IconCheck className="h-7 w-7" strokeWidth={1.8} />
            </div>
            <h2 className="mt-7 font-display text-3xl text-ink">
              Programarea a fost înregistrată
            </h2>
            <p className="mx-auto mt-4 max-w-md font-sans text-[0.92rem] leading-[1.9] text-ink-soft">
              {service?.name} —{" "}
              {dayLabel(date, { weekday: "long", day: "numeric", month: "long" })}
              , ora {time}.{" "}
              {loggedIn
                ? "Îți confirm programarea în cel mai scurt timp, iar până atunci apare în contul tău ca „în așteptare”."
                : "Te contactez pe telefon sau email ca să confirm programarea, de regulă în aceeași zi lucrătoare."}
            </p>

            {!loggedIn && (
              <p className="mx-auto mt-5 max-w-md rounded-[1.25rem] bg-cream-warm px-5 py-4 font-sans text-[0.83rem] leading-relaxed text-ink-soft">
                Dacă îți faci un cont cu aceeași adresă de email, îți vei putea
                vedea și gestiona singur ședințele viitoare.
              </p>
            )}

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={loggedIn ? "/cont" : "/cont/inregistrare"}
                className="inline-flex items-center justify-center gap-2 rounded-pill bg-periwinkle px-7 py-3.5 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-cream transition-colors duration-500 hover:bg-ink"
              >
                {loggedIn ? "Vezi programările mele" : "Creează-mi cont"}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setDone(false);
                  setStep(0);
                  setServiceId("");
                  setDate("");
                  setTime("");
                  setNotes("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-pill border border-ink/20 px-7 py-3.5 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-ink transition-all duration-500 hover:border-ink/50 hover:bg-ink hover:text-cream"
              >
                Fă altă programare
              </button>
            </div>
        </div>
      </motion.div>
    );
  }

  const canAdvance = step === 0 ? !!serviceId : step === 1 ? !!date && !!time : true;

  /* Fără cont, programarea are nevoie de date de contact valide. */
  const contactReady =
    loggedIn ||
    (guestName.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(guestEmail.trim()) &&
      guestPhone.replace(/\D/g, "").length >= 9);

  return (
    <div>
      {/* Indicator de pas */}
      <div className="mb-10 flex items-center justify-center gap-2 sm:gap-4">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className={[
                "flex items-center gap-2.5 rounded-pill px-3 py-2 transition-all duration-500 sm:px-4",
                i === step
                  ? "bg-periwinkle text-cream"
                  : i < step
                    ? "cursor-pointer text-ink hover:bg-periwinkle-pale"
                    : "text-ink-muted",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-6 w-6 items-center justify-center rounded-full font-sans text-[0.65rem]",
                  i === step
                    ? "bg-cream/25"
                    : i < step
                      ? "bg-sage-pale text-sage"
                      : "bg-ink/8",
                ].join(" ")}
              >
                {i < step ? <IconCheck className="h-3 w-3" strokeWidth={2.4} /> : i + 1}
              </span>
              <span className="hidden font-sans text-[0.68rem] uppercase tracking-[0.14em] sm:inline">
                {label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <span
                className={[
                  "h-px w-4 rounded-pill transition-colors duration-500 sm:w-10",
                  i < step ? "bg-sage" : "bg-ink/15",
                ].join(" ")}
              />
            )}
          </div>
        ))}
      </div>

        <div className="rounded-[2.25rem] bg-cream p-7 shadow-[0_30px_70px_-40px_rgba(56,62,82,0.4)] sm:p-9 lg:p-11">
          <AnimatePresence mode="wait">
            {/* ---------------------------------------------- Pasul 1 */}
            {step === 0 && (
              <motion.div
                key="s0"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease }}
              >
                <h2 className="font-display text-2xl text-ink">
                  Ce fel de întâlnire îți dorești?
                </h2>
                <p className="mt-2 font-sans text-[0.85rem] text-ink-soft">
                  Dacă nu ești sigur, alege psihoterapie individuală — putem
                  ajusta la prima ședință.
                </p>

                <div className="mt-7 grid gap-3">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setServiceId(s.id)}
                      className={[
                        "rounded-[1.5rem] border p-5 text-left transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        serviceId === s.id
                          ? "border-periwinkle bg-periwinkle-pale/50 shadow-[0_16px_36px_-22px_rgba(103,120,175,0.9)]"
                          : "border-ink/12 bg-cream-warm hover:border-ink/30",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-display text-[1.05rem] leading-snug text-ink">
                            {s.name}
                          </p>
                          {s.description && (
                            <p className="mt-1.5 font-sans text-[0.8rem] leading-relaxed text-ink-soft">
                              {s.description}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 rounded-pill bg-cream px-3 py-1 font-sans text-[0.65rem] text-ink-soft">
                          {s.duration} min
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ---------------------------------------------- Pasul 2 */}
            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease }}
              >
                <h2 className="font-display text-2xl text-ink">Alege ziua și ora</h2>
                <p className="mt-2 font-sans text-[0.85rem] text-ink-soft">
                  Ședința durează {service?.duration} de minute. Orele sunt în ora
                  României.
                </p>

                {/* Zile */}
                <div className="mt-7">
                  {loadingDays ? (
                    <div className="flex gap-2.5 overflow-hidden">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-[4.75rem] w-[4.25rem] shrink-0 animate-pulse rounded-[1.25rem] bg-ink/6"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="relative">
                      <div
                        ref={attachDays}
                        onScroll={checkSwipe}
                        className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-3"
                      >
                      {days.map((d) => {
                        const disabled = d.closed || d.free === 0;
                        return (
                          <button
                            key={d.date}
                            type="button"
                            disabled={disabled}
                            onClick={() => setDate(d.date)}
                            className={[
                              "flex w-[4.25rem] shrink-0 flex-col items-center gap-0.5 rounded-[1.25rem] border py-3 transition-all duration-400",
                              date === d.date
                                ? "border-periwinkle bg-periwinkle text-cream"
                                : disabled
                                  ? "cursor-not-allowed border-ink/8 bg-ink/[0.03] text-ink-muted/50"
                                  : "border-ink/12 bg-cream-warm text-ink hover:border-periwinkle/60",
                            ].join(" ")}
                          >
                            <span className="font-sans text-[0.58rem] uppercase tracking-[0.12em] opacity-70">
                              {dayLabel(d.date, { weekday: "short" }).replace(".", "")}
                            </span>
                            <span className="font-display text-xl leading-none">
                              {Number(d.date.slice(8))}
                            </span>
                            <span className="font-sans text-[0.55rem] opacity-70">
                              {dayLabel(d.date, { month: "short" }).replace(".", "")}
                            </span>
                          </button>
                        );
                      })}
                      </div>

                      {/* Umbră la marginea dreaptă — arată că lista continuă */}
                      <AnimatePresence>
                        {showSwipe && (
                          <motion.div
                            aria-hidden
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-cream via-cream/80 to-transparent"
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Indiciu de glisare, dispare după prima derulare */}
                  <AnimatePresence>
                    {showSwipe && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 font-sans text-[0.72rem] text-ink-muted"
                      >
                        Glisează pentru mai multe zile
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{
                            duration: 1.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="text-periwinkle"
                        >
                          <IconArrow className="h-3.5 w-3.5" />
                        </motion.span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Ore */}
                {date && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease }}
                    className="mt-7 border-t border-ink/10 pt-7"
                  >
                    <p className="font-sans text-[0.58rem] uppercase tracking-[0.22em] text-ink-muted">
                      {dayLabel(date, { weekday: "long", day: "numeric", month: "long" })}
                    </p>

                    {loadingSlots ? (
                      <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-11 animate-pulse rounded-[1rem] bg-ink/6"
                          />
                        ))}
                      </div>
                    ) : slots.filter((s) => s.available).length === 0 ? (
                      <p className="mt-4 rounded-[1.25rem] bg-cream-warm px-5 py-4 font-sans text-[0.85rem] text-ink-soft">
                        Nu mai sunt intervale libere în această zi. Încearcă altă
                        dată din listă.
                      </p>
                    ) : (
                      <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                        {slots.map((s) => (
                          <button
                            key={s.time}
                            type="button"
                            disabled={!s.available}
                            onClick={() => setTime(s.time)}
                            className={[
                              "rounded-[1rem] border py-3 font-sans text-[0.85rem] transition-all duration-400",
                              time === s.time
                                ? "border-periwinkle bg-periwinkle text-cream"
                                : s.available
                                  ? "border-ink/12 bg-cream-warm text-ink hover:border-periwinkle/60"
                                  : "cursor-not-allowed border-transparent bg-ink/[0.03] text-ink-muted/40 line-through",
                            ].join(" ")}
                          >
                            {s.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ---------------------------------------------- Pasul 3 */}
            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease }}
              >
                <h2 className="font-display text-2xl text-ink">Ultimele detalii</h2>

                {/* Rezumat */}
                <div className="mt-6 rounded-[1.5rem] bg-cream-warm p-6">
                  <dl className="space-y-3">
                    {[
                      ["Serviciu", service?.name ?? ""],
                      [
                        "Data",
                        dayLabel(date, {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        }),
                      ],
                      ["Ora", `${time} (${service?.duration} min)`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4">
                        <dt className="font-sans text-[0.75rem] uppercase tracking-[0.14em] text-ink-muted">
                          {k}
                        </dt>
                        <dd className="text-right font-sans text-[0.88rem] text-ink">
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {/* Date de contact — doar pentru programările fără cont */}
                {!loggedIn && (
                  <div className="mt-7">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-sans text-[0.58rem] uppercase tracking-[0.22em] text-ink-muted">
                        Datele tale de contact
                      </span>
                      <Link
                        href="/cont/autentificare?redirect=/programari"
                        className="font-sans text-[0.75rem] text-periwinkle underline decoration-periwinkle/30 underline-offset-4 transition-colors hover:text-ink"
                      >
                        Ai deja cont? Autentifică-te
                      </Link>
                    </div>

                    <div className="mt-3 space-y-3">
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        maxLength={100}
                        autoComplete="name"
                        placeholder="Nume și prenume *"
                        className={guestField}
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="tel"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          maxLength={30}
                          autoComplete="tel"
                          placeholder="Telefon *"
                          className={guestField}
                        />
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          maxLength={150}
                          autoComplete="email"
                          placeholder="Email *"
                          className={guestField}
                        />
                      </div>
                    </div>

                    <p className="mt-2.5 font-sans text-[0.75rem] leading-relaxed text-ink-muted">
                      Te contactez pe telefon sau email ca să îți confirm
                      programarea.
                    </p>
                  </div>
                )}

                {/* Format */}
                <div className="mt-7">
                  <span className="mb-2.5 block font-sans text-[0.58rem] uppercase tracking-[0.22em] text-ink-muted">
                    Cum vrei să ne vedem?
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {(["CABINET", "ONLINE"] as const).map((f) => {
                      const Icon = f === "CABINET" ? IconOffice : IconOnline;
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFormat(f)}
                          className={[
                            "flex items-center justify-center gap-2.5 rounded-[1.25rem] border px-5 py-4 font-sans text-[0.85rem] transition-all duration-400",
                            format === f
                              ? "border-periwinkle bg-periwinkle text-cream"
                              : "border-ink/12 bg-cream-warm text-ink-soft hover:border-ink/35",
                          ].join(" ")}
                        >
                          <Icon className="h-4.5 w-4.5" />
                          {FORMAT_LABEL[f]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Note */}
                <div className="mt-6">
                  <label
                    htmlFor="notes"
                    className="mb-2 block font-sans text-[0.58rem] uppercase tracking-[0.22em] text-ink-muted"
                  >
                    Vrei să știu ceva dinainte? (opțional)
                  </label>
                  <textarea
                    id="notes"
                    rows={4}
                    maxLength={2000}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Câteva rânduri despre ce te aduce în terapie. Poți lăsa gol — vorbim la prima întâlnire."
                    className="w-full resize-none rounded-[1.25rem] border border-ink/15 bg-cream-warm px-5 py-3.5 font-sans text-[0.9rem] text-ink placeholder:text-ink-muted transition-all duration-300 focus:border-periwinkle focus:bg-cream focus:outline-none focus:ring-4 focus:ring-periwinkle/12"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <p className="mt-6 rounded-[1rem] bg-clay-pale px-4 py-3 font-sans text-[0.82rem] text-clay">
              {error}
            </p>
          )}

          {/* Navigare */}
          <div className="mt-9 flex items-center justify-between gap-4 border-t border-ink/10 pt-7">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="font-sans text-[0.7rem] uppercase tracking-[0.16em] text-ink-soft transition-colors duration-300 hover:text-ink disabled:invisible"
            >
              ← Înapoi
            </button>

            {step < 2 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance}
                className="group inline-flex items-center gap-2.5 rounded-pill bg-periwinkle px-7 py-3.5 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-cream transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continuă
                <IconArrow className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={busy || !contactReady}
                className="group inline-flex items-center gap-2.5 rounded-pill bg-sage px-7 py-3.5 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-cream transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Se trimite…" : "Confirmă programarea"}
                {!busy && (
                  <IconCheck className="h-4 w-4" strokeWidth={2} />
                )}
              </button>
            )}
          </div>
        </div>
    </div>
  );
}
