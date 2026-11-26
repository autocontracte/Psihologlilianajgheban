"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { urmareste } from "@/lib/urmarire";
import {
  APASA,
  CAUTA,
  COPII,
  DURATA,
  SIGURANTA,
  SITUATII,
  chestionar,
  chestionarRecomandat,
  type Raspunsuri,
} from "@/lib/ghid/chestionare";
import { PARTI, PRET_PARTE_LEI, parte as gasesteParte } from "@/lib/ghid/parti";
import { Carte3D } from "./Carte3D";
import s from "./ghidgeneral.module.css";

/* ----------------------------------------------------------------------------
   Chestionarul general de pe /kit.

   Șase întrebări despre situație arată ce parte a ghidului ți se potrivește.
   Urmează o scurtă animație („căutăm ghidul potrivit”), apoi rezultatul.
   „Continuă” pornește direct chestionarul părții, cu răspunsurile de aici deja
   completate: se creează comanda, se salvează răspunsurile, iar pagina
   părții reia de la prima întrebare la care nu s-a răspuns. Întrebările în
   plus (ce te apasă, de cât timp, ce cauți) ajung și în raportul personal.
   -------------------------------------------------------------------------- */

const INTREBARI: { id: string; titlu: string; ajutor?: string; optiuni: readonly string[] }[] = [
  { id: "situatia", titlu: "Unde te afli acum în relație?", optiuni: SITUATII },
  {
    id: "copii",
    titlu: "Aveți copii împreună?",
    ajutor: "Dacă ai o familie nouă, gândește-te la copiii din relația ta anterioară.",
    optiuni: COPII,
  },
  { id: "apasa", titlu: "Ce te apasă cel mai mult acum?", ajutor: "Alege ce e cel mai aproape de adevăr.", optiuni: APASA },
  { id: "durata", titlu: "De cât timp simți asta?", optiuni: DURATA },
  { id: "cauta", titlu: "Ce cauți acum, înainte de toate?", optiuni: CAUTA },
  {
    id: "siguranta",
    titlu: "Ți s-a întâmplat să-ți fie frică de partener sau de fostul partener?",
    ajutor: "Răspunsul rămâne confidențial. Dacă e cazul, îți arătăm unde poți cere ajutor imediat.",
    optiuni: SIGURANTA,
  },
];

const CAUTARE = [
  "Citim ce ne-ai spus despre situația ta",
  "Ne uităm prin cele 4 părți ale ghidului",
  "Potrivim capitolele cu ce te apasă",
  "Am găsit ghidul potrivit pentru tine",
];
const DURATA_CAUTARE = 3800;

const mic = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);

