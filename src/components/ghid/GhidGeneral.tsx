"use client";

import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { urmareste } from "@/lib/urmarire";
import { COPII, SITUATII, chestionar, chestionarRecomandat } from "@/lib/ghid/chestionare";
import { PRET_PARTE_LEI, parte as gasesteParte } from "@/lib/ghid/parti";
import { Carte3D } from "./Carte3D";

/* ----------------------------------------------------------------------------
   Chestionarul general de pe /kit: două întrebări despre situație arată ce
   parte a ghidului ți se potrivește. „Continuă” pornește direct chestionarul
   acelei părți, cu răspunsurile de aici deja completate (nu le mai dai încă o
   dată): se creează comanda, se salvează răspunsurile și progresul, iar pagina
   părții reia de la următoarea întrebare.
   -------------------------------------------------------------------------- */

export function GhidGeneral() {
  const [pas, setPas] = useState(0);
  const [situatia, setSituatia] = useState("");
  const [copii, setCopii] = useState("");
  const [trimit, setTrimit] = useState(false);
  const [eroare, setEroare] = useState("");

  const c = situatia && copii ? chestionar(chestionarRecomandat({ situatia, copii })) : null;
  const p = gasesteParte(c?.parte);

  function alege(camp: "situatia" | "copii", v: string) {
    if (camp === "situatia") {
      setSituatia(v);
      if (pas === 0) urmareste("kit_start", "chestionarul general");
    } else setCopii(v);
    setTimeout(() => setPas((x) => x + 1), 200);
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
      const raspunsuri = { situatia, copii };
      await fetch(`/api/kit/${json.token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: raspunsuri }),
      });
      try {
        localStorage.setItem(`ghid_progres_${c.id}`, JSON.stringify({ token: json.token, raspunsuri, pas: 2 }));
      } catch {}
      urmareste("kit_start", `general → Partea ${p.nr}`);
      window.location.href = `/kit/${c.slug}?continua=1#chestionar`;
    } catch (err) {
      setEroare(err instanceof Error ? err.message : "A apărut o eroare.");
      setTrimit(false);
    }
  }

  const Optiune = ({ text, ales, onClick }: { text: string; ales: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ales}
      className={`flex w-full items-center justify-between gap-4 border px-5 py-4 text-left font-sans text-[0.95rem] transition-colors ${
        ales ? "border-periwinkle bg-periwinkle text-cream" : "border-ink/15 bg-cream-warm/80 text-ink hover:border-periwinkle"
      }`}
    >
      {text}
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center border ${ales ? "border-cream bg-cream text-periwinkle" : "border-ink/25"}`}
      >
        {ales && <Check className="h-3.5 w-3.5" aria-hidden />}
      </span>
    </button>
  );

  return (
    <div className="glass-strong overflow-hidden">
      {/* progres */}
      <div className="flex">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1 flex-1 transition-colors duration-500 ${i <= pas ? "bg-periwinkle" : "bg-cream-deep"}`} />
        ))}
      </div>

      <div className="p-6 sm:p-10">
        {pas > 0 && (
          <button
            type="button"
            onClick={() => setPas((x) => x - 1)}
            className="mb-5 inline-flex items-center gap-1.5 font-sans text-[0.84rem] text-ink-muted hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Înapoi
          </button>
        )}

        {pas === 0 && (
          <div>
            <p className="font-sans text-[0.8rem] tracking-[0.04em] text-periwinkle">ÎNTREBAREA 1 DIN 2</p>
            <h3 className="mt-2 font-display text-[1.6rem] leading-snug text-ink sm:text-[1.9rem]">Unde te afli acum în relație?</h3>
            <div className="mt-6 grid gap-2.5">
              {SITUATII.map((o) => (
                <Optiune key={o} text={o} ales={situatia === o} onClick={() => alege("situatia", o)} />
              ))}
            </div>
          </div>
        )}

        {pas === 1 && (
          <div>
            <p className="font-sans text-[0.8rem] tracking-[0.04em] text-periwinkle">ÎNTREBAREA 2 DIN 2</p>
            <h3 className="mt-2 font-display text-[1.6rem] leading-snug text-ink sm:text-[1.9rem]">Aveți copii împreună?</h3>
            <p className="mt-2 font-sans text-[0.88rem] text-ink-soft">
              Dacă ai o familie nouă, gândește-te la copiii din relația ta anterioară.
            </p>
            <div className="mt-6 grid gap-2.5">
              {COPII.map((o) => (
                <Optiune key={o} text={o} ales={copii === o} onClick={() => alege("copii", o)} />
              ))}
            </div>
          </div>
        )}

        {pas === 2 && p && c && (
          <div className="grid items-center gap-8 sm:grid-cols-[11rem_1fr]">
            <Carte3D parte={p} rotatieY={-24} rotatieX={5} grosime={16} className="mx-auto w-[9rem] sm:w-[11rem]" />
            <div>
              <p className="font-sans text-[0.8rem] tracking-[0.04em] text-sage">PARTEA CARE ȚI SE POTRIVEȘTE</p>
              <h3 className="mt-2 font-display text-[1.7rem] leading-snug text-ink sm:text-[2rem]">
                Partea {p.nr}: {p.titlu}
              </h3>
              <p className="mt-3 font-sans text-[0.93rem] leading-relaxed text-ink-soft">{p.pentruCine}</p>
              <p className="mt-4 font-sans text-[0.9rem] leading-relaxed text-ink">
                Mai ai 12 afirmații scurte, ca să vezi exact cum stai și unde e cel mai greu. Rezultatul e gratuit; partea
                din ghid, cu raportul tău personal, e {PRET_PARTE_LEI} lei.
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
                <a href="#parti" className="font-sans text-[0.86rem] text-ink-soft underline-offset-4 hover:text-ink hover:underline">
                  sau alege altă parte
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

