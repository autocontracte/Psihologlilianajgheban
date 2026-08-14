"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authInput, authLabel } from "./AuthShell";
import { IconArrow } from "../ui/Icons";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Autentificarea a eșuat.");

      // Doar căi interne, ca să nu poată fi folosit pentru redirect în afară
      const safe =
        redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
          ? redirectTo
          : json.role === "ADMIN"
            ? "/admin"
            : "/cont";

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
        <label htmlFor="email" className={authLabel}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="adresa@email.ro"
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
          autoComplete="current-password"
          placeholder="••••••••"
          className={authInput}
        />
      </div>

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
        {busy ? "Se verifică…" : "Intră în cont"}
        {!busy && (
          <IconArrow className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
        )}
      </button>
    </form>
  );
}
