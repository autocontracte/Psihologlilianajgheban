"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Generează sau regenerează interpretarea AI pentru o comandă (din admin). */
export function InterpretareButton({ id, are }: { id: string; are: boolean }) {
  const router = useRouter();
  const [lucrez, setLucrez] = useState(false);
  const [eroare, setEroare] = useState("");

  async function genereaza() {
    setLucrez(true);
    setEroare("");
    try {
      const res = await fetch(`/api/admin/consiliere/${id}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Nu a mers.");
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
        {lucrez ? "Se generează…" : are ? "Regenerează" : "Generează interpretarea"}
      </button>
      {eroare && <span className="font-sans text-[0.75rem] text-clay">{eroare}</span>}
    </div>
  );
}
