import { campuriClient, type TipContract, type CampContract } from "./sabloane";

/* ----------------------------------------------------------------------------
   Verificarea datelor completate de client.

   Rulează și în browser (ca să vadă omul greșeala imediat) și pe server (ca să
   nu se poată ocoli). Serverul e cel care decide — verificarea din browser e
   doar o curtoazie.
   -------------------------------------------------------------------------- */

/** Cifra de control a CNP-ului, după algoritmul oficial. */
export function cnpValid(cnp: string): boolean {
  const c = cnp.replace(/\s/g, "");
  if (!/^\d{13}$/.test(c)) return false;

  const PONDERI = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
  const suma = PONDERI.reduce((s, p, i) => s + p * Number(c[i]), 0);
  const rest = suma % 11;
  const control = rest === 10 ? 1 : rest;

  return control === Number(c[12]);
}

/** Verificare permisivă: acceptă formatele uzuale, inclusiv cu prefix de țară. */
export function telefonValid(tel: string): boolean {
  const t = tel.replace(/[\s.()-]/g, "");
  return /^(\+?4)?0\d{9}$/.test(t) || /^\+\d{8,15}$/.test(t);
}

export function emailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function problemaCamp(camp: CampContract, valoare: string): string | null {
  const v = valoare.trim();

  if (!v) return camp.obligatoriu ? "Completează acest câmp." : null;

  switch (camp.tip) {
    case "cnp":
      return cnpValid(v) ? null : "CNP-ul nu pare corect. Are 13 cifre.";
    case "tel":
      return telefonValid(v) ? null : "Numărul de telefon nu pare corect.";
    case "email":
      return emailValid(v) ? null : "Adresa de e-mail nu pare corectă.";
    case "varsta": {
      const n = Number(v);
      if (!Number.isInteger(n) || n < 0 || n > 17) {
        return "Vârsta trebuie să fie între 0 și 17 ani.";
      }
      return null;
    }
    case "lung":
      return v.length > 1200 ? "Textul e prea lung." : null;
    default:
      return v.length > 200 ? "Textul e prea lung." : null;
  }
}

export type Probleme = Record<string, string>;

/**
 * Verifică tot formularul.
 *
 * Grupurile opționale (al doilea părinte) sunt fie complet goale, fie complet
 * completate — jumătate de părinte nu ajută pe nimeni.
 */
export function verificaDatele(
  tip: TipContract,
  date: Record<string, string>,
): Probleme {
  const probleme: Probleme = {};

  const areParinte2 =
    tip === "MINOR" && Boolean((date.b2_nume ?? "").trim());

  for (const camp of campuriClient(tip)) {
    const eDinGrupOptional = camp.nume.startsWith("b2_");

    // Grupul opțional se verifică doar dacă a fost început.
    if (eDinGrupOptional && !areParinte2) continue;

    const obligatoriuAcum = eDinGrupOptional ? true : camp.obligatoriu;
    const problema = problemaCamp(
      { ...camp, obligatoriu: obligatoriuAcum },
      date[camp.nume] ?? "",
    );

    if (problema) probleme[camp.nume] = problema;
  }

  return probleme;
}

/** Câte semnături se așteaptă, în funcție de ce a completat clientul. */
export function semnaturiNecesare(
  tip: TipContract,
  date: Record<string, string>,
): number {
  if (tip !== "MINOR") return 1;
  return (date.b2_nume ?? "").trim() ? 2 : 1;
}
