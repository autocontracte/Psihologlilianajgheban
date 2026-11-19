"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw } from "lucide-react";
import { urmareste } from "@/lib/urmarire";
import {
  SCALA,
  afirmatii,
  chestionar as gasesteChestionar,
  complet,
  pasi as toatePasii,
  type IntrebareContext,
  type Pas,
  type Raspunsuri,
} from "@/lib/ghid/chestionare";

/* ----------------------------------------------------------------------------
   Chestionarul gratuit al unei părți din ghid, pas cu pas.

   Fiecare răspuns se salvează pe server (comanda) și în browser, ca omul să
   poată reveni de unde a rămas. La final ajunge pe pagina rezultatului, unde
   vede interpretarea gratuită și poate lua partea din ghid.
   -------------------------------------------------------------------------- */

type Progres = { token: string; raspunsuri: Raspunsuri; pas: number };

const stilCamp =
  "w-full rounded-none border border-ink/15 bg-cream-warm px-5 py-3.5 font-sans text-[0.95rem] text-ink placeholder:text-ink-muted transition-all duration-300 focus:border-periwinkle focus:bg-cream focus:outline-none focus:ring-4 focus:ring-periwinkle/12";

export function ChestionarParte({ nr }: { nr: number }) {
  const c = gasesteChestionar(nr)!;
  const CHEIE = `ghid_progres_${nr}`;
  const nrAfirmatii = afirmatii(c).length;

  const [token, setToken] = useState<string | null>(null);
  const [raspunsuri, setRaspunsuri] = useState<Raspunsuri>({});
  const [pas, setPas] = useState(0);
  const [start, setStart] = useState(false);
  const [reluare, setReluare] = useState<Progres | null>(null);
  const [eroare, setEroare] = useState("");
  const [trimit, setTrimit] = useState(false);
  const salvTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cutie = useRef<HTMLDivElement>(null);

  function citeste(): Progres | null {
    try {
      const p = JSON.parse(localStorage.getItem(CHEIE) ?? "null");
      return p && typeof p.token === "string" ? p : null;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    const p = citeste();
    if (p && Object.keys(p.raspunsuri).length) setReluare(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lista = useMemo(() => toatePasii(c, raspunsuri), [c, raspunsuri]);
  const total = lista.length;
  const curent: Pas | undefined = lista[pas];
  const ultimul = pas === total - 1;

  function pastreaza(next: Partial<Progres>) {
    try {
      const vechi = citeste();
      if (!vechi && !next.token) return;
      localStorage.setItem(CHEIE, JSON.stringify({ ...vechi, ...next }));
    } catch {
      /* navigare privată: progresul rămâne doar pe server */
    }
  }

  function salveaza(next: Raspunsuri) {
    if (!token) return;
    pastreaza({ raspunsuri: next });
    if (salvTimer.current) clearTimeout(salvTimer.current);
    salvTimer.current = setTimeout(() => {
      fetch(`/api/kit/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: next }),
      }).catch(() => {});
    }, 350);
  }

  function mergiLa(n: number) {
    setPas(n);
    pastreaza({ pas: n });
    const r = cutie.current?.getBoundingClientRect();
    if (r && r.top < 0) cutie.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function incepe(dinNou = false) {
    setEroare("");
    if (!dinNou && reluare) {
      setToken(reluare.token);
      setRaspunsuri(reluare.raspunsuri);
      setPas(Math.min(reluare.pas ?? 0, toatePasii(c, reluare.raspunsuri).length - 1));
      setStart(true);
      urmareste("kit_start", `Partea ${nr} · reluat`);
      return;
    }
    try {
      const res = await fetch("/api/kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chestionar: nr }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Nu am putut începe chestionarul.");
      try {
        localStorage.setItem(CHEIE, JSON.stringify({ token: json.token, raspunsuri: {}, pas: 0 }));
      } catch {}
      setToken(json.token);
      setRaspunsuri({});
      setPas(0);
      setStart(true);
      urmareste("kit_start", `Partea ${nr}`);
    } catch (err) {
      setEroare(err instanceof Error ? err.message : "A apărut o eroare.");
    }
  }

  function raspunde(id: string, val: string, avanseaza = false) {
    const next = { ...raspunsuri, [id]: val };
    setRaspunsuri(next);
    salveaza(next);
    setEroare("");
    const n = toatePasii(c, next).length;
    if (avanseaza && pas < n - 1) setTimeout(() => mergiLa(pas + 1), 220);
  }

  function lipsesteRaspuns() {
    if (curent?.tip === "context" && !curent.intrebare.optional && !raspunsuri[curent.intrebare.id]) return true;
    if (curent?.tip === "afirmatie" && !raspunsuri[curent.afirmatie.id]) return true;
    return false;
  }

  function inainte() {
    if (lipsesteRaspuns()) return setEroare("Alege un răspuns ca să continui.");
    setEroare("");
    mergiLa(Math.min(pas + 1, total - 1));
  }

  async function veziRezultatul() {
    if (lipsesteRaspuns()) return setEroare("Alege un răspuns ca să continui.");
    if (!complet(c, raspunsuri)) {
      const i = lista.findIndex(
        (p) =>
          (p.tip === "afirmatie" && !raspunsuri[p.afirmatie.id]) ||
          (p.tip === "context" && !p.intrebare.optional && !raspunsuri[p.intrebare.id]),
      );
      setEroare("Mai sunt întrebări fără răspuns. Te duc la prima.");
      if (i >= 0) mergiLa(i);
      return;
    }
    setTrimit(true);
    setEroare("");
    try {
      const res = await fetch(`/api/kit/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: raspunsuri }),
      });
      if (!res.ok) throw new Error("Nu am putut salva răspunsurile. Încearcă din nou.");
      urmareste("kit_gata", `Partea ${nr}`);
      window.location.href = `/kit/rezultat/${token}`;
    } catch (err) {
      setEroare(err instanceof Error ? err.message : "A apărut o eroare.");
      setTrimit(false);
    }
  }

  /* ---------- Intro ---------- */
  if (!start) {
    const facute = reluare ? afirmatii(c).filter((a) => reluare.raspunsuri[a.id]).length : 0;
    return (
      <div ref={cutie} className="glass-strong p-8 text-center sm:p-12">
        <p className="font-sans text-[0.85rem] text-periwinkle">Chestionar gratuit</p>
        <h2 className="mt-3 font-display text-[1.9rem] leading-tight text-ink sm:text-[2.3rem]">{c.carlig}</h2>
        <p className="mx-auto mt-5 max-w-xl font-sans text-[0.95rem] leading-[1.85] text-ink-soft">
          Câteva întrebări despre situația ta, apoi {nrAfirmatii} afirmații. Pentru fiecare, alegi cât de adevărată e
          pentru tine acum. Nu există răspunsuri bune sau rele, iar răspunsurile se salvează pe măsură ce le dai.
        </p>
        <div className="mx-auto mt-7 flex max-w-lg flex-wrap justify-center gap-x-6 gap-y-2">
          {["În jur de 5 minute", "Rezultat imediat", "Gratuit, fără cont"].map((t) => (
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
            {reluare ? `Continuă (${facute} din ${nrAfirmatii})` : "Începe chestionarul"}
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

  return (
    <div ref={cutie} className="glass-strong scroll-mt-28 p-6 sm:p-10">
      {/* Progres */}
      <div className="mb-8 flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden bg-cream-deep">
          <div className="h-full bg-periwinkle transition-all duration-500" style={{ width: `${((pas + 1) / total) * 100}%` }} />
        </div>
        <span className="min-w-[6.5rem] text-right font-sans text-[0.78rem] text-ink-muted">
          {curent?.tip === "afirmatie" ? `Afirmația ${curent.nr} / ${curent.total}` : ultimul ? "Ultimul pas" : "Despre tine"}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={pas}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          {curent?.tip === "afirmatie" ? (
            <div>
              {curent.nr === 1 && (
                <p className="mb-5 border-l-2 border-sage bg-sage-pale px-4 py-3 font-sans text-[0.84rem] leading-relaxed text-ink-soft">
                  {c.indrumare}
                </p>
              )}
              <p className="font-sans text-[0.8rem] text-ink-muted">Cât de adevărat e pentru tine?</p>
              <h3 className="mt-2 font-display text-[1.45rem] leading-snug text-ink sm:text-[1.75rem]">{curent.afirmatie.text}</h3>
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

      <div className="mt-8 flex items-center justify-between gap-4">
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
        {ultimul ? (
          <button
            type="button"
            onClick={veziRezultatul}
            disabled={trimit}
            className="bg-periwinkle px-7 py-3.5 font-sans text-[0.92rem] text-cream transition-colors hover:bg-ink disabled:opacity-60"
          >
            {trimit ? "Se calculează…" : "Vezi rezultatul"}
          </button>
        ) : (
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
    <p role="alert" className="mx-auto mt-6 max-w-xl border-l-2 border-clay bg-clay-pale px-5 py-3 text-left font-sans text-[0.87rem] text-clay">
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
  valoare: string | undefined;
  onRaspuns: (v: string, avanseaza?: boolean) => void;
}) {
  const text = valoare ?? "";
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
                  text === o ? "border-periwinkle bg-periwinkle-pale text-ink" : "border-ink/15 bg-cream-warm/80 text-ink-soft hover:border-ink/40"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        )}
        {q.tip === "text" && <input value={text} onChange={(e) => onRaspuns(e.target.value)} className={stilCamp} maxLength={200} />}
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
