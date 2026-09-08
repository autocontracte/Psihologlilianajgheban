"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Copiază din nou linkul unui contract netrimis, sau îl anulează. */
export function AnuleazaContract({ id, token }: { id: string; token: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [lucrez, setLucrez] = useState(false);
  const [copiat, setCopiat] = useState(false);

  async function copiaza() {
    await navigator.clipboard.writeText(
      `${window.location.origin}/contract/${token}`,
    );
    setCopiat(true);
    setTimeout(() => setCopiat(false), 2500);
  }

  async function anuleaza() {
    setLucrez(true);
    await fetch("/api/admin/contracte", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={copiaza}
        className="border border-ink/20 px-5 py-2.5 font-sans text-[0.82rem] text-ink transition-colors hover:border-ink/50"
      >
        {copiat ? "Copiat" : "Copiază linkul"}
      </button>

      {confirm ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={anuleaza}
            disabled={lucrez}
            className="font-sans text-[0.8rem] text-clay underline underline-offset-4 disabled:opacity-60"
          >
            {lucrez ? "Se anulează…" : "Da, anulează"}
          </button>
          <button
            type="button"
            onClick={() => setConfirm(false)}
            className="font-sans text-[0.8rem] text-ink-muted underline underline-offset-4"
          >
            Nu
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="font-sans text-[0.8rem] text-ink-muted underline underline-offset-4 hover:text-clay"
        >
          Anulează
        </button>
      )}
    </div>
  );
}
