"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/* ----------------------------------------------------------------------------
   Pregătirea unui contract.

   Cât timp trimiterea automată de email nu e conectată, linkul se copiază de
   aici și se trimite pe WhatsApp sau pe email, manual. De asta butonul de
   copiere e cel mai vizibil lucru după creare.
   -------------------------------------------------------------------------- */

const stilCamp =
  "w-full rounded-none border border-ink/15 bg-cream-warm px-4 py-3 font-sans text-[0.88rem] text-ink placeholder:text-ink-muted focus:border-periwinkle focus:outline-none focus:ring-4 focus:ring-periwinkle/12";

export function TrimiteContract({ pretImplicit }: { pretImplicit: number }) {
  const router = useRouter();

  const [tip, setTip] = useState<"ADULT" | "MINOR">("ADULT");
  const [nume, setNume] = useState("");
  const [email, setEmail] = useState("");
  const [pret, setPret] = useState(String(pretImplicit));
  const [lucrez, setLucrez] = useState(false);
  const [eroare, setEroare] = useState("");
  const [rezultat, setRezultat] = useState<{ numar: number; link: string } | null>(null);
  const [copiat, setCopiat] = useState(false);

  const linkIntreg = rezultat
    ? `${typeof window !== "undefined" ? window.location.origin : ""}${rezultat.link}`
    : "";

  async function creeaza(e: React.FormEvent) {
    e.preventDefault();
    setEroare("");
    setLucrez(true);

    try {
      const res = await fetch("/api/admin/contracte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tip, nume, email, pret: Number(pret) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Nu am putut crea contractul.");

      setRezultat({ numar: json.numar, link: json.link });
      setNume("");
      setEmail("");
      router.refresh();
    } catch (err) {
      setEroare(err instanceof Error ? err.message : "A apărut o eroare.");
    } finally {
      setLucrez(false);
    }
  }

  async function copiaza() {
    try {
      await navigator.clipboard.writeText(linkIntreg);
      setCopiat(true);
      setTimeout(() => setCopiat(false), 2500);
    } catch {
      setEroare("Nu am putut copia. Selectează linkul manual.");
    }
  }

  if (rezultat) {
    return (
      <div className="border border-periwinkle/40 bg-periwinkle-pale/40 p-7">
        <p className="font-display text-[1.3rem] text-ink">
          Contractul nr. {rezultat.numar} e pregătit
        </p>
        <p className="mt-2 font-sans text-[0.87rem] leading-relaxed text-ink-soft">
          Trimite linkul de mai jos clientului. Îl deschide, completează datele și
          semnează. Îți apare aici imediat ce e semnat.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <input
            readOnly
            value={linkIntreg}
            onFocus={(e) => e.target.select()}
            className={`${stilCamp} flex-1 min-w-[16rem] font-mono text-[0.78rem]`}
          />
          <button
            type="button"
            onClick={copiaza}
            className="bg-periwinkle px-6 py-3 font-sans text-[0.85rem] text-cream transition-colors hover:bg-ink"
          >
            {copiat ? "Copiat" : "Copiază linkul"}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-4">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Bună! Iată contractul de completat: ${linkIntreg}`,
            )}`}
            target="_blank"
            rel="noreferrer"
            className="font-sans text-[0.85rem] text-periwinkle underline underline-offset-4 hover:text-ink"
          >
            Trimite pe WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setRezultat(null)}
            className="font-sans text-[0.85rem] text-ink-muted underline underline-offset-4 hover:text-ink"
          >
            Pregătește încă unul
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={creeaza} className="border border-ink/10 bg-cream p-7">
      <h2 className="font-display text-[1.4rem] text-ink">Trimite un contract</h2>

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
            onClick={() => setTip(v)}
            className={`px-5 py-2.5 font-sans text-[0.85rem] transition-colors ${
              tip === v
                ? "bg-ink text-cream"
                : "border border-ink/15 text-ink-soft hover:border-ink/40"
            }`}
          >
            {eticheta}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block font-sans text-[0.8rem] text-ink-soft">
            {tip === "MINOR" ? "Numele părintelui" : "Numele clientului"}
          </label>
          <input
            required
            value={nume}
            onChange={(e) => setNume(e.target.value)}
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={pret}
            onChange={(e) => setPret(e.target.value)}
            className={`${stilCamp} mt-2`}
          />
        </div>
      </div>

      {eroare && (
        <p className="mt-5 border-l-2 border-clay bg-clay-pale px-5 py-3 font-sans text-[0.85rem] text-clay">
          {eroare}
        </p>
      )}

      <button
        type="submit"
        disabled={lucrez}
        className="mt-6 bg-periwinkle px-7 py-3.5 font-sans text-[0.88rem] text-cream transition-colors hover:bg-ink disabled:opacity-60"
      >
        {lucrez ? "Se pregătește…" : "Pregătește contractul"}
      </button>
    </form>
  );
}
