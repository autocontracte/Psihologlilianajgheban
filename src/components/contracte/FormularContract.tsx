"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PadSemnatura } from "./PadSemnatura";
import {
  SABLOANE,
  type TipContract,
  type CampContract,
} from "@/lib/contracts/sabloane";
import { verificaDatele, semnaturiNecesare } from "@/lib/contracts/validare";

type Props = {
  token: string;
  tip: TipContract;
  numar: number;
  pretLei: number;
  numeDestinatar: string;
  emailDestinatar: string;
};

const stilCamp =
  "w-full rounded-none border border-ink/15 bg-cream-warm px-5 py-3.5 font-sans text-[0.9rem] text-ink placeholder:text-ink-muted transition-all duration-300 focus:border-periwinkle focus:bg-cream focus:outline-none focus:ring-4 focus:ring-periwinkle/12";

const tipHtml: Record<string, string> = {
  email: "email",
  tel: "tel",
  cnp: "text",
  varsta: "number",
  text: "text",
};

export function FormularContract({
  token,
  tip,
  numar,
  pretLei,
  numeDestinatar,
  emailDestinatar,
}: Props) {
  const sablon = SABLOANE[tip];

  const [date, setDate] = useState<Record<string, string>>({
    b1_nume: numeDestinatar,
    b1_email: emailDestinatar,
  });
  const [semnaturi, setSemnaturi] = useState<(string | null)[]>([null, null]);
  const [citit, setCitit] = useState(false);
  const [probleme, setProbleme] = useState<Record<string, string>>({});
  const [eroare, setEroare] = useState("");
  const [trimit, setTrimit] = useState(false);
  const [gata, setGata] = useState(false);

  const necesare = semnaturiNecesare(tip, date);

  function seteaza(nume: string, valoare: string) {
    setDate((d) => ({ ...d, [nume]: valoare }));
    setProbleme((p) => {
      if (!p[nume]) return p;
      const copie = { ...p };
      delete copie[nume];
      return copie;
    });
  }

  async function trimite(e: React.FormEvent) {
    e.preventDefault();
    setEroare("");

    const gasite = verificaDatele(tip, date);

    if (!citit) gasite.citit = "Confirmă că ai citit contractul.";
    for (let i = 0; i < necesare; i++) {
      if (!semnaturi[i]) gasite[`semnatura${i}`] = "Lipsește semnătura.";
    }

    setProbleme(gasite);

    if (Object.keys(gasite).length > 0) {
      const primul = document.querySelector("[data-problema]");
      primul?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setTrimit(true);
    try {
      const res = await fetch(`/api/contracte/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, semnaturi: semnaturi.slice(0, necesare) }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Nu am putut trimite contractul.");
      }
      setGata(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setEroare(err instanceof Error ? err.message : "A apărut o eroare.");
      setTrimit(false);
    }
  }

  if (gata) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border border-ink/10 bg-cream p-10 text-center sm:p-14"
      >
        <h2 className="font-display text-3xl text-ink">Contractul e semnat</h2>
        <p className="mx-auto mt-4 max-w-md font-sans text-[0.95rem] leading-relaxed text-ink-soft">
          O copie a ajuns și la Liliana. Descarcă-l și păstrează-l — îl poți lua
          oricând de pe acest link.
        </p>

        <a
          href={`/api/contracte/${token}/pdf`}
          className="mt-8 inline-flex items-center justify-center gap-2 bg-periwinkle px-8 py-4 font-sans text-[0.9rem] text-cream transition-colors hover:bg-ink"
        >
          <span className="mi" style={{ fontSize: "1.2rem" }} aria-hidden="true">
            download
          </span>
          Descarcă contractul semnat
        </a>
      </motion.div>
    );
  }

  return (
    <form onSubmit={trimite} className="space-y-8">
      {sablon.grupuri.map((grup) => (
        <section
          key={grup.titlu}
          className="border border-ink/10 bg-cream p-7 sm:p-9"
        >
          <h2 className="font-display text-[1.45rem] text-ink">{grup.titlu}</h2>
          {grup.descriere && (
            <p className="mt-2 font-sans text-[0.87rem] leading-relaxed text-ink-soft">
              {grup.descriere}
            </p>
          )}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {grup.campuri.map((c) => (
              <Camp
                key={c.nume}
                camp={c}
                valoare={date[c.nume] ?? ""}
                problema={probleme[c.nume]}
                onChange={(v) => seteaza(c.nume, v)}
              />
            ))}
          </div>
        </section>
      ))}

      <section className="border border-ink/10 bg-cream p-7 sm:p-9">
        <h2 className="font-display text-[1.45rem] text-ink">Semnătura</h2>
        <p className="mt-2 font-sans text-[0.87rem] leading-relaxed text-ink-soft">
          {necesare === 2
            ? "Ai completat datele ambilor părinți, așa că sunt nevoie de două semnături."
            : "Semnează în chenarul de mai jos."}
        </p>

        <div className="mt-6 space-y-8">
          {sablon.semnaturi.slice(0, necesare).map((s, i) => (
            <div
              key={s.eticheta}
              data-problema={probleme[`semnatura${i}`] ? "da" : undefined}
            >
              <PadSemnatura
                eticheta={s.eticheta}
                valoare={semnaturi[i]}
                problema={probleme[`semnatura${i}`]}
                onChange={(png) =>
                  setSemnaturi((v) => {
                    const nou = [...v];
                    nou[i] = png;
                    return nou;
                  })
                }
              />
            </div>
          ))}
        </div>

        <label
          data-problema={probleme.citit ? "da" : undefined}
          className="mt-8 flex cursor-pointer items-start gap-3.5"
        >
          <input
            type="checkbox"
            checked={citit}
            onChange={(e) => {
              setCitit(e.target.checked);
              setProbleme((p) => {
                const copie = { ...p };
                delete copie.citit;
                return copie;
              });
            }}
            className="mt-1 h-4 w-4 shrink-0 accent-periwinkle"
          />
          <span className="font-sans text-[0.87rem] leading-relaxed text-ink-soft">
            Am citit contractul nr. {numar} și declar pe propria răspundere că am
            luat la cunoștință scopurile, durata, procedurile, riscurile,
            beneficiile și limitele confidențialității, precum și dreptul de a mă
            retrage oricând.
          </span>
        </label>
        {probleme.citit && (
          <p className="mt-2 font-sans text-[0.8rem] text-clay">
            {probleme.citit}
          </p>
        )}

        {eroare && (
          <p className="mt-6 border-l-2 border-clay bg-clay-pale px-5 py-3.5 font-sans text-[0.87rem] text-clay">
            {eroare}
          </p>
        )}

        <button
          type="submit"
          disabled={trimit}
          className="mt-8 w-full bg-periwinkle px-8 py-4 font-sans text-[0.92rem] text-cream transition-colors hover:bg-ink disabled:opacity-60 sm:w-auto"
        >
          {trimit ? "Se semnează…" : "Semnează contractul"}
        </button>

        <p className="mt-4 font-sans text-[0.8rem] leading-relaxed text-ink-muted">
          Prețul din contract este de {pretLei} lei pe ședință. Datele sunt
          folosite doar pentru acest contract.
        </p>
      </section>
    </form>
  );
}

function Camp({
  camp: c,
  valoare,
  problema,
  onChange,
}: {
  camp: CampContract;
  valoare: string;
  problema?: string;
  onChange: (v: string) => void;
}) {
  const lung = c.tip === "lung";

  return (
    <div
      className={lung ? "sm:col-span-2" : undefined}
      data-problema={problema ? "da" : undefined}
    >
      <label className="block font-sans text-[0.83rem] text-ink-soft">
        {c.eticheta}
        {!c.obligatoriu && <span className="ml-2 text-ink-muted">(opțional)</span>}
      </label>

      {lung ? (
        <textarea
          rows={3}
          value={valoare}
          onChange={(e) => onChange(e.target.value)}
          className={`${stilCamp} mt-2.5 ${problema ? "border-clay" : ""}`}
        />
      ) : (
        <input
          type={tipHtml[c.tip] ?? "text"}
          inputMode={c.tip === "cnp" ? "numeric" : undefined}
          value={valoare}
          onChange={(e) => onChange(e.target.value)}
          className={`${stilCamp} mt-2.5 ${problema ? "border-clay" : ""}`}
        />
      )}

      {problema && (
        <p className="mt-2 font-sans text-[0.8rem] text-clay">{problema}</p>
      )}
    </div>
  );
}
