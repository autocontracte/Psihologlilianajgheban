"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditeazaContract } from "./EditeazaContract";

/* Acțiunile pentru un contract încă nesemnat: copiază linkul, editează datele,
   anulează. Le ținem împreună ca să formeze un grup coerent în card. */
type Props = {
  id: string;
  token: string;
  tip: "ADULT" | "MINOR";
  nume: string;
  email: string;
  pretLei: number;
};

export function AnuleazaContract({ id, token, tip, nume, email, pretLei }: Props) {
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
      body: JSON.stringify({ id, anuleaza: true }),
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
        <div className="flex items-center gap-3">
          <EditeazaContract
            id={id}
            tip={tip}
            nume={nume}
            email={email}
            pretLei={pretLei}
          />
          <span className="text-ink/20">·</span>
          <button
            type="button"
            onClick={() => setConfirm(true)}
            className="font-sans text-[0.8rem] text-ink-muted underline underline-offset-4 hover:text-clay"
          >
            Anulează
          </button>
        </div>
      )}
    </div>
  );
}
