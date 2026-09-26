"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Generează sau regenerează interpretarea AI a unei comenzi (din admin).
 * Generarea durează cam un minut și rulează în fundal; butonul urmărește
 * starea și reîncarcă lista când e gata.
 */
export function InterpretareButton({ id, token, are }: { id: string; token: string; are: boolean }) {
  const router = useRouter();
  const [lucrez, setLucrez] = useState(false);
  const [eroare, setEroare] = useState("");

  async function genereaza() {
    setLucrez(true);
    setEroare("");
    try {
      const res = await fetch(`/api/admin/kit/${id}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Nu a mers.");

      // Urmărim starea; comenzile neplătite nu au rută publică de stare, așa că doar așteptăm.
      const inceput = Date.now();
      while (Date.now() - inceput < 180_000) {
        await new Promise((r) => setTimeout(r, 4000));
        const s = await fetch(`/api/kit/${token}/interpretare`, { cache: "no-store" })
          .then((x) => (x.ok ? x.json() : null))
          .catch(() => null);
        if (!s) {
          if (Date.now() - inceput > 90_000) break;
          continue;
        }
        if (s.stare !== "in_lucru") break;
      }
      router.refresh();
    } catch (err) {
      setEroare(err instanceof Error ? err.message : "Eroare.");
    } finally {
      setLucrez(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={genereaza}
        disabled={lucrez}
        className="border border-ink/20 px-4 py-2 font-sans text-[0.8rem] text-ink transition-colors hover:border-periwinkle hover:text-periwinkle disabled:opacity-60"
      >
        {lucrez ? "Se generează (~1 minut)…" : are ? "Regenerează interpretarea" : "Generează interpretarea"}
      </button>
      {eroare && <span className="font-sans text-[0.75rem] text-clay">{eroare}</span>}
    </div>
  );
}
