"use client";

import { useState, type FormEvent } from "react";
import { butonPlin, camp, cere, eticheta } from "./comun";

export function ParolaForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setError("");
    setDone(false);
    try {
      await cere("/api/programator/parola", "POST", Object.fromEntries(new FormData(form)));
      form.reset();
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="veche" className={eticheta}>
          Parola actuală
        </label>
        <input id="veche" name="veche" type="password" required autoComplete="current-password" className={camp} />
      </div>
      <div>
        <label htmlFor="noua" className={eticheta}>
          Parola nouă
        </label>
        <input id="noua" name="noua" type="password" required minLength={8} autoComplete="new-password" className={camp} />
        <p className="mt-1.5 font-sans text-[0.8rem] text-ink-muted">Cel puțin 8 caractere, cu o literă și o cifră.</p>
      </div>
      {error && (
        <p role="alert" className="bg-clay-pale px-4 py-3 font-sans text-[0.9rem] text-clay">
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="bg-periwinkle-pale px-4 py-3 font-sans text-[0.9rem] text-ink">
          Parola a fost schimbată.
        </p>
      )}
      <button type="submit" disabled={busy} className={butonPlin}>
        {busy ? "Se salvează…" : "Schimbă parola"}
      </button>
    </form>
  );
}
