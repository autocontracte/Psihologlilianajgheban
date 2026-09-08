import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";

import { db } from "../db";
import { SABLOANE, type TipContract } from "./sabloane";
import { verificaDatele, semnaturiNecesare } from "./validare";
import { completeazaContract, adaugaPaginaDeProba, amprenta } from "./completare";

export { SABLOANE, type TipContract } from "./sabloane";

/* Contractele conțin CNP și istoric medical. Nu ajung niciodată în `public/`. */
const DIR_CONTRACTE = join(process.cwd(), "uploads", "contracte");

export function esteTip(v: unknown): v is TipContract {
  return v === "ADULT" || v === "MINOR";
}

/** 32 de octeți aleatori: nu se poate ghici și nu se poate enumera. */
function tokenNou(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Pregătește un contract și întoarce linkul de semnat.
 *
 * Numerotarea e continuă pe cabinet, nu pe tip: așa arată un registru de
 * contracte, și așa îl caută contabilul.
 */
export async function creeazaContract(intrare: {
  tip: TipContract;
  numeDestinatar: string;
  emailDestinatar: string;
  pretLei: number;
  userId?: string | null;
  appointmentId?: string | null;
}) {
  const ultim = await db.contract.findFirst({
    orderBy: { number: "desc" },
    select: { number: true },
  });

  return db.contract.create({
    data: {
      token: tokenNou(),
      type: intrare.tip,
      number: (ultim?.number ?? 0) + 1,
      sentToName: intrare.numeDestinatar.trim(),
      sentToEmail: intrare.emailDestinatar.trim().toLowerCase(),
      price: Math.round(intrare.pretLei * 100),
      userId: intrare.userId ?? null,
      appointmentId: intrare.appointmentId ?? null,
    },
  });
}

export type RezultatSemnare =
  | { ok: true; token: string }
  | { ok: false; error: string; probleme?: Record<string, string> };

/**
 * Completează, semnează și arhivează contractul.
 *
 * Verificarea se face din nou aici, chiar dacă formularul a verificat deja:
 * cererea poate veni de oriunde, nu doar din pagina noastră.
 */
export async function semneazaContract(
  token: string,
  intrare: {
    date: Record<string, string>;
    semnaturi: string[];
    ip: string;
    agent: string;
  },
): Promise<RezultatSemnare> {
  const contract = await db.contract.findUnique({ where: { token } });

  if (!contract) return { ok: false, error: "Contractul nu există." };
  if (contract.status === "CANCELLED") {
    return { ok: false, error: "Contractul a fost anulat." };
  }
  if (contract.status === "SIGNED") {
    return { ok: false, error: "Contractul e deja semnat." };
  }
  if (!esteTip(contract.type)) {
    return { ok: false, error: "Tip de contract necunoscut." };
  }

  const probleme = verificaDatele(contract.type, intrare.date);
  if (Object.keys(probleme).length > 0) {
    return { ok: false, error: "Mai sunt câmpuri de corectat.", probleme };
  }

  const necesare = semnaturiNecesare(contract.type, intrare.date);
  const semnaturi = intrare.semnaturi.slice(0, necesare);

  if (semnaturi.length < necesare || semnaturi.some((s) => !s)) {
    return { ok: false, error: "Lipsește semnătura." };
  }
  if (semnaturi.some((s) => !s.startsWith("data:image/png"))) {
    return { ok: false, error: "Semnătura nu e validă." };
  }

  const acum = new Date();

  /* Păstrăm doar câmpurile pe care le știe șablonul. Orice altceva a fost
     adăugat de cine a trimis cererea și nu are ce căuta în contract. */
  const cunoscute = new Set(
    SABLOANE[contract.type].grupuri.flatMap((g) => g.campuri.map((c) => c.nume)),
  );
  const campuri = Object.fromEntries(
    Object.entries(intrare.date).filter(([k]) => cunoscute.has(k)),
  );

  let pdf = await completeazaContract({
    tip: contract.type,
    numar: contract.number,
    dataContractului: contract.sentAt,
    dataSemnarii: acum,
    pretLei: Math.round(contract.price / 100),
    campuri,
    semnaturi,
  });

  const semnatari = [campuri.b1_nume, campuri.b2_nume].filter(Boolean) as string[];

  pdf = await adaugaPaginaDeProba(pdf, {
    numar: contract.number,
    tip: contract.type,
    semnatari,
    dataSemnarii: acum,
    ip: intrare.ip,
    agent: intrare.agent,
  });

  await mkdir(DIR_CONTRACTE, { recursive: true });
  const numeFisier = `${contract.id}.pdf`;
  await writeFile(join(DIR_CONTRACTE, numeFisier), pdf);

  await db.contract.update({
    where: { id: contract.id },
    data: {
      status: "SIGNED",
      data: JSON.stringify(campuri),
      signature1: semnaturi[0] ?? null,
      signature2: semnaturi[1] ?? null,
      pdfPath: join("contracte", numeFisier),
      pdfHash: amprenta(pdf),
      signedIp: intrare.ip,
      signedAgent: intrare.agent.slice(0, 300),
      signedAt: acum,
    },
  });

  return { ok: true, token: contract.token };
}

/** Citește PDF-ul semnat de pe disc. */
export async function citestePdf(pdfPath: string) {
  return new Uint8Array(await readFile(join(process.cwd(), "uploads", pdfPath)));
}

/** Numele sub care se descarcă. */
export function numeDescarcare(numar: number, tip: string): string {
  const fel = tip === "MINOR" ? "minor" : "adult";
  return `Contract-${numar}-${fel}-Liliana-Jgheban.pdf`;
}
