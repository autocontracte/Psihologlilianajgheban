"use client";

import { useSyncExternalStore } from "react";

/* ----------------------------------------------------------------------------
   Conversația cu Ana, comună pentru toate locurile în care apare (bara din
   hero și butonul plutitor). Oriunde ai început, continui din același punct.

   Stă doar în browser (sessionStorage), cât ține fila deschisă.
   -------------------------------------------------------------------------- */

export type Replica = { role: "user" | "assistant"; content: string };

export const ANA_MAX = 15;
const CHEIE = "lj-ana";

export const SALUT: Replica = {
  role: "assistant",
  content:
    "Bună, sunt Ana, asistenta virtuală a cabinetului. Te pot lămuri despre ședințe, prețuri, varianta online sau despre cum decurge prima întâlnire. Ce ai vrea să afli?",
};

export const SUGESTII = [
  "Cât costă o ședință?",
  "Cum decurge prima întâlnire?",
  "Se poate și online?",
  "Lucrați și cu copii?",
];

type Stare = {
  turns: Replica[];
  busy: boolean;
  /** Răspunsul curge chiar acum (pentru gura care se mișcă). */
  scrie: boolean;
  error: string | null;
};

const INITIAL: Stare = { turns: [SALUT], busy: false, scrie: false, error: null };
let stare: Stare = INITIAL;
let incarcat = false;
const ascultatori = new Set<() => void>();

function seteaza(p: Partial<Stare>) {
  stare = { ...stare, ...p };
  if (p.turns) {
    try {
      sessionStorage.setItem(CHEIE, JSON.stringify(stare.turns));
    } catch {}
  }
  ascultatori.forEach((f) => f());
}

function aboneaza(f: () => void) {
  ascultatori.add(f);
  if (!incarcat) {
    incarcat = true;
    try {
      const salvat = JSON.parse(sessionStorage.getItem(CHEIE) ?? "null");
      if (Array.isArray(salvat) && salvat.length) seteaza({ turns: salvat });
    } catch {}
  }
  return () => {
    ascultatori.delete(f);
  };
}

/**
 * Trimite o întrebare. Întoarce `false` dacă n-a mers — atunci întrebarea e
 * scoasă din conversație, ca omul să o poată trimite din nou.
 */
async function trimite(text: string): Promise<boolean> {
  const q = text.trim();
  const intrebari = stare.turns.filter((t) => t.role === "user").length;
  if (!q || stare.busy || intrebari >= ANA_MAX) return false;

  const urmator: Replica[] = [...stare.turns, { role: "user", content: q }];
  seteaza({ turns: [...urmator, { role: "assistant", content: "" }], busy: true, error: null });

  let raspuns = "";
  try {
    const res = await fetch("/api/ana", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: urmator.filter((t) => t !== SALUT && t.content !== SALUT.content) }),
    });

    if (!res.ok || !res.body) {
      const j = await res.json().catch(() => ({}));
      throw new Error(
        j.limita
          ? "Am ajuns la capătul întrebărilor pentru conversația asta."
          : (j.error ?? "Ana nu a putut răspunde acum."),
      );
    }

    const cititor = res.body.getReader();
    const dec = new TextDecoder();
    seteaza({ scrie: true });
    for (;;) {
      const { done, value } = await cititor.read();
      if (done) break;
      raspuns += dec.decode(value, { stream: true });
      const acum = raspuns;
      seteaza({
        turns: stare.turns.map((m, i) => (i === stare.turns.length - 1 ? { ...m, content: acum } : m)),
      });
    }
    if (!raspuns.trim()) throw new Error("Ana nu a putut răspunde acum.");
    return true;
  } catch (e) {
    if (!raspuns.trim()) seteaza({ turns: stare.turns.slice(0, -2) });
    seteaza({ error: e instanceof Error ? e.message : "Ana nu a putut răspunde acum." });
    return !!raspuns.trim();
  } finally {
    seteaza({ busy: false });
    // gura se mai mișcă puțin după ultimul cuvânt, ca la un om
    setTimeout(() => seteaza({ scrie: false }), 700);
  }
}

export function useAna() {
  const s = useSyncExternalStore(aboneaza, () => stare, () => INITIAL);
  const intrebari = s.turns.filter((t) => t.role === "user").length;
  const ramase = Math.max(0, ANA_MAX - intrebari);
  return {
    ...s,
    intrebari,
    ramase,
    /** S-au terminat întrebările: rămân doar programarea și telefonul. */
    gata: ramase === 0 && !s.busy,
    trimite,
  };
}
