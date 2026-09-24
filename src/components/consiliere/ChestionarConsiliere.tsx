"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  INTREBARI,
  intrebariVizibile,
  type Intrebare,
  type Raspunsuri,
} from "@/lib/consiliere/intrebari";

/* ----------------------------------------------------------------------------
   Chestionarul pentru ghidul despre divorț.

   Merge pe pași, salvează fiecare răspuns pe măsură ce e dat (poți închide și
   reveni de pe același dispozitiv), iar la final ceri emailul și plătești.
   Tokenul comenzii stă în localStorage, ca să poți relua.
   -------------------------------------------------------------------------- */

/* Ghidul și evaluarea gratuită au fiecare progresul lor salvat. */
const CHEI_TOKEN = { ghid: "consiliere_token", evaluare: "evaluare_token" } as const;
type Mod = keyof typeof CHEI_TOKEN;

const stilCamp =
  "w-full rounded-none border border-ink/15 bg-cream-warm px-5 py-3.5 font-sans text-[0.95rem] text-ink placeholder:text-ink-muted transition-all duration-300 focus:border-periwinkle focus:bg-cream focus:outline-none focus:ring-4 focus:ring-periwinkle/12";

export function ChestionarConsiliere({
  platesteActiv = false,
  mod = "ghid",
}: {
  platesteActiv?: boolean;
  /** `evaluare` — evaluarea psihologică gratuită: interpretare fără plată și fără PDF. */
  mod?: Mod;
}) {
  const CHEIE_TOKEN = CHEI_TOKEN[mod];
  const [token, setToken] = useState<string | null>(null);
  const [raspunsuri, setRaspunsuri] = useState<Raspunsuri>({});
  const [pas, setPas] = useState(0);
  const [email, setEmail] = useState("");
  const [start, setStart] = useState(false);
  const [eroare, setEroare] = useState("");
  const [trimit, setTrimit] = useState(false);
  const salvTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // La montare: reia comanda din localStorage sau creează una nouă.
  useEffect(() => {
    const existent = typeof window !== "undefined" ? localStorage.getItem(CHEIE_TOKEN) : null;
    if (existent) setToken(existent);
  }, []);

  async function incepe() {
    setEroare("");
    if (token) { setStart(true); return; }
    try {
      const res = await fetch(mod === "evaluare" ? "/api/evaluare" : "/api/consiliere", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Nu am putut începe.");
      localStorage.setItem(CHEIE_TOKEN, json.token);
      setToken(json.token);
      setStart(true);
    } catch (err) {
      setEroare(err instanceof Error ? err.message : "A apărut o eroare.");
    }
  }

  const vizibile = intrebariVizibile(raspunsuri);
  const totalPasi = vizibile.length + 1; // + pasul de email/plată
  const laEmail = pas >= vizibile.length;

  function salveaza(next: Raspunsuri, mail?: string) {
    if (!token) return;
    if (salvTimer.current) clearTimeout(salvTimer.current);
    salvTimer.current = setTimeout(() => {
      fetch(`/api/consiliere/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: next, ...(mail !== undefined ? { email: mail } : {}) }),
      }).catch(() => {});
    }, 400);
  }

  function raspunde(id: string, val: string | string[]) {
    const next = { ...raspunsuri, [id]: val };
    setRaspunsuri(next);
    salveaza(next);
  }

  function inainte() {
    const q = vizibile[pas];
    if (q && !q.optional) {
      const v = raspunsuri[q.id];
      if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) {
        setEroare("Alege un răspuns ca să continui.");
        return;
      }
    }
    setEroare("");
    setPas((p) => Math.min(p + 1, vizibile.length));
  }

  function emailValid() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setEroare("Scrie o adresă de e-mail validă, ca să primești ghidul.");
      return false;
    }
    return true;
  }

  async function plateste() {
    setEroare("");
    if (!emailValid()) return;
    setTrimit(true);
    try {
      await fetch(`/api/consiliere/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: raspunsuri, email }),
      });
      const res = await fetch(`/api/consiliere/${token}/plata`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Plata nu a putut fi pornită.");
      window.location.href = json.url;
    } catch (err) {
      setEroare(err instanceof Error ? err.message : "A apărut o eroare.");
      setTrimit(false);
    }
  }

  // În perioada de testare (fără Stripe): finalizează gratuit și du la rezultat.
  async function primesteGratuit() {
    setEroare("");
    if (!emailValid()) return;
    setTrimit(true);
    try {
      const res = await fetch(`/api/consiliere/${token}/gratuit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Nu am putut finaliza.");
      window.location.href = `/consiliere/rezultat/${token}`;
    } catch (err) {
      setEroare(err instanceof Error ? err.message : "A apărut o eroare.");
      setTrimit(false);
    }
  }

  // Evaluarea gratuită: salvează ce a mai rămas, generează interpretarea și du la rezultat.
  async function finalizeazaEvaluarea() {
    setEroare("");
    if (email.trim() && !/^[^s@]+@[^s@]+.[^s@]{2,}$/.test(email.trim())) {
      setEroare("Adresa de e-mail nu pare validă. O poți lăsa și goală.");
      return;
    }
    setTrimit(true);
    try {
      const res = await fetch(`/api/evaluare/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: raspunsuri, email }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Nu am putut pregăti interpretarea.");
      // evaluarea s-a încheiat: data viitoare, una nouă
      localStorage.removeItem(CHEIE_TOKEN);
      window.location.href = `/evaluare-gratuita/rezultat/${token}`;
    } catch (err) {
      setEroare(err instanceof Error ? err.message : "A apărut o eroare.");
      setTrimit(false);
    }
  }

  /* ---------- ecranul de intro ---------- */
  if (!start) {
    return (
      <div className="border border-ink/10 bg-cream p-8 text-center sm:p-12">
        <p className="font-sans text-[0.8rem] tracking-[0.02em] text-periwinkle">
          {mod === "evaluare" ? "Evaluare gratuită" : "Ghid + interpretare personalizată"}
        </p>
        <h2 className="mt-4 font-display text-[1.9rem] leading-tight text-ink sm:text-[2.3rem]">
          Răspunzi la câteva întrebări, primești o perspectivă
        </h2>
        <p className="mx-auto mt-5 max-w-xl font-sans text-[0.95rem] leading-[1.9] text-ink-soft">
          {mod === "evaluare"
            ? "Câteva întrebări scurte despre situația ta. Pe baza lor primești, gratuit, o interpretare personală și câțiva pași concreți. Durează doar câteva minute."
            : "Câteva întrebări scurte despre situația ta. Pe baza lor primești o interpretare personală, sprijinită pe „Ghidul practic despre divorț\", plus ghidul complet în PDF. Durează câteva minute."}
        </p>
        {eroare && (
          <p className="mx-auto mt-5 max-w-md border-l-2 border-clay bg-clay-pale px-5 py-3 font-sans text-[0.87rem] text-clay">
            {eroare}
          </p>
        )}
        <button
          type="button"
          onClick={incepe}
          className="mt-8 bg-periwinkle px-9 py-4 font-sans text-[0.95rem] text-cream transition-colors hover:bg-ink"
        >
          {mod === "evaluare" ? "Începe evaluarea" : "Începe"}
        </button>
        <p className="mt-4 font-sans text-[0.8rem] text-ink-muted">
          Răspunsurile se salvează pe măsură ce le dai.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-ink/10 bg-cream p-7 sm:p-10">
      {/* Progres */}
      <div className="mb-8 flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden bg-cream-deep">
          <div
            className="h-full bg-periwinkle transition-all duration-500"
            style={{ width: `${((pas + 1) / totalPasi) * 100}%` }}
          />
        </div>
        <span className="font-sans text-[0.78rem] text-ink-muted">
          {Math.min(pas + 1, totalPasi)} / {totalPasi}
        </span>
      </div>

      <motion.section
        key={pas}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        {laEmail && mod === "evaluare" ? (
          <EcranFinalEvaluare email={email} setEmail={setEmail} trimit={trimit} onFinalizeaza={finalizeazaEvaluarea} />
        ) : laEmail ? (
          <EcranEmail
            email={email}
            setEmail={(v) => { setEmail(v); }}
            raspunsuri={raspunsuri}
            platesteActiv={platesteActiv}
            trimit={trimit}
            onPlateste={plateste}
            onGratuit={primesteGratuit}
          />
        ) : (
          <IntrebareCard
            intrebare={vizibile[pas]}
            valoare={raspunsuri[vizibile[pas].id]}
            onRaspuns={(v) => raspunde(vizibile[pas].id, v)}
          />
        )}
      </motion.section>

      {eroare && (
        <p className="mt-6 border-l-2 border-clay bg-clay-pale px-5 py-3 font-sans text-[0.87rem] text-clay">
          {eroare}
        </p>
      )}

      {/* Navigare */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => { setEroare(""); setPas((p) => Math.max(0, p - 1)); }}
          disabled={pas === 0}
          className="font-sans text-[0.85rem] text-ink-muted underline underline-offset-4 disabled:opacity-0"
        >
          Înapoi
        </button>
        {!laEmail && (
          <button
            type="button"
            onClick={inainte}
            className="bg-ink px-7 py-3 font-sans text-[0.88rem] text-cream transition-colors hover:bg-periwinkle"
          >
            {vizibile[pas]?.optional ? "Continuă" : "Mai departe"}
          </button>
        )}
      </div>
    </div>
  );
}

function IntrebareCard({
  intrebare: q,
  valoare,
  onRaspuns,
}: {
  intrebare: Intrebare;
  valoare: string | string[] | undefined;
  onRaspuns: (v: string | string[]) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-[1.5rem] leading-snug text-ink sm:text-[1.8rem]">
        {q.intrebare}
      </h2>
      {q.ajutor && (
        <p className="mt-2 font-sans text-[0.87rem] text-ink-soft">{q.ajutor}</p>
      )}

      <div className="mt-6">
        {q.tip === "single" && (
          <div className="grid gap-2.5">
            {q.optiuni!.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => onRaspuns(o)}
                className={`w-full border px-5 py-3.5 text-left font-sans text-[0.92rem] transition-colors ${
                  valoare === o
                    ? "border-periwinkle bg-periwinkle-pale text-ink"
                    : "border-ink/15 bg-cream-warm text-ink-soft hover:border-ink/40"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        )}

        {q.tip === "multi" && (
          <div className="grid gap-2.5">
            {q.optiuni!.map((o) => {
              const arr = Array.isArray(valoare) ? valoare : [];
              const ales = arr.includes(o);
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() =>
                    onRaspuns(ales ? arr.filter((x) => x !== o) : [...arr, o])
                  }
                  className={`flex w-full items-center gap-3 border px-5 py-3.5 text-left font-sans text-[0.92rem] transition-colors ${
                    ales
                      ? "border-periwinkle bg-periwinkle-pale text-ink"
                      : "border-ink/15 bg-cream-warm text-ink-soft hover:border-ink/40"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
                      ales ? "border-periwinkle bg-periwinkle text-cream" : "border-ink/30"
                    }`}
                  >
                    {ales && <span className="mi" style={{ fontSize: "0.8rem" }}>check</span>}
                  </span>
                  {o}
                </button>
              );
            })}
          </div>
        )}

        {q.tip === "text" && (
          <input
            value={typeof valoare === "string" ? valoare : ""}
            onChange={(e) => onRaspuns(e.target.value)}
            className={stilCamp}
          />
        )}

        {q.tip === "long" && (
          <textarea
            rows={5}
            value={typeof valoare === "string" ? valoare : ""}
            onChange={(e) => onRaspuns(e.target.value)}
            className={`${stilCamp} resize-none`}
          />
        )}
      </div>
    </div>
  );
}

function EcranEmail({
  email,
  setEmail,
  raspunsuri,
  platesteActiv,
  trimit,
  onPlateste,
  onGratuit,
}: {
  email: string;
  setEmail: (v: string) => void;
  raspunsuri: Raspunsuri;
  platesteActiv: boolean;
  trimit: boolean;
  onPlateste: () => void;
  onGratuit: () => void;
}) {
  const completate = INTREBARI.filter((q) => {
    const v = raspunsuri[q.id];
    return v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0);
  }).length;

  return (
    <div>
      <h2 className="font-display text-[1.5rem] leading-snug text-ink sm:text-[1.8rem]">
        Aproape gata
      </h2>
      <p className="mt-2 font-sans text-[0.9rem] leading-relaxed text-ink-soft">
        Ai completat {completate} răspunsuri. Lasă adresa de e-mail, acolo
        primești ghidul și interpretarea, ca să le ai și mai târziu.
      </p>

      <div className="mt-6">
        <label className="block font-sans text-[0.83rem] text-ink-soft">
          Adresa de e-mail
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nume@exemplu.ro"
          className={`${stilCamp} mt-2 max-w-md`}
        />
      </div>

      <div className="mt-8 border border-ink/10 bg-cream-warm p-6">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-[1.2rem] text-ink">Ghidul complet + interpretarea ta</span>
          <span className="font-display text-[1.6rem] text-ink">50 lei</span>
        </div>
        <p className="mt-2 font-sans text-[0.85rem] leading-relaxed text-ink-soft">
          Interpretare personală pe baza răspunsurilor tale și „Ghidul practic
          despre divorț" în PDF (63 de pagini).
        </p>

        {platesteActiv ? (
          <button
            type="button"
            onClick={onPlateste}
            disabled={trimit}
            className="mt-5 w-full bg-periwinkle px-8 py-4 font-sans text-[0.95rem] text-cream transition-colors hover:bg-ink disabled:opacity-60"
          >
            {trimit ? "Se deschide plata…" : "Plătește 50 lei"}
          </button>
        ) : (
          <div className="mt-5">
            <div className="border-l-2 border-sage bg-sage-pale px-5 py-3 font-sans text-[0.83rem] leading-relaxed text-ink-soft">
              În perioada de testare, primești interpretarea și ghidul{" "}
              <span className="font-semibold text-ink">gratuit</span>. Plata de 50
              lei se va activa în curând.
            </div>
            <button
              type="button"
              onClick={onGratuit}
              disabled={trimit}
              className="mt-3 w-full bg-periwinkle px-8 py-4 font-sans text-[0.95rem] text-cream transition-colors hover:bg-ink disabled:opacity-60"
            >
              {trimit ? "Se pregătește…" : "Primește gratuit interpretarea și ghidul"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Finalul evaluării gratuite: emailul e opțional, interpretarea apare pe loc. */
function EcranFinalEvaluare({
  email,
  setEmail,
  trimit,
  onFinalizeaza,
}: {
  email: string;
  setEmail: (v: string) => void;
  trimit: boolean;
  onFinalizeaza: () => void;
}) {
  return (
    <div>
      <h2 className="font-display text-[1.5rem] leading-snug text-ink sm:text-[1.8rem]">Aproape gata</h2>
      <p className="mt-2 font-sans text-[0.9rem] leading-relaxed text-ink-soft">
        Interpretarea ta apare imediat, pe pagina următoare. Dacă vrei, lasă și adresa de e-mail,
        ca Liliana să îți poată scrie. E opțional.
      </p>
      <div className="mt-6">
        <label className="block font-sans text-[0.83rem] text-ink-soft">Adresa de e-mail (opțional)</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nume@exemplu.ro"
          className={`${stilCamp} mt-2 max-w-md`}
        />
      </div>
      <button
        type="button"
        onClick={onFinalizeaza}
        disabled={trimit}
        className="mt-8 w-full bg-periwinkle px-8 py-4 font-sans text-[0.95rem] text-cream transition-colors hover:bg-ink disabled:opacity-60 sm:w-auto"
      >
        {trimit ? "Se pregătește interpretarea…" : "Vezi interpretarea mea"}
      </button>
      <p className="mt-3 font-sans text-[0.78rem] leading-relaxed text-ink-muted">
        Pregătirea durează câteva secunde. Interpretarea e o reflecție de psihoeducație, nu un
        diagnostic, și nu înlocuiește o ședință de terapie.
      </p>
    </div>
  );
}
