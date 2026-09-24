"use client";

import { useState } from "react";

/**
 * Cumpărarea ghidului, direct din rezultatul evaluării gratuite.
 * Evaluarea devine comandă de ghid, apoi continuă fluxul obișnuit: plata
 * online sau, cât ea nu e activă, finalizarea de test.
 */
export function CumparaGhidul({
  token,
  emailSalvat,
  pretLei,
  platesteActiv,
}: {
  token: string;
  emailSalvat: string | null;
  pretLei: number;
  platesteActiv: boolean;
}) {
  const [email, setEmail] = useState(emailSalvat ?? "");
  const [trimit, setTrimit] = useState(false);
  const [eroare, setEroare] = useState("");

  async function cumpara() {
    setEroare("");
    setTrimit(true);
    try {
      const r1 = await fetch(`/api/evaluare/${token}/ghid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j1 = await r1.json().catch(() => ({}));
      if (!r1.ok) throw new Error(j1.error ?? "Nu am putut porni comanda.");
      if (j1.platit) {
        window.location.href = `/consiliere/rezultat/${token}`;
        return;
      }

      if (platesteActiv) {
        const r2 = await fetch(`/api/consiliere/${token}/plata`, { method: "POST" });
        const j2 = await r2.json().catch(() => ({}));
        if (!r2.ok) throw new Error(j2.error ?? "Plata nu a putut fi pornită.");
        window.location.href = j2.url;
      } else {
        const r2 = await fetch(`/api/consiliere/${token}/gratuit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const j2 = await r2.json().catch(() => ({}));
        if (!r2.ok) throw new Error(j2.error ?? "Nu am putut finaliza.");
        window.location.href = `/consiliere/rezultat/${token}`;
      }
    } catch (e) {
      setEroare(e instanceof Error ? e.message : "A apărut o eroare.");
      setTrimit(false);
    }
  }

  return (
    <div className="mt-6">
      {!emailSalvat && (
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Adresa ta de e-mail"
          aria-label="Adresa de e-mail, pentru ghid"
          className="w-full border border-ink/15 bg-white/70 px-4 py-3 font-sans text-[0.92rem] text-ink placeholder:text-ink-muted focus:border-periwinkle focus:outline-none sm:max-w-sm"
        />
      )}
      <button
        type="button"
        onClick={cumpara}
        disabled={trimit}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 bg-periwinkle px-7 py-4 font-sans text-[0.93rem] text-cream transition-colors hover:bg-ink disabled:opacity-60 sm:w-auto"
      >
        {trimit
          ? "Se pregătește…"
          : platesteActiv
            ? `Cumpără ghidul, ${pretLei} lei`
            : "Primește ghidul (gratuit în perioada de testare)"}
      </button>
      {eroare && <p className="mt-3 bg-clay-pale px-4 py-2.5 font-sans text-[0.84rem] text-clay">{eroare}</p>}
    </div>
  );
}
