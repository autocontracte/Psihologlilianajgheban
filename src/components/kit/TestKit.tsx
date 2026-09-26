"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Lock, RotateCcw } from "lucide-react";
import {
  AFIRMATII,
  DIMENSIUNI,
  SCALA,
  calculeaza,
  eSeparat,
  pasi as toatePasii,
  type IntrebareContext,
  type Pas,
  type Raspunsuri,
} from "@/lib/kit/test";

/* ----------------------------------------------------------------------------
   Testul din kit, pas cu pas.

   Fiecare răspuns se salvează pe server (comanda) și în browser, ca omul să
   poată închide pagina și să revină de unde a rămas. La afirmații, un clic
   pe răspuns trece singur la următoarea. La final: previzualizarea
   rezultatului (încețoșată), emailul și plata.
   -------------------------------------------------------------------------- */

const CHEIE = "kit_progres";
type Progres = { token: string; raspunsuri: Raspunsuri; pas: number };

const stilCamp =
  "w-full rounded-none border border-ink/15 bg-cream-warm px-5 py-3.5 font-sans text-[0.95rem] text-ink placeholder:text-ink-muted transition-all duration-300 focus:border-periwinkle focus:bg-cream focus:outline-none focus:ring-4 focus:ring-periwinkle/12";

function citesteProgres(): Progres | null {
  try {
    const p = JSON.parse(localStorage.getItem(CHEIE) ?? "null");
    return p && typeof p.token === "string" ? p : null;
  } catch {
    return null;
  }
}

