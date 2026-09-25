"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Butonul „Sincronizează acum” — altfel sincronizarea rulează la 2 minute. */
export function SincronizeazaGoogle() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [mesaj, setMesaj] = useState("");

  async function sincronizeaza() {
    setBusy(true);
    setMesaj("");
    try {
      const res = await fetch("/api/calendar/sync", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.eroare ?? json.error ?? "Sincronizarea nu a reușit.");
      setMesaj("Sincronizat.");
      router.refresh();
    } catch (err) {
      setMesaj(err instanceof Error ? err.message : "A apărut o eroare.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {mesaj && <span className="font-sans text-[0.8rem] text-ink-soft">{mesaj}</span>}
      <button
        type="button"
        onClick={sincronizeaza}
        disabled={busy}
        className="rounded-none border border-periwinkle/40 px-4 py-2 font-sans text-[0.78rem] tracking-[0.02em] text-periwinkle transition-colors hover:bg-periwinkle hover:text-cream disabled:opacity-60"
      >
        {busy ? "Se sincronizează…" : "Sincronizează acum"}
      </button>
    </div>
  );
}
