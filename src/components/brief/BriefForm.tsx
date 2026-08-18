"use client";

import { useState, type ReactNode } from "react";
import { PALETTES, FONT_PAIRS, SPECIMEN, type Palette } from "@/content/themes";
import { useAutosave, type SaveState } from "./useAutosave";
import { IconCheck } from "../ui/Icons";

type Answers = Record<string, string>;
type UploadedFile = { id: string; fileName: string; size: number };

const field =
  "w-full rounded-[1.1rem] border border-ink/15 bg-cream-warm px-5 py-3.5 font-sans text-[0.92rem] text-ink placeholder:text-ink-muted transition-all duration-300 focus:border-periwinkle focus:bg-cream focus:outline-none focus:ring-4 focus:ring-periwinkle/12";

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
        "inline-flex items-center gap-1.5 font-sans text-[0.75rem] transition-opacity duration-300",
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

/* ------------------------------------------------------------------- card */

function Question({
  n,
  title,
  hint,
  state,
  children,
}: {
  n: number;
  title: string;
  hint?: ReactNode;
  state?: SaveState;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-ink/10 bg-cream p-7 sm:p-9">
      <div className="flex items-start gap-4">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.55rem] bg-ink font-sans text-[0.85rem] text-cream">
          {n}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-[1.25rem] leading-snug text-ink">
              {title}
            </h2>
            <Saved state={state} />
          </div>
          {hint && (
            <p className="mt-2.5 font-sans text-[0.87rem] leading-[1.75] text-ink-soft">
              {hint}
            </p>
          )}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </section>
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
            "rounded-pill border px-5 py-2.5 font-sans text-[0.88rem] transition-all duration-300",
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
            : "border-transparent hover:border-ink/20",
        ].join(" ")}
      >
        <div style={{ background: p.bg }} className="p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="font-display text-[1.15rem]" style={{ color: p.ink }}>
              {p.n}. {p.name}
            </span>
            <span
              className={[
                "flex h-6 w-6 items-center justify-center rounded-full transition-opacity duration-300",
                chosen ? "opacity-100" : "opacity-0",
              ].join(" ")}
              style={{ background: p.accent, color: p.btnText }}
            >
              <IconCheck className="h-3.5 w-3.5" strokeWidth={2.6} />
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

          <p
            className="mt-4 font-sans text-[0.78rem] leading-relaxed"
            style={{ color: p.ink, opacity: 0.68 }}
          >
            {p.note}
          </p>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Cine răspunde */}
      <section className="rounded-[1.75rem] border border-ink/10 bg-cream-warm p-7 sm:p-9">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <label
            htmlFor="respondent"
            className="font-sans text-[0.87rem] text-ink-soft"
          >
            Cine completează (opțional)
          </label>
          <Saved state={states.respondent} />
        </div>
        <input
          id="respondent"
          value={a.respondent ?? ""}
          onChange={(e) => set("respondent", e.target.value)}
          placeholder="Numele dumneavoastră"
          className={`${field} mt-3 max-w-sm`}
        />
      </section>

      {/* 1 — culori */}
      <Question
        n={1}
        title="Ce culori vă doriți?"
        hint="Apăsați pe varianta care vă place. După aceste culori construim și logo-ul. Puteți reveni oricând să schimbați."
        state={states.paleta}
      >
        <p className="font-sans text-[0.85rem] text-ink-soft">
          Tonuri stinse — calme, discrete
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {PALETTES.filter((p) => p.group === "stinse").map(paletteCard)}
        </div>

        <p className="mt-8 font-sans text-[0.85rem] text-ink-soft">
          Tonuri aprinse — mai multă culoare
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {PALETTES.filter((p) => p.group === "aprinse").map(paletteCard)}
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <label
              htmlFor="paleta_comentariu"
              className="font-sans text-[0.85rem] text-ink-soft"
            >
              Dacă vă place ceva anume dintr-o variantă, scrieți aici
            </label>
            <Saved state={states.paleta_comentariu} />
          </div>
          <textarea
            id="paleta_comentariu"
            rows={2}
            value={a.paleta_comentariu ?? ""}
            onChange={(e) => set("paleta_comentariu", e.target.value)}
            placeholder="De exemplu: îmi place verdele de la 1, dar aș vrea un accent mai cald."
            className={`${field} mt-3 resize-none`}
          />
        </div>
      </Question>

      {/* 2 — fonturi */}
      <Question
        n={2}
        title="Ce tip de font v-ar plăcea?"
        hint="Textul din fiecare exemplu este scris chiar cu fontul propus."
        state={states.font}
      >
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
                    : "border-transparent hover:border-ink/20",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-sans text-[0.9rem] text-ink">
                    {f.n}. {f.display} + {f.body}
                  </span>
                  {chosen && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-periwinkle text-cream">
                      <IconCheck className="h-3.5 w-3.5" strokeWidth={2.6} />
                    </span>
                  )}
                </div>

                <p
                  className="mt-4 text-[1.6rem] leading-tight text-ink"
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
                <p className="mt-4 font-sans text-[0.8rem] text-ink-muted">
                  {f.note}
                </p>
              </button>
            );
          })}
        </div>
      </Question>

      {/* 3 — calendar */}
      <Question
        n={3}
        title="Ce calendar folosiți?"
        hint="Îl legăm de platformă, ca programările să apară automat în calendarul dumneavoastră."
        state={states.calendar}
      >
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
      </Question>

      {/* 4 — contract */}
      <Question
        n={4}
        title="Folosiți un contract cu clienții?"
        hint="Dacă da, încărcați modelul aici. Îl putem automatiza, astfel încât să se completeze singur și să nu mai fie nevoie să îl scrieți de fiecare dată."
        state={states.contract}
      >
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
            <label className="inline-flex cursor-pointer items-center gap-3 rounded-pill border border-dashed border-ink/30 px-6 py-3 font-sans text-[0.87rem] text-ink-soft transition-colors hover:border-periwinkle hover:text-periwinkle">
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
                : "Alegeți fișierul (PDF, Word, poză — max. 10 MB)"}
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
      </Question>

      {/* 5 — contabilitate */}
      <Question
        n={5}
        title="Ce folosiți pentru facturi și contabilitate?"
        hint="Ca facturile să se emită automat după fiecare ședință."
        state={states.contabilitate}
      >
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
      </Question>

      {/* 6 — plăți online */}
      <Question
        n={6}
        title="Aveți cont Stripe, pentru plata online a ședințelor?"
        state={states.stripe}
      >
        <Choice
          value={a.stripe}
          onPick={(v) => set("stripe", v, true)}
          options={[
            { v: "am", label: "Da, am cont" },
            { v: "nu_am", label: "Nu am, deschideți dumneavoastră" },
            { v: "fara_plati", label: "Nu vreau plăți online" },
          ]}
        />

        {a.stripe && a.stripe !== "fara_plati" && (
          <div className="mt-5">
            <label className="font-sans text-[0.85rem] text-ink-soft">
              {a.stripe === "am"
                ? "Pe ce adresă de email este contul?"
                : "Pe ce adresă de email să deschidem contul?"}
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
                Nu ne trimiteți parole sau chei de acces
              </span>{" "}
              — nici aici, nici pe email. E de ajuns adresa: primim din Stripe o
              invitație de colaborator, cu drepturi limitate, pe care le puteți
              retrage oricând. Așa banii rămân doar sub controlul dumneavoastră.
            </p>
          </div>
        )}
      </Question>

      {/* 7 — texte */}
      <Question
        n={7}
        title="Cum procedăm cu textele de pe site?"
        hint="Textele trebuie scrise astfel încât oamenii să vă găsească în Google. Sunt două variante."
        state={states.seo_varianta}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              v: "1",
              t: "Le scriu eu",
              d: "Caut întâi cuvintele după care oamenii chiar caută, scriu textele și vi le trimit spre citit. Modificăm împreună ce nu vă reprezintă.",
              tag: "Mai bine pentru vizibilitate",
            },
            {
              v: "2",
              t: "Le scrieți dumneavoastră",
              d: "Îmi trimiteți textele în cuvintele dumneavoastră, iar eu le ajustez pe alocuri pentru motoarele de căutare.",
              tag: "Mai fidel vocii dumneavoastră",
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
                    : "border-ink/12 bg-cream-warm hover:border-ink/30",
                ].join(" ")}
              >
                <span className="inline-flex rounded-pill bg-cream px-3 py-1 font-sans text-[0.72rem] text-ink-soft">
                  {o.tag}
                </span>
                <p className="mt-3.5 font-display text-[1.1rem] text-ink">{o.t}</p>
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
      </Question>

      {/* 8 — întrebări reale */}
      <Question
        n={8}
        title="Ce întrebări vă pun cel mai des oamenii?"
        hint="Tot mai mulți întreabă un asistent AI înainte să caute în Google. Dacă site-ul răspunde la întrebările reale ale oamenilor, apare în acele răspunsuri. Scrieți întrebările pe care le auziți la telefon sau la prima ședință — câte una pe rând."
        state={states.intrebari_geo}
      >
        <textarea
          rows={7}
          value={a.intrebari_geo ?? ""}
          onChange={(e) => set("intrebari_geo", e.target.value)}
          placeholder={
            "Cât durează o ședință?\nCum îmi dau seama dacă am nevoie de terapie?\nCe fac dacă copilul refuză să vină?\nCât timp trece până văd o schimbare?"
          }
          className={`${field} resize-none leading-[1.9]`}
        />
      </Question>

      {/* 9 — automatizări */}
      <Question
        n={9}
        title="Ce v-ar mai ușura munca?"
        hint="Deocamdată sunt prevăzute: programări online, facturare automată și contracte care se completează singure. Ce vă mai ia timp în fiecare săptămână?"
        state={states.automatizari}
      >
        <textarea
          rows={5}
          value={a.automatizari ?? ""}
          onChange={(e) => set("automatizari", e.target.value)}
          placeholder="De exemplu: amintiri trimise clienților înainte de ședință, formulare de evaluare completate online, dosarul clientului la un loc…"
          className={`${field} resize-none`}
        />
      </Question>

      {/* 10 — liber */}
      <Question n={10} title="Altceva de spus?" state={states.observatii}>
        <textarea
          rows={4}
          value={a.observatii ?? ""}
          onChange={(e) => set("observatii", e.target.value)}
          placeholder="Orice altceva vi se pare important."
          className={`${field} resize-none`}
        />
      </Question>

      <p className="px-2 pt-4 text-center font-sans text-[0.85rem] leading-relaxed text-ink-muted">
        Răspunsurile se salvează pe măsură ce le scrieți. Puteți închide pagina și
        reveni mai târziu — rămâne tot ce ați completat.
      </p>
    </div>
  );
}
