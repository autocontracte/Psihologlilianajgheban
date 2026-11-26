"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { urmareste } from "@/lib/urmarire";
import { PARTI, PRET_PARTE_LEI } from "@/lib/ghid/parti";

/* ----------------------------------------------------------------------------
   Alegerea părții din ghid și plata, de pe pagina rezultatului gratuit.
   Partea recomandată e aleasă din start; celelalte rămân la un clic distanță.
   -------------------------------------------------------------------------- */

const stilCamp =
  "w-full rounded-none border border-ink/15 bg-cream-warm px-5 py-3.5 font-sans text-[0.95rem] text-ink placeholder:text-ink-muted transition-all duration-300 focus:border-periwinkle focus:bg-cream focus:outline-none focus:ring-4 focus:ring-periwinkle/12";

export function CumparaParte({
  token,
  recomandata,
  aChestionarului,
  platesteActiv,
  emailInitial,
}: {
  token: string;
  recomandata: number;
  aChestionarului: number | null;
  platesteActiv: boolean;
  emailInitial: string;
}) {
  const [parte, setParte] = useState(recomandata);
  const [toate, setToate] = useState(false);
  const [email, setEmail] = useState(emailInitial);
  const [eroare, setEroare] = useState("");
  const [trimit, setTrimit] = useState(false);

  const principale = [recomandata, ...(aChestionarului ? [aChestionarului] : [])];
  const vizibile = PARTI.filter((p) => toate || principale.includes(p.nr) || p.nr === parte);
  const aleasa = PARTI.find((p) => p.nr === parte)!;

  async function obtine() {
    setEroare("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setEroare("Scrie o adresă de e-mail validă: acolo primești linkul către raport și ghid.");
      return;
    }
    setTrimit(true);
    try {
      const salvat = await fetch(`/api/kit/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, parte }),
      });
      if (!salvat.ok) throw new Error("Nu am putut salva alegerea. Încearcă din nou.");
      urmareste("kit_plata", `Partea ${parte}`);

      const res = await fetch(`/api/kit/${token}/${platesteActiv ? "plata" : "gratuit"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Nu am putut finaliza.");
      if (platesteActiv) window.location.href = json.url;
      else window.location.reload();
    } catch (err) {
      setEroare(err instanceof Error ? err.message : "A apărut o eroare.");
      setTrimit(false);
    }
  }

  return (
    <div>
      <div className="grid gap-2.5" role="radiogroup" aria-label="Partea din ghid">
        {vizibile.map((p) => {
          const ales = p.nr === parte;
          return (
            <button
              key={p.nr}
              type="button"
              role="radio"
              aria-checked={ales}
              onClick={() => setParte(p.nr)}
              className={`flex w-full items-start gap-4 border px-5 py-4 text-left transition-colors ${
                ales ? "border-periwinkle bg-periwinkle-pale/60" : "border-ink/15 bg-cream-warm/80 hover:border-ink/40"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border ${
                  ales ? "border-periwinkle bg-periwinkle text-cream" : "border-ink/30"
                }`}
              >
                {ales && <Check className="h-3.5 w-3.5" aria-hidden />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-[1.1rem] text-ink">
                    Partea {p.nr}: {p.titlu}
                  </span>
                  {p.nr === recomandata && (
                    <span className="bg-sage-pale px-2 py-0.5 font-sans text-[0.72rem] text-sage">Recomandată pentru tine</span>
                  )}
                </span>
                <span className="mt-1 block font-sans text-[0.84rem] leading-relaxed text-ink-soft">{p.pentruCine}</span>
              </span>
            </button>
          );
        })}
      </div>
      {!toate && (
        <button
          type="button"
          onClick={() => setToate(true)}
          className="mt-3 inline-flex items-center gap-1.5 font-sans text-[0.84rem] text-ink-soft underline-offset-4 hover:text-ink hover:underline"
        >
          <ChevronDown className="h-4 w-4" aria-hidden />
          Vezi celelalte părți
        </button>
      )}

      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {[
          "Raportul tău personal, pe ecran și în PDF",
          "Analiza celor trei zone și ce poți face",
          "Plan concret pentru următoarele 30 de zile",
          `Partea ${aleasa.nr} din ghid (${aleasa.pagini} de pagini), în același PDF`,
        ].map((t) => (
          <li key={t} className="flex items-start gap-2.5 font-sans text-[0.88rem] text-ink">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-periwinkle" aria-hidden />
            {t}
          </li>
        ))}
      </ul>

      <div className="mt-7">
        <label htmlFor="ghid-email" className="block font-sans text-[0.83rem] text-ink-soft">
          Adresa ta de e-mail (acolo primești linkul către raport)
        </label>
        <input
          id="ghid-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nume@exemplu.ro"
          className={`${stilCamp} mt-2`}
        />
      </div>

      {!platesteActiv && (
        <p className="mt-5 border-l-2 border-sage bg-sage-pale px-5 py-3 font-sans text-[0.83rem] leading-relaxed text-ink-soft">
          În perioada de testare primești partea <span className="font-semibold text-ink">gratuit</span>. Plata de{" "}
          {PRET_PARTE_LEI} lei se activează în curând.
        </p>
      )}

      {eroare && (
        <p role="alert" className="mt-5 border-l-2 border-clay bg-clay-pale px-5 py-3 font-sans text-[0.87rem] text-clay">
          {eroare}
        </p>
      )}

      <button
        type="button"
        onClick={obtine}
        disabled={trimit}
        className="mt-5 flex w-full items-center justify-center gap-3 bg-periwinkle px-8 py-4 font-sans text-[0.97rem] text-cream transition-colors hover:bg-ink disabled:opacity-60"
      >
        {trimit
          ? platesteActiv
            ? "Se deschide plata…"
            : "Se pregătește…"
          : platesteActiv
            ? `Obține partea ${aleasa.nr} pentru ${PRET_PARTE_LEI} de lei`
            : `Primește partea ${aleasa.nr} gratuit`}
      </button>
      <p className="mt-3 text-center font-sans text-[0.76rem] leading-relaxed text-ink-muted">
        {platesteActiv ? "Plată sigură prin Stripe, acces imediat. " : "Acces imediat. "}Raportul e confidențial și rămâne doar al tău.
      </p>
    </div>
  );
}
