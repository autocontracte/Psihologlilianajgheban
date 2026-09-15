"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/* ----------------------------------------------------------------------------
   Corectarea unui contract deja pregătit, cât timp nu e semnat.

   Se întâmplă des: ai trimis linkul și vezi apoi că ai greșit e-mailul sau
   prețul. În loc să anulezi și să iei un număr nou, corectezi pe loc —
   contractul își păstrează numărul și linkul.
   -------------------------------------------------------------------------- */

const stilCamp =
  "w-full rounded-none border border-ink/15 bg-cream-warm px-4 py-3 font-sans text-[0.88rem] text-ink placeholder:text-ink-muted focus:border-periwinkle focus:outline-none focus:ring-4 focus:ring-periwinkle/12";

type Props = {
  id: string;
  tip: "ADULT" | "MINOR";
  nume: string;
  email: string;
  pretLei: number;
};

export function EditeazaContract({ id, tip, nume, email, pretLei }: Props) {
  const router = useRouter();
  const [deschis, setDeschis] = useState(false);

  const [tipNou, setTipNou] = useState(tip);
  const [numeNou, setNumeNou] = useState(nume);
  const [emailNou, setEmailNou] = useState(email);
  const [pretNou, setPretNou] = useState(String(pretLei));
  const [lucrez, setLucrez] = useState(false);
  const [eroare, setEroare] = useState("");

  function redeschide() {
    // Repornește de la valorile curente ori de câte ori deschizi panoul.
    setTipNou(tip);
    setNumeNou(nume);
    setEmailNou(email);
    setPretNou(String(pretLei));
    setEroare("");
    setDeschis(true);
  }

  async function salveaza(e: React.FormEvent) {
    e.preventDefault();
    setEroare("");
    setLucrez(true);
    try {
      const res = await fetch("/api/admin/contracte", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          tip: tipNou,
          nume: numeNou,
          email: emailNou,
          pret: Number(pretNou),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Nu am putut salva.");
      setDeschis(false);
      router.refresh();
    } catch (err) {
      setEroare(err instanceof Error ? err.message : "A apărut o eroare.");
    } finally {
      setLucrez(false);
    }
  }

  if (!deschis) {
    return (
      <button
        type="button"
        onClick={redeschide}
        className="font-sans text-[0.8rem] text-ink-muted underline underline-offset-4 hover:text-ink"
      >
        Editează
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4"
      onClick={() => setDeschis(false)}
      role="dialog"
      aria-modal="true"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={salveaza}
        className="w-full max-w-lg bg-cream p-7"
      >
        <h2 className="font-display text-[1.4rem] text-ink">Editează contractul</h2>

        <div className="mt-5 flex gap-2">
          {(
            [
              ["ADULT", "Adult"],
              ["MINOR", "Minor"],
            ] as const
          ).map(([v, eticheta]) => (
            <button
              key={v}
              type="button"
              onClick={() => setTipNou(v)}
              className={`px-5 py-2.5 font-sans text-[0.85rem] transition-colors ${
                tipNou === v
                  ? "bg-ink text-cream"
                  : "border border-ink/15 text-ink-soft hover:border-ink/40"
              }`}
            >
              {eticheta}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block font-sans text-[0.8rem] text-ink-soft">
              {tipNou === "MINOR" ? "Numele părintelui" : "Numele clientului"}
            </label>
            <input
              required
              value={numeNou}
              onChange={(e) => setNumeNou(e.target.value)}
              className={`${stilCamp} mt-2`}
            />
          </div>
          <div>
            <label className="block font-sans text-[0.8rem] text-ink-soft">
              Adresa de e-mail
            </label>
            <input
              required
              type="email"
              value={emailNou}
              onChange={(e) => setEmailNou(e.target.value)}
              className={`${stilCamp} mt-2`}
            />
          </div>
          <div>
            <label className="block font-sans text-[0.8rem] text-ink-soft">
              Prețul pe ședință (lei)
            </label>
            <input
              required
              type="number"
              min={1}
              value={pretNou}
              onChange={(e) => setPretNou(e.target.value)}
              className={`${stilCamp} mt-2`}
            />
          </div>
        </div>

        {eroare && (
          <p className="mt-5 border-l-2 border-clay bg-clay-pale px-5 py-3 font-sans text-[0.85rem] text-clay">
            {eroare}
          </p>
        )}

        <div className="mt-6 flex items-center gap-4">
          <button
            type="submit"
            disabled={lucrez}
            className="bg-periwinkle px-7 py-3 font-sans text-[0.88rem] text-cream transition-colors hover:bg-ink disabled:opacity-60"
          >
            {lucrez ? "Se salvează…" : "Salvează"}
          </button>
          <button
            type="button"
            onClick={() => setDeschis(false)}
            className="font-sans text-[0.85rem] text-ink-muted underline underline-offset-4 hover:text-ink"
          >
            Renunță
          </button>
        </div>
      </form>
    </div>
  );
}
