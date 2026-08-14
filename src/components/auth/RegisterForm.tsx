"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authInput, authLabel } from "./AuthShell";
import { IconArrow } from "../ui/Icons";

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");

  const strength = [
    password.length >= 8,
    /[a-zA-Z]/.test(password),
    /[0-9]/.test(password),
  ].filter(Boolean).length;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Contul nu a putut fi creat.");

      const safe =
        redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
          ? redirectTo
          : "/programari";

      router.push(safe);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className={authLabel}>
          Nume și prenume
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={100}
          autoComplete="name"
          placeholder="Numele tău"
          className={authInput}
        />
      </div>

      <div>
        <label htmlFor="email" className={authLabel}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={150}
          autoComplete="email"
          placeholder="adresa@email.ro"
          className={authInput}
        />
      </div>

      <div>
        <label htmlFor="phone" className={authLabel}>
          Telefon
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          maxLength={30}
          autoComplete="tel"
          placeholder="07XX XXX XXX"
          className={authInput}
        />
      </div>

      <div>
        <label htmlFor="password" className={authLabel}>
          Parolă
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Cel puțin 8 caractere"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={authInput}
        />

        {/* Indicator de putere a parolei */}
        <div className="mt-2.5 flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={[
                "h-1 flex-1 rounded-pill transition-colors duration-400",
                i < strength
                  ? strength === 3
                    ? "bg-sage"
                    : "bg-clay"
                  : "bg-ink/12",
              ].join(" ")}
            />
          ))}
        </div>
        <p className="mt-2 font-sans text-[0.72rem] text-ink-muted">
          Minimum 8 caractere, cu cel puțin o literă și o cifră.
        </p>
      </div>

      <label className="flex items-start gap-3 pt-1">
        <input
          type="checkbox"
          required
          className="mt-1 h-4 w-4 shrink-0 rounded border-ink/25 accent-periwinkle"
        />
        <span className="font-sans text-[0.78rem] leading-relaxed text-ink-muted">
          Sunt de acord cu prelucrarea datelor pentru gestionarea programărilor.
        </span>
      </label>

      {error && (
        <p className="rounded-[1rem] bg-clay-pale px-4 py-3 font-sans text-[0.82rem] text-clay">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="group inline-flex w-full items-center justify-center gap-2.5 rounded-pill bg-periwinkle px-8 py-4 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-cream transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Se creează contul…" : "Creează cont"}
        {!busy && (
          <IconArrow className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
        )}
      </button>
    </form>
  );
}
