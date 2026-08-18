"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  PALETTES,
  FONT_PAIRS,
  SPECIMEN,
  readableOn,
  type Palette,
} from "@/content/themes";
import { useAutosave, type SaveState } from "./useAutosave";
import { IconArrow, IconCheck } from "../ui/Icons";

type Answers = Record<string, string>;
type UploadedFile = { id: string; fileName: string; size: number };

const field =
  "w-full rounded-[1.1rem] border border-ink/15 bg-cream-warm px-5 py-3.5 font-sans text-[0.92rem] text-ink placeholder:text-ink-muted transition-all duration-300 focus:border-periwinkle focus:bg-cream focus:outline-none focus:ring-4 focus:ring-periwinkle/12";

const ease = [0.22, 1, 0.36, 1] as const;

/** Cheile, în ordinea în care apar. Din ele aflăm și unde a rămas. */
const ORDER = [
  "paleta",
  "font",
  "calendar",
  "contract",
  "contabilitate",
  "stripe",
  "seo_varianta",
  "intrebari_geo",
  "automatizari",
  "observatii",
] as const;

/* -------------------------------------------------------------- indicator */

function Saved({ state }: { state?: SaveState }) {
  if (!state || state === "idle") return null;

  const text =
    state === "saving"
      ? "se salvează…"
      : state === "saved"
        ? "salvat"
        : "nu s-a salvat";

  return (
    <span
      aria-live="polite"
      className={[
        "inline-flex items-center gap-1.5 font-sans text-[0.75rem]",
        state === "error" ? "text-clay" : "text-sage",
      ].join(" ")}
    >
      {state === "saved" && (
        <IconCheck className="h-3.5 w-3.5" strokeWidth={2.4} />
      )}
      {text}
    </span>
  );
}

/* ------------------------------------------------------------- alegere una */