export function TestKit({ pretLei, platesteActiv }: { pretLei: number; platesteActiv: boolean }) {
  const [token, setToken] = useState<string | null>(null);
  const [raspunsuri, setRaspunsuri] = useState<Raspunsuri>({});
  const [pas, setPas] = useState(0);
  const [start, setStart] = useState(false);
  const [reluare, setReluare] = useState<Progres | null>(null);
  const [email, setEmail] = useState("");
  const [eroare, setEroare] = useState("");
  const [trimit, setTrimit] = useState(false);
  const salvTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cutie = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = citesteProgres();
    if (p && Object.keys(p.raspunsuri).length) setReluare(p);
  }, []);

  const lista = useMemo(() => toatePasii(raspunsuri), [raspunsuri]);
  const total = lista.length;
  const laFinal = pas >= total;
  const curent: Pas | undefined = lista[pas];

  function pastreaza(next: Partial<Progres>) {
    try {
      const vechi = citesteProgres();
      if (!vechi && !next.token) return;
      localStorage.setItem(CHEIE, JSON.stringify({ ...vechi, ...next }));
    } catch {
      /* navigare privată — progresul rămâne doar pe server */
    }
  }

  function salveaza(next: Raspunsuri, mail?: string) {
    if (!token) return;
    pastreaza({ raspunsuri: next });
    if (salvTimer.current) clearTimeout(salvTimer.current);
    salvTimer.current = setTimeout(() => {
      fetch(`/api/kit/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: next, ...(mail !== undefined ? { email: mail } : {}) }),
      }).catch(() => {});
    }, 350);
  }

  function mergiLa(n: number) {
    setPas(n);
    pastreaza({ pas: n });
    // pe telefon, cutia testului rămâne în vizor
    const r = cutie.current?.getBoundingClientRect();
    if (r && r.top < 0) cutie.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function incepe(dinNou = false) {
    setEroare("");
    if (!dinNou && reluare) {
      setToken(reluare.token);
      setRaspunsuri(reluare.raspunsuri);
      setPas(Math.min(reluare.pas ?? 0, toatePasii(reluare.raspunsuri).length));
      setStart(true);
      return;
    }
    try {
      const res = await fetch("/api/kit", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Nu am putut începe testul.");
      localStorage.setItem(CHEIE, JSON.stringify({ token: json.token, raspunsuri: {}, pas: 0 }));
      setToken(json.token);
      setRaspunsuri({});
      setPas(0);
      setStart(true);
    } catch (err) {
      setEroare(err instanceof Error ? err.message : "A apărut o eroare.");
    }
  }

  function raspunde(id: string, val: string, avanseaza = false) {
    const next = { ...raspunsuri, [id]: val };
    setRaspunsuri(next);
    salveaza(next);
    setEroare("");
    if (avanseaza) setTimeout(() => mergiLa(Math.min(pas + 1, toatePasii(next).length)), 220);
  }

  function inainte() {
    if (curent?.tip === "context" && !curent.intrebare.optional) {
      const v = raspunsuri[curent.intrebare.id];
      if (!v) return setEroare("Alege un răspuns ca să continui.");
    }
    if (curent?.tip === "afirmatie" && !raspunsuri[curent.afirmatie.id]) {
      return setEroare("Alege un răspuns ca să continui.");
    }
    setEroare("");
    mergiLa(Math.min(pas + 1, total));
  }

  function emailValid() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setEroare("Scrie o adresă de e-mail validă: acolo primești linkul către raport și ghid.");
      return false;
    }
    return true;
  }

  async function finalizeaza() {
    setEroare("");
    if (!emailValid()) return;
    setTrimit(true);
    try {
      const salvat = await fetch(`/api/kit/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: raspunsuri, email }),
      });
      if (!salvat.ok) throw new Error("Nu am putut salva răspunsurile. Încearcă din nou.");

      if (platesteActiv) {
        const res = await fetch(`/api/kit/${token}/plata`, { method: "POST" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Plata nu a putut fi pornită.");
        window.location.href = json.url;
      } else {
        const res = await fetch(`/api/kit/${token}/gratuit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error ?? "Nu am putut finaliza.");
        localStorage.removeItem(CHEIE);
        window.location.href = `/kit/rezultat/${token}`;
      }
    } catch (err) {
      setEroare(err instanceof Error ? err.message : "A apărut o eroare.");
      setTrimit(false);
    }
  }

  /* ---------- Intro ---------- */
  if (!start) {
    const facute = reluare ? AFIRMATII.filter((a) => reluare.raspunsuri[a.id]).length : 0;
    return (
      <div ref={cutie} className="glass-strong p-8 text-center sm:p-12">
        <p className="font-sans text-[0.85rem] text-periwinkle">Testul din kit</p>
        <h2 className="mt-3 font-display text-[1.9rem] leading-tight text-ink sm:text-[2.4rem]">
          30 de afirmații despre <em className="not-italic text-periwinkle">relația ta</em>
        </h2>
        <p className="mx-auto mt-5 max-w-xl font-sans text-[0.95rem] leading-[1.85] text-ink-soft">
          Pentru fiecare, alegi cât de des e adevărată pentru voi. Nu există răspunsuri bune sau rele: contează
          doar cum vezi tu lucrurile acum. Durează în jur de 10 minute, iar răspunsurile se salvează pe măsură ce
          le dai.
        </p>
        <div className="mx-auto mt-7 flex max-w-lg flex-wrap justify-center gap-x-6 gap-y-2">
          {["30 de întrebări", "6 dimensiuni", "Plătești doar la final"].map((t) => (
            <span key={t} className="flex items-center gap-2 font-sans text-[0.86rem] text-ink">
              <Check className="h-4 w-4 text-periwinkle" aria-hidden />
              {t}
            </span>
          ))}
        </div>
        {eroare && <Eroare text={eroare} />}
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => incepe(false)}
            className="bg-periwinkle px-9 py-4 font-sans text-[0.95rem] text-cream transition-colors hover:bg-ink"
          >
            {reluare ? `Continuă testul (${facute} din 30)` : "Începe testul"}
          </button>
          {reluare && (
            <button
              type="button"
              onClick={() => incepe(true)}
              className="inline-flex items-center gap-2 px-5 py-4 font-sans text-[0.88rem] text-ink-soft underline-offset-4 hover:text-ink hover:underline"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Începe din nou
            </button>
          )}
        </div>
      </div>
    );
  }

  const nrAfirmatie = curent?.tip === "afirmatie" ? curent.nr : null;

  return (
    <div ref={cutie} className="glass-strong scroll-mt-28 p-6 sm:p-10">
      {/* Progres */}
      <div className="mb-8 flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden bg-cream-deep">
          <div
            className="h-full bg-periwinkle transition-all duration-500"
            style={{ width: `${(Math.min(pas + 1, total + 1) / (total + 1)) * 100}%` }}
          />
        </div>
        <span className="min-w-[5.5rem] text-right font-sans text-[0.78rem] text-ink-muted">
          {laFinal ? "Gata" : nrAfirmatie ? `Afirmația ${nrAfirmatie} / 30` : pas > 0 && lista[pas - 1]?.tip === "afirmatie" ? "Ultimul pas" : "Despre voi"}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={laFinal ? "final" : pas}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          {laFinal ? (
            <EcranFinal
              raspunsuri={raspunsuri}
              email={email}
              setEmail={setEmail}
              pretLei={pretLei}
              platesteActiv={platesteActiv}
              trimit={trimit}
              onFinalizeaza={finalizeaza}
            />
          ) : curent?.tip === "afirmatie" ? (
            <div>
              {eSeparat(raspunsuri) && curent.nr === 1 && (
                <p className="mb-5 border-l-2 border-sage bg-sage-pale px-4 py-3 font-sans text-[0.84rem] leading-relaxed text-ink-soft">
                  Pentru că v-ați despărțit sau sunteți în divorț, răspunde gândindu-te la ultima perioadă a
                  relației.
                </p>
              )}
              <p className="font-sans text-[0.8rem] text-ink-muted">Cât de des e adevărat pentru voi?</p>
              <h3 className="mt-2 font-display text-[1.45rem] leading-snug text-ink sm:text-[1.75rem]">
                {curent.afirmatie.text}
              </h3>
              <div className="mt-7 grid gap-2 sm:grid-cols-5">
                {SCALA.map((s) => {
                  const ales = raspunsuri[curent.afirmatie.id] === s.valoare;
                  return (
                    <button
                      key={s.valoare}
                      type="button"
                      onClick={() => raspunde(curent.afirmatie.id, s.valoare, true)}
                      aria-pressed={ales}
                      className={[
                        "flex items-center gap-3 border px-4 py-3.5 text-left font-sans text-[0.9rem] transition-colors sm:flex-col sm:justify-center sm:gap-2 sm:px-2 sm:py-5 sm:text-center",
                        ales
                          ? "border-periwinkle bg-periwinkle text-cream"
                          : "border-ink/15 bg-cream-warm/80 text-ink-soft hover:border-periwinkle hover:text-ink",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex h-7 w-7 shrink-0 items-center justify-center font-display text-[0.95rem]",
                          ales ? "bg-cream text-periwinkle" : "bg-periwinkle-pale text-periwinkle",
                        ].join(" ")}
                      >
                        {s.valoare}
                      </span>
                      <span className="leading-tight">{s.eticheta}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : curent ? (
            <IntrebareContextCard
              q={curent.intrebare}
              valoare={raspunsuri[curent.intrebare.id]}
              onRaspuns={(v, avans) => raspunde(curent.intrebare.id, v, avans)}
            />
          ) : null}
        </motion.section>
      </AnimatePresence>

      {eroare && <Eroare text={eroare} />}

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setEroare("");
            mergiLa(Math.max(0, pas - 1));
          }}
          disabled={pas === 0}
          className="font-sans text-[0.85rem] text-ink-muted underline underline-offset-4 disabled:opacity-0"
        >
          Înapoi
        </button>
        {!laFinal && (curent?.tip === "context" || raspunsuri[curent?.afirmatie.id ?? ""]) && (
          <button
            type="button"
            onClick={inainte}
            className="bg-ink px-7 py-3 font-sans text-[0.88rem] text-cream transition-colors hover:bg-periwinkle"
          >
            {curent?.tip === "context" && curent.intrebare.optional ? "Continuă" : "Mai departe"}
          </button>
        )}
      </div>
    </div>
  );
}

function Eroare({ text }: { text: string }) {
  return (
    <p className="mx-auto mt-6 max-w-xl border-l-2 border-clay bg-clay-pale px-5 py-3 text-left font-sans text-[0.87rem] text-clay">
      {text}
    </p>
  );
}

function IntrebareContextCard({
  q,
  valoare,
  onRaspuns,
}: {
  q: IntrebareContext;
  valoare: string | string[] | undefined;
  onRaspuns: (v: string, avanseaza?: boolean) => void;
}) {
  const text = typeof valoare === "string" ? valoare : "";
  return (
    <div>
      <h3 className="font-display text-[1.45rem] leading-snug text-ink sm:text-[1.75rem]">{q.intrebare}</h3>
      {q.ajutor && <p className="mt-2 font-sans text-[0.87rem] leading-relaxed text-ink-soft">{q.ajutor}</p>}
      <div className="mt-6">
        {q.tip === "single" && (
          <div className="grid gap-2.5">
            {q.optiuni!.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => onRaspuns(o, true)}
                aria-pressed={text === o}
                className={`w-full border px-5 py-3.5 text-left font-sans text-[0.92rem] transition-colors ${
                  text === o
                    ? "border-periwinkle bg-periwinkle-pale text-ink"
                    : "border-ink/15 bg-cream-warm/80 text-ink-soft hover:border-ink/40"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        )}
        {q.tip === "text" && (
          <input value={text} onChange={(e) => onRaspuns(e.target.value)} className={stilCamp} maxLength={200} />
        )}
        {q.tip === "long" && (
          <textarea
            rows={6}
            value={text}
            onChange={(e) => onRaspuns(e.target.value)}
            maxLength={4000}
            placeholder="Scrie cât de mult sau cât de puțin vrei."
            className={`${stilCamp} resize-none`}
          />
        )}
      </div>
    </div>
  );
}

/** Finalul: previzualizarea încețoșată a rezultatului, emailul și plata. */
function EcranFinal({
  raspunsuri,
  email,
  setEmail,
  pretLei,
  platesteActiv,
  trimit,
  onFinalizeaza,
}: {
  raspunsuri: Raspunsuri;
  email: string;
  setEmail: (v: string) => void;
  pretLei: number;
  platesteActiv: boolean;
  trimit: boolean;
  onFinalizeaza: () => void;
}) {
  const rez = calculeaza(raspunsuri);
  const lipsa = AFIRMATII.filter((a) => !raspunsuri[a.id]).length;

  if (!rez) {
    return (
      <div className="text-center">
        <h3 className="font-display text-[1.6rem] text-ink">Mai ai {lipsa} afirmații fără răspuns</h3>
        <p className="mt-2 font-sans text-[0.9rem] text-ink-soft">
          Întoarce-te cu „Înapoi” și completează-le, ca raportul să fie complet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="font-sans text-[0.85rem] text-periwinkle">Ai terminat testul</p>
      <h3 className="mt-2 font-display text-[1.7rem] leading-snug text-ink sm:text-[2rem]">
        Rezultatul tău e pregătit
      </h3>

      {/* Previzualizare încețoșată */}
      <div className="relative mt-6 overflow-hidden border border-ink/10 bg-cream-warm p-6">
        {/* Doar decor: scorul real se vede după plată, nu stă ascuns în pagină. */}
        <div aria-hidden className="pointer-events-none select-none blur-[6px]">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[3rem] leading-none text-periwinkle">00</span>
            <span className="font-sans text-ink-muted">/ 100</span>
          </div>
          <div className="mt-5 space-y-3">
            {[62, 38, 71, 45, 56, 30].map((w, i) => (
              <div key={i} className="h-2 bg-cream-deep">
                <div className="h-full bg-periwinkle" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-cream-warm/40 px-6 text-center">
          <span className="flex h-11 w-11 items-center justify-center bg-ink text-cream">
            <Lock className="h-5 w-5" aria-hidden />
          </span>
          <p className="mt-3 font-display text-[1.15rem] text-ink">Indicele relației și profilul pe 6 dimensiuni</p>
          <p className="mt-1 max-w-sm font-sans text-[0.82rem] text-ink-soft">
            {DIMENSIUNI.map((d) => d.nume).join(" · ")}
          </p>
        </div>
      </div>

      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {[
          "Raport personal detaliat, pe ecran și în PDF",
          "Analiza fiecărei dimensiuni și tiparul relației",
          "Plan concret pentru următoarele 30 de zile",
          "Ghidul practic de 63 de pagini, în PDF",
        ].map((t) => (
          <li key={t} className="flex items-start gap-2.5 font-sans text-[0.88rem] text-ink">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-periwinkle" aria-hidden />
            {t}
          </li>
        ))}
      </ul>

      <div className="mt-7">
        <label htmlFor="kit-email" className="block font-sans text-[0.83rem] text-ink-soft">
          Adresa ta de e-mail (acolo primești linkul către raport)
        </label>
        <input
          id="kit-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nume@exemplu.ro"
          className={`${stilCamp} mt-2`}
        />
      </div>

      {!platesteActiv && (
        <p className="mt-5 border-l-2 border-sage bg-sage-pale px-5 py-3 font-sans text-[0.83rem] leading-relaxed text-ink-soft">
          În perioada de testare primești kitul <span className="font-semibold text-ink">gratuit</span>. Plata de{" "}
          {pretLei} lei se activează în curând.
        </p>
      )}

      <button
        type="button"
        onClick={onFinalizeaza}
        disabled={trimit}
        className="mt-5 flex w-full items-center justify-center gap-3 bg-periwinkle px-8 py-4 font-sans text-[0.97rem] text-cream transition-colors hover:bg-ink disabled:opacity-60"
      >
        {trimit
          ? platesteActiv
            ? "Se deschide plata…"
            : "Se pregătește…"
          : platesteActiv
            ? `Obține kitul · ${pretLei} lei`
            : "Primește kitul gratuit"}
      </button>
      <p className="mt-3 text-center font-sans text-[0.76rem] leading-relaxed text-ink-muted">
        {platesteActiv ? "Plată sigură prin Stripe · " : ""}Acces imediat · Raportul e confidențial și rămâne doar al tău
      </p>
    </div>
  );
}
