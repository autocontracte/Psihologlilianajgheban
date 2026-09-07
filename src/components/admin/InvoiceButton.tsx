"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Emite factura pentru o plată încasată, sau reîncearcă după o eroare. */
export function InvoiceButton({
  paymentId,
  disabled,
}: {
  paymentId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function emite() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/facturi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Emiterea nu a reușit.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="shrink-0 text-right">
      <button
        type="button"
        onClick={emite}
        disabled={busy || disabled}
        title={
          disabled
            ? "Configurează întâi programul de facturare din .env"
            : undefined
        }
        className="border border-periwinkle px-5 py-2.5 font-sans text-[0.85rem] text-periwinkle transition-colors hover:bg-periwinkle hover:text-cream disabled:cursor-not-allowed disabled:border-ink/20 disabled:text-ink-muted disabled:hover:bg-transparent disabled:hover:text-ink-muted"
      >
        {busy ? "Se emite…" : "Emite factura"}
      </button>

      {error && (
        <p className="mt-2 max-w-[16rem] font-sans text-[0.78rem] text-clay">
          {error}
        </p>
      )}
    </div>
  );
}