function Choice({
  options,
  value,
  onPick,
}: {
  options: { v: string; label: string }[];
  value?: string;
  onPick: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onPick(o.v)}
          aria-pressed={value === o.v}
          className={[
            "rounded-pill border-2 px-5 py-2.5 font-sans text-[0.88rem] transition-all duration-300",
            value === o.v
              ? "border-periwinkle bg-periwinkle text-cream"
              : "border-ink/15 bg-cream-warm text-ink-soft hover:border-ink/40 hover:text-ink",
          ].join(" ")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function BriefForm({
  initial,
  initialFiles,
}: {
  initial: Answers;
  initialFiles: UploadedFile[];
}) {
  const { states, saveNow, saveSoon } = useAutosave();
  const [a, setA] = useState<Answers>(initial);
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [done, setDone] = useState(false);

  /* La revenire deschidem direct prima întrebare fără răspuns. */
  const firstUnanswered = ORDER.findIndex((k) => !initial[k]?.trim());
  const startedBefore = ORDER.some((k) => initial[k]?.trim());
  const [step, setStep] = useState(firstUnanswered === -1 ? 0 : firstUnanswered);

  // La schimbarea pasului revenim în capul paginii
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, done]);

  const set = (key: string, value: string, immediate = false) => {
    setA((p) => ({ ...p, [key]: value }));
    if (immediate) saveNow(key, value);
    else saveSoon(key, value);
  };

  async function upload(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("key", "contract");
      const res = await fetch("/api/chestionar/fisier", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Încărcarea nu a reușit.");
      setFiles((f) => [json.file, ...f]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "A apărut o eroare.");
    } finally {
      setUploading(false);
    }
  }

  /* ------------------------------------------------------- cardul paletei */

  const paletteCard = (p: Palette) => {
    const chosen = a.paleta === String(p.n);
    return (
      <button
        key={p.n}
        type="button"
        onClick={() => set("paleta", String(p.n), true)}
        aria-pressed={chosen}
        className={[
          "overflow-hidden rounded-[1.35rem] border-2 text-left transition-all duration-300",
          chosen
            ? "border-periwinkle shadow-[0_14px_34px_-18px_rgba(103,120,175,0.7)]"
            : "border-ink/15 hover:border-ink/40",
        ].join(" ")}
      >
        <div style={{ background: p.bg }} className="p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="font-display text-[1.2rem]" style={{ color: p.ink }}>
              {p.n}
            </span>
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-300"
              style={{
                borderColor: chosen ? p.accent : `${p.ink}33`,
                background: chosen ? p.accent : "transparent",
                color: p.btnText,
              }}
            >
              {chosen && <IconCheck className="h-3.5 w-3.5" strokeWidth={2.6} />}
            </span>
          </div>

          <div className="mt-4 flex gap-1.5">
            {[p.bg, p.ink, p.accent, p.second, p.line].map((c, i) => (
              <span
                key={i}
                className="h-9 flex-1 rounded-[0.4rem]"
                style={{ background: c, border: "1px solid rgba(0,0,0,.07)" }}
              />
            ))}
          </div>

          <div className="mt-4 border-t pt-4" style={{ borderColor: p.line }}>
            <p className="font-display text-[1.3rem]" style={{ color: p.ink }}>
              Liliana Jgheban
            </p>
            <p
              className="mt-1 font-sans text-[0.78rem]"
              style={{ color: readableOn(p.accent, p.bg) }}
            >
              Psiholog clinician și psihoterapeut
            </p>
            <p
              className="mt-2.5 font-sans text-[0.76rem] leading-relaxed"
              style={{ color: p.ink, opacity: 0.7 }}
            >
              Ședințe în cabinet și online, pentru adulți, adolescenți și copii.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <span
                className="rounded-pill px-3.5 py-1.5 font-sans text-[0.7rem]"
                style={{ background: p.accent, color: p.btnText }}
              >
                Programează o ședință
              </span>
              <span
                className="rounded-pill border px-3.5 py-1.5 font-sans text-[0.7rem]"
                style={{ borderColor: p.second, color: p.ink }}
              >
                Servicii
              </span>
            </div>
          </div>
        </div>
      </button>
    );
  };

  /* ---------------------------------------------------------------- pașii */

  const steps: {
    key: string;
    title: string;
    hint?: ReactNode;
    body: ReactNode;
  }[] = [
    {
      key: "paleta",
      title: "Ce culori îți dorești?",
      hint: "Apasă pe varianta care îți place. După aceste culori construim și logo-ul.",
      body: (
        <>
          <p className="font-sans text-[0.85rem] text-ink-soft">
            Cu mai multă culoare
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {PALETTES.filter((p) => p.group === "aprinse").map(paletteCard)}
          </div>

          <p className="mt-8 font-sans text-[0.85rem] text-ink-soft">
            Mai discrete
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {PALETTES.filter((p) => p.group === "stinse").map(paletteCard)}
          </div>

          <textarea
            rows={2}
            value={a.paleta_comentariu ?? ""}
            onChange={(e) => set("paleta_comentariu", e.target.value)}
            placeholder="Dacă îți place ceva anume dintr-o variantă, scrie aici (opțional)"
            className={`${field} mt-6 resize-none`}
          />
        </>
      ),
    },
    {
      key: "font",
      title: "Ce fel de font ți-ar plăcea?",
      hint: "Textul din fiecare exemplu este scris chiar cu fontul propus.",
      body: (
        <div className="grid gap-3">
          {FONT_PAIRS.map((f) => {
            const chosen = a.font === String(f.n);
            return (
              <button
                key={f.n}
                type="button"
                onClick={() => set("font", String(f.n), true)}
                aria-pressed={chosen}
                className={[
                  "rounded-[1.35rem] border-2 bg-cream-warm p-6 text-left transition-all duration-300",
                  chosen
                    ? "border-periwinkle shadow-[0_14px_34px_-18px_rgba(103,120,175,0.7)]"
                    : "border-ink/15 hover:border-ink/40",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-sans text-[0.88rem] text-ink-soft">
                    {f.n}. {f.display} + {f.body}
                  </span>
                  <span
                    className={[
                      "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-300",
                      chosen
                        ? "border-periwinkle bg-periwinkle text-cream"
                        : "border-ink/20",
                    ].join(" ")}
                  >
                    {chosen && (
                      <IconCheck className="h-3.5 w-3.5" strokeWidth={2.6} />
                    )}
                  </span>
                </div>

                <p
                  className="mt-4 text-[1.55rem] leading-tight text-ink"
                  style={{
                    fontFamily: `var(--font-spec-${f.n}-display), ${f.displayFallback}`,
                  }}
                >
                  {SPECIMEN.heading}
                </p>
                <p
                  className="mt-3 text-[0.92rem] leading-[1.7] text-ink-soft"
                  style={{ fontFamily: `var(--font-spec-${f.n}-body), sans-serif` }}
                >
                  {SPECIMEN.body}
                </p>
              </button>
            );
          })}
        </div>
      ),
    },
    {
      key: "calendar",
      title: "Ce calendar folosești?",
      hint: "Îl legăm de platformă, ca programările să apară automat în calendarul tău.",
      body: (
        <>
          <Choice
            value={a.calendar}
            onPick={(v) => set("calendar", v, true)}
            options={[
              { v: "google", label: "Google Calendar" },
              { v: "calendly", label: "Calendly" },
              { v: "outlook", label: "Outlook" },
              { v: "altul", label: "Altul" },
              { v: "niciunul", label: "Nu folosesc niciunul" },
            ]}
          />
          {a.calendar === "altul" && (
            <input
              value={a.calendar_altul ?? ""}
              onChange={(e) => set("calendar_altul", e.target.value)}
              placeholder="Care anume?"
              className={`${field} mt-4 max-w-sm`}
            />
          )}
        </>
      ),
    },
    {
      key: "contract",
      title: "Folosești un contract cu clienții?",
      hint: "Dacă da, încarcă-l aici. Îl putem automatiza, ca să se completeze singur.",
      body: (
        <>
          <Choice
            value={a.contract}
            onPick={(v) => set("contract", v, true)}
            options={[
              { v: "da", label: "Da, folosesc un contract" },
              { v: "nu", label: "Nu folosesc" },
              { v: "nu_stiu", label: "Nu sunt sigură" },
            ]}
          />

          {a.contract === "da" && (
            <div className="mt-5">
              <label className="inline-flex cursor-pointer items-center gap-3 rounded-pill border-2 border-dashed border-ink/25 px-6 py-3 font-sans text-[0.87rem] text-ink-soft transition-colors hover:border-periwinkle hover:text-periwinkle">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.odt,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void upload(f);
                    e.target.value = "";
                  }}
                />
                {uploading
                  ? "Se încarcă…"
                  : "Alege fișierul (PDF, Word, poză — max. 10 MB)"}
              </label>

              {uploadError && (
                <p className="mt-3 rounded-[0.9rem] bg-clay-pale px-4 py-2.5 font-sans text-[0.82rem] text-clay">
                  {uploadError}
                </p>
              )}

              {files.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {files.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center gap-3 rounded-[0.9rem] bg-sage-pale px-4 py-2.5 font-sans text-[0.85rem] text-ink"
                    >
                      <IconCheck
                        className="h-4 w-4 shrink-0 text-sage"
                        strokeWidth={2.2}
                      />
                      <span className="min-w-0 flex-1 truncate">{f.fileName}</span>
                      <span className="shrink-0 text-[0.78rem] text-ink-muted">
                        {Math.round(f.size / 1024)} KB
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <textarea
                rows={2}
                value={a.contract_detalii ?? ""}
                onChange={(e) => set("contract_detalii", e.target.value)}
                placeholder="Ceva de menționat despre contract? (opțional)"
                className={`${field} mt-4 resize-none`}
              />
            </div>
          )}
        </>
      ),
    },
    {
      key: "contabilitate",
      title: "Ce folosești pentru facturi?",
      hint: "Ca facturile să se emită automat după fiecare ședință.",
      body: (
        <>
          <Choice
            value={a.contabilitate}
            onPick={(v) => set("contabilitate", v, true)}
            options={[
              { v: "fgo", label: "FGO" },
              { v: "smartbill", label: "SmartBill" },
              { v: "contabil", label: "Se ocupă contabilul" },
              { v: "altul", label: "Altceva" },
              { v: "niciunul", label: "Nimic deocamdată" },
            ]}
          />
          {(a.contabilitate === "altul" || a.contabilitate === "contabil") && (
            <input
              value={a.contabilitate_altul ?? ""}
              onChange={(e) => set("contabilitate_altul", e.target.value)}
              placeholder="Detalii — ce program, sau datele contabilului"
              className={`${field} mt-4`}
            />
          )}
        </>
      ),
    },
    {
      key: "stripe",
      title: "Ai cont Stripe, pentru plata online a ședințelor?",
      body: (
        <>
          <Choice
            value={a.stripe}
            onPick={(v) => set("stripe", v, true)}
            options={[
              { v: "am", label: "Da, am cont" },
              { v: "nu_am", label: "Nu am, îl deschideți voi" },
              { v: "fara_plati", label: "Nu vreau plăți online" },
            ]}
          />

          {a.stripe && a.stripe !== "fara_plati" && (
            <div className="mt-5">
              <label className="font-sans text-[0.85rem] text-ink-soft">
                {a.stripe === "am"
                  ? "Pe ce adresă de email este contul?"
                  : "Pe ce adresă de email deschidem contul?"}
              </label>
              <input
                type="email"
                value={a.stripe_email ?? ""}
                onChange={(e) => set("stripe_email", e.target.value)}
                placeholder="adresa@email.ro"
                className={`${field} mt-3 max-w-md`}
              />
              <p className="mt-4 rounded-[1rem] border border-sage/30 bg-sage-pale/50 px-5 py-4 font-sans text-[0.83rem] leading-[1.7] text-ink-soft">
                <span className="text-ink">
                  Nu trimite parole sau chei de acces
                </span>{" "}
                — nici aici, nici pe email. E de ajuns adresa: primim din Stripe o
                invitație de colaborator, cu drepturi limitate, pe care le poți
                retrage oricând. Așa banii rămân doar sub controlul tău.
              </p>
            </div>
          )}
        </>
      ),
    },
    {
      key: "seo_varianta",
      title: "Cum procedăm cu textele de pe site?",
      hint: "Textele trebuie scrise astfel încât oamenii să te găsească în Google. Sunt două variante.",
      body: (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                v: "1",
                t: "Le scriu eu",
                d: "Pornesc de la cuvintele pe care oamenii le scriu în Google, redactez textele și ți le trimit spre citit. Modificăm împreună ce nu te reprezintă.",
                tag: "Mai bine pentru vizibilitate",
              },
              {
                v: "2",
                t: "Le scrii tu",
                d: "Îmi trimiți textele în cuvintele tale, iar eu le ajustez pe alocuri pentru motoarele de căutare.",
                tag: "Mai fidel vocii tale",
              },
            ].map((o) => {
              const chosen = a.seo_varianta === o.v;
              return (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => set("seo_varianta", o.v, true)}
                  aria-pressed={chosen}
                  className={[
                    "rounded-[1.35rem] border-2 p-6 text-left transition-all duration-300",
                    chosen
                      ? "border-periwinkle bg-periwinkle-pale/40"
                      : "border-ink/15 bg-cream-warm hover:border-ink/40",
                  ].join(" ")}
                >
                  <span className="inline-flex rounded-pill bg-cream px-3 py-1 font-sans text-[0.72rem] text-ink-soft">
                    {o.tag}
                  </span>
                  <p className="mt-3.5 font-display text-[1.1rem] text-ink">
                    {o.t}
                  </p>
                  <p className="mt-2 font-sans text-[0.84rem] leading-[1.7] text-ink-soft">
                    {o.d}
                  </p>
                </button>
              );
            })}
          </div>
          <textarea
            rows={2}
            value={a.seo_comentariu ?? ""}
            onChange={(e) => set("seo_comentariu", e.target.value)}
            placeholder="Observații despre texte (opțional)"
            className={`${field} mt-4 resize-none`}
          />
        </>
      ),
    },
    {
      key: "intrebari_geo",
      title: "Ce întrebări îți pun cel mai des oamenii?",
      hint: "Tot mai mulți întreabă un asistent AI înainte să caute în Google. Dacă site-ul răspunde la întrebările reale, apare în acele răspunsuri. Scrie-le pe cele pe care le auzi la telefon sau la prima ședință — câte una pe rând.",
      body: (
        <textarea
          rows={8}
          value={a.intrebari_geo ?? ""}
          onChange={(e) => set("intrebari_geo", e.target.value)}
          placeholder={
            "Cât durează o ședință?\nCum îmi dau seama dacă am nevoie de terapie?\nCe fac dacă copilul refuză să vină?\nCât timp trece până văd o schimbare?"
          }
          className={`${field} resize-none leading-[1.9]`}
        />
      ),
    },
    {
      key: "automatizari",
      title: "Ce ți-ar mai ușura munca?",
      hint: "Deocamdată sunt prevăzute: programări online, facturare automată și contracte care se completează singure. Ce îți mai ia timp în fiecare săptămână?",
      body: (
        <textarea
          rows={5}
          value={a.automatizari ?? ""}
          onChange={(e) => set("automatizari", e.target.value)}
          placeholder="De exemplu: amintiri trimise clienților înainte de ședință, formulare de evaluare completate online, dosarul clientului la un loc…"
          className={`${field} resize-none`}
        />
      ),
    },
    {
      key: "observatii",
      title: "Altceva de spus?",
      body: (
        <textarea
          rows={4}
          value={a.observatii ?? ""}
          onChange={(e) => set("observatii", e.target.value)}
          placeholder="Orice altceva ți se pare important."
          className={`${field} resize-none`}
        />
      ),
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const answeredCount = ORDER.filter((k) => a[k]?.trim()).length;

  /* ----------------------------------------------------------------- final */

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease }}
        className="rounded-[1.75rem] border border-ink/10 bg-cream p-10 text-center sm:p-14"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-pale text-sage">
          <IconCheck className="h-7 w-7" strokeWidth={1.8} />
        </div>
        <h2 className="mt-7 font-display text-2xl text-ink sm:text-3xl">
          Mulțumesc, am primit tot
        </h2>
        <p className="mx-auto mt-4 max-w-md font-sans text-[0.92rem] leading-[1.9] text-ink-soft">
          Ai răspuns la {answeredCount} din {ORDER.length} întrebări. Mă apuc de
          treabă și revin cu prima variantă.
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(false);
            setStep(0);
          }}
          className="mt-8 font-sans text-[0.85rem] text-periwinkle transition-colors hover:text-ink"
        >
          Vreau să mai schimb ceva
        </button>
      </motion.div>
    );
  }

  return (
    <div>
      {startedBefore && step === firstUnanswered && firstUnanswered > 0 && (
        <p className="mb-4 rounded-[1.25rem] border border-sage/30 bg-sage-pale/50 px-6 py-3.5 text-center font-sans text-[0.87rem] text-ink-soft">
          Bine ai revenit — continuăm de unde ai rămas.
        </p>
      )}

      {/* Progres */}
      <div className="mb-5">
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-sans text-[0.85rem] text-ink-soft">
            Întrebarea {step + 1} din {steps.length}
          </span>
          <Saved state={states[current.key]} />
        </div>

        <div className="mt-3 flex gap-1.5">
          {steps.map((s, i) => {
            const filled = !!a[s.key]?.trim();
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setStep(i)}
                aria-label={`Întrebarea ${i + 1}`}
                aria-current={i === step}
                className={[
                  "h-1.5 flex-1 rounded-pill transition-all duration-400",
                  i === step
                    ? "bg-periwinkle"
                    : filled
                      ? "bg-sage/60 hover:bg-sage"
                      : "bg-ink/12 hover:bg-ink/25",
                ].join(" ")}
              />
            );
          })}
        </div>
      </div>

      {/* Întrebarea curentă */}
      <motion.section
        key={current.key}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.32, ease }}
        className="rounded-[1.75rem] border border-ink/10 bg-cream p-7 sm:p-9"
      >
        <div className="flex items-start gap-4">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.55rem] bg-ink font-sans text-[0.85rem] text-cream">
            {step + 1}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-[1.3rem] leading-snug text-ink">
              {current.title}
            </h2>
            {current.hint && (
              <p className="mt-2.5 font-sans text-[0.87rem] leading-[1.75] text-ink-soft">
                {current.hint}
              </p>
            )}
            <div className="mt-6">{current.body}</div>
          </div>
        </div>
      </motion.section>

      {/* Navigare */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="font-sans text-[0.85rem] text-ink-soft transition-colors hover:text-ink disabled:invisible"
        >
          ← Înapoi
        </button>

        <button
          type="button"
          onClick={() => (isLast ? setDone(true) : setStep((s) => s + 1))}
          className="group inline-flex items-center gap-2.5 rounded-pill bg-periwinkle px-7 py-3.5 font-sans text-[0.85rem] text-cream transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink"
        >
          {isLast ? "Am terminat" : "Continuă"}
          <IconArrow className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
        </button>
      </div>

      <p className="mt-7 text-center font-sans text-[0.83rem] leading-relaxed text-ink-muted">
        Fiecare răspuns se salvează singur. Poți sări peste o întrebare, poți
        închide pagina și reveni mai târziu.
      </p>
    </div>
  );
}
