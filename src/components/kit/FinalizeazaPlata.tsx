"use client";

import { useState } from "react";

/** Reia plata unei comenzi începute (de exemplu, după ce omul a închis pagina Stripe). */
export function FinalizeazaPlata({ token, pretLei }: { token: string; pretLei: number }) {
  const [trimit, setTrimit] = useState(false);
  const [eroare, setEroare] = useState("");

  async function plateste() {
    setTrimit(true);
    setEroare("");
    try {
      const res = await fetch(`/api/kit/${token}/plata`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Plata nu a putut fi pornită.");
      window.location.href = json.url;
    } catch (err) {
      setEroare(err instanceof Error ? err.message : "A apărut o eroare.");
      setTrimit(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={plateste}
        disabled={trimit}
        className="inline-flex items-center justify-center bg-periwinkle px-8 py-4 font-sans text-[0.93rem] text-cream transition-colors hover:bg-ink disabled:opacity-60"
      >
        {trimit ? "Se deschide plata…" : `Finalizează plata · ${pretLei} lei`}
      </button>
      {eroare && <p className="mt-3 font-sans text-[0.84rem] text-clay">{eroare}</p>}
    </div>
  );
}