export function GhidGeneral() {
  const [pas, setPas] = useState(0);
  const [r, setR] = useState<Raspunsuri>({});
  const [trimit, setTrimit] = useState(false);
  const [eroare, setEroare] = useState("");
  const [tic, setTic] = useState(0);

  const CAUT = INTREBARI.length; // ecranul de căutare
  const GATA = CAUT + 1; // rezultatul
  const c = pas >= CAUT ? chestionar(chestionarRecomandat(r)) : null;
  const p = gasesteParte(c?.parte);

  // Căutarea: cărțile se luminează pe rând, apoi rămâne cea găsită
  useEffect(() => {
    if (pas !== CAUT) return;
    const redus = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTic(0);
    const ceas = setInterval(() => setTic((x) => x + 1), 420);
    const gata = setTimeout(() => setPas(GATA), redus ? 900 : DURATA_CAUTARE);
    return () => {
      clearInterval(ceas);
      clearTimeout(gata);
    };
  }, [pas, CAUT, GATA]);

  function alege(id: string, v: string) {
    const next = { ...r, [id]: v };
    setR(next);
    if (pas === 0) urmareste("kit_start", "chestionarul general");
    setTimeout(() => setPas((x) => Math.min(x + 1, CAUT)), 220);
  }

  async function continua() {
    if (!p || !c) return;
    setTrimit(true);
    setEroare("");
    try {
      const res = await fetch("/api/kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chestionar: c.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Nu am putut porni chestionarul.");
      await fetch(`/api/kit/${json.token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: r }),
      });
      try {
        localStorage.setItem(`ghid_progres_${c.id}`, JSON.stringify({ token: json.token, raspunsuri: r, pas: 0 }));
      } catch {}
      urmareste("kit_start", `general → Partea ${p.nr}`);
      window.location.href = `/kit/${c.slug}?continua=1#chestionar`;
    } catch (err) {
      setEroare(err instanceof Error ? err.message : "A apărut o eroare.");
      setTrimit(false);
    }
  }

  const q = INTREBARI[pas];
  const procent = pas >= CAUT ? 100 : (pas / CAUT) * 100;
  const etapa = Math.min(Math.floor((tic * 420) / (DURATA_CAUTARE / CAUTARE.length)), CAUTARE.length - 1);
  const gasit = etapa === CAUTARE.length - 1;
  const frica = r.siguranta && r.siguranta !== SIGURANTA[0];

  return (
    <div className="glass-strong overflow-hidden">
      <div className="h-1 bg-cream-deep">
        <div className="h-full bg-periwinkle transition-all duration-500" style={{ width: `${procent}%` }} />
      </div>

      <div className="p-6 sm:p-10">
        {pas > 0 && pas < CAUT && (
          <button
            type="button"
            onClick={() => setPas((x) => x - 1)}
            className="mb-5 inline-flex items-center gap-1.5 font-sans text-[0.84rem] text-ink-muted hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Înapoi
          </button>
        )}

        {/* Întrebările */}
        {q && (
          <div key={q.id} className={s.mesaj}>
            <p className="font-sans text-[0.8rem] tracking-[0.04em] text-periwinkle">
              ÎNTREBAREA {pas + 1} DIN {INTREBARI.length}
            </p>
            <h3 className="mt-2 font-display text-[1.6rem] leading-snug text-ink sm:text-[1.9rem]">{q.titlu}</h3>
            {q.ajutor && <p className="mt-2 font-sans text-[0.88rem] text-ink-soft">{q.ajutor}</p>}
            <div className="mt-6 grid gap-2.5">
              {q.optiuni.map((o) => {
                const ales = r[q.id] === o;
                return (
                  <button
                    key={o}
                    type="button"
                    onClick={() => alege(q.id, o)}
                    aria-pressed={ales}
                    className={`flex w-full items-center justify-between gap-4 border px-5 py-4 text-left font-sans text-[0.95rem] transition-colors ${
                      ales ? "border-periwinkle bg-periwinkle text-cream" : "border-ink/15 bg-cream-warm/80 text-ink hover:border-periwinkle"
                    }`}
                  >
                    {o}
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center border ${
                        ales ? "border-cream bg-cream text-periwinkle" : "border-ink/25"
                      }`}
                    >
                      {ales && <Check className="h-3.5 w-3.5" aria-hidden />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Căutarea */}
        {pas === CAUT && p && (
          <div className="py-4 text-center" role="status" aria-live="polite">
            <p className="font-sans text-[0.8rem] tracking-[0.04em] text-periwinkle">O CLIPĂ</p>
            <h3 className="mt-2 font-display text-[1.7rem] leading-snug text-ink sm:text-[2rem]">
              Căutăm ghidul potrivit pentru tine
            </h3>
            <div className={`${s.raft} mt-10`}>
              {PARTI.map((x, i) => {
                const stare = gasit
                  ? x.nr === p.nr
                    ? s.gasit
                    : s.stins
                  : tic % PARTI.length === i
                    ? s.activ
                    : "";
                return (
                  <div key={x.nr} className={`${s.volum} ${stare}`}>
                    <Carte3D parte={x} rotatieY={-20} rotatieX={4} grosime={10} />
                  </div>
                );
              })}
            </div>
            <div className={`${s.scanare} mx-auto max-w-md`} />
            <p key={etapa} className={`${s.mesaj} mt-5 font-sans text-[0.95rem] text-ink-soft`}>
              {CAUTARE[etapa]}
              {!gasit && "…"}
            </p>
          </div>
        )}

        {/* Rezultatul */}
        {pas === GATA && p && c && (
          <div className="grid items-center gap-8 sm:grid-cols-[12rem_1fr]">
            <div className={s.intrare}>
              <Carte3D parte={p} rotatieY={-24} rotatieX={5} grosime={18} className="mx-auto w-[10rem] sm:w-[12rem]" />
            </div>
            <div className={s.textIntrare}>
              <p className="font-sans text-[0.8rem] tracking-[0.04em] text-sage">GHIDUL CARE ȚI SE POTRIVEȘTE</p>
              <h3 className="mt-2 font-display text-[1.7rem] leading-snug text-ink sm:text-[2rem]">
                Partea {p.nr}: {p.titlu}
              </h3>
              <p className="mt-3 font-sans text-[0.93rem] leading-relaxed text-ink-soft">
                Pentru că ai spus că {mic(r.situatia ?? "")}
                {r.apasa ? ` și că te apasă cel mai mult ${mic(r.apasa)}` : ""}. {p.pentruCine}
              </p>
              {frica && (
                <p className="mt-4 border-l-2 border-clay bg-clay-pale px-4 py-3 font-sans text-[0.86rem] leading-relaxed text-ink">
                  Siguranța ta vine întâi. Dacă ești în pericol, sună la <strong>112</strong>. Linia gratuită pentru victimele
                  violenței domestice este <strong>0800 500 333</strong>.
                </p>
              )}
              <p className="mt-4 font-sans text-[0.9rem] leading-relaxed text-ink">
                Mai ai 12 afirmații scurte, ca să vezi exact cum stai și unde e cel mai greu. Rezultatul e gratuit; ghidul,
                cu raportul tău personal, e {PRET_PARTE_LEI} lei.
              </p>
              {eroare && (
                <p role="alert" className="mt-4 border-l-2 border-clay bg-clay-pale px-4 py-2.5 font-sans text-[0.86rem] text-clay">
                  {eroare}
                </p>
              )}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={continua}
                  disabled={trimit}
                  className="bg-periwinkle px-7 py-4 font-sans text-[0.95rem] text-cream transition-colors hover:bg-ink disabled:opacity-60"
                >
                  {trimit ? "Se pregătește…" : "Continuă chestionarul"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setR({});
                    setPas(0);
                  }}
                  className="font-sans text-[0.86rem] text-ink-soft underline-offset-4 hover:text-ink hover:underline"
                >
                  Răspunde din nou
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
