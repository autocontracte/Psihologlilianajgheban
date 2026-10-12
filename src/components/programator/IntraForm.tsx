"use client";

import { useState, type FormEvent } from "react";
import { butonPlin, camp, cere, eticheta } from "./comun";

export function IntraForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await cere("/api/programator/login", "POST", Object.fromEntries(new FormData(e.currentTarget)));
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="utilizator" className={eticheta}>
          Utilizator
        </label>
        <input
          id="utilizator"
          name="utilizator"
          required
          autoFocus
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="username"
          className={camp}
        />
      </div>
      <div>
        <label htmlFor="parola" className={eticheta}>
          Parolă
        </label>
        <input id="parola" name="parola" type="password" required autoComplete="current-password" className={camp} />
      </div>
      {error && (
        <p role="alert" className="bg-clay-pale px-4 py-3 font-sans text-[0.9rem] text-clay">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className={`${butonPlin} w-full`}>
        {busy ? "Se verifică…" : "Intră"}
      </button>
    </form>
  );
}
