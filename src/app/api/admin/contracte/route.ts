import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { creeazaContract, esteTip } from "@/lib/contracts";

type DateContract = { tip: string; nume: string; email: string; pret: number };

/** Verificările comune la creare și la editare. Întoarce un mesaj sau null. */
function problema(d: DateContract): string | null {
  if (!esteTip(d.tip)) return "Alege tipul contractului.";
  if (d.nume.length < 3) return "Scrie numele clientului.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email))
    return "Adresa de e-mail nu e validă.";
  if (!Number.isFinite(d.pret) || d.pret <= 0 || d.pret > 100000)
    return "Prețul nu e valid.";
  return null;
}

function citesteDatele(body: Record<string, unknown>): DateContract {
  return {
    tip: String(body.tip ?? ""),
    nume: String(body.nume ?? "").trim(),
    email: String(body.email ?? "").trim().toLowerCase(),
    pret: Number(body.pret),
  };
}

/** POST — pregătește un contract și întoarce linkul de trimis clientului. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const date = citesteDatele(body);
  const gresit = problema(date);
  if (gresit) return NextResponse.json({ error: gresit }, { status: 400 });

  /* Dacă adresa aparține unui client cu cont, legăm contractul de el. */
  const client = await db.user.findUnique({
    where: { email: date.email },
    select: { id: true },
  });

  const contract = await creeazaContract({
    tip: date.tip as "ADULT" | "MINOR",
    numeDestinatar: date.nume,
    emailDestinatar: date.email,
    pretLei: date.pret,
    userId: client?.id ?? null,
  });

  return NextResponse.json({
    ok: true,
    numar: contract.number,
    link: `/contract/${contract.token}`,
  });
}

/**
 * PATCH — modifică un contract încă nesemnat.
 *
 * `{ id, anuleaza: true }` îl anulează. Altfel, corectează datele (tip, nume,
 * e-mail, preț) — util când te-ai grăbit sau ai tastat greșit. Un contract
 * semnat nu se mai atinge: PDF-ul e deja generat și semnat cu datele acelea.
 */
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const id = String(body.id ?? "");
  const contract = await db.contract.findUnique({ where: { id } });
  if (!contract) {
    return NextResponse.json({ error: "Contractul nu există." }, { status: 404 });
  }

  // ---- anulare ----
  if (body.anuleaza === true) {
    if (contract.status === "SIGNED") {
      return NextResponse.json(
        { error: "Contractul e deja semnat și nu mai poate fi anulat." },
        { status: 409 },
      );
    }
    await db.contract.update({ where: { id }, data: { status: "CANCELLED" } });
    return NextResponse.json({ ok: true });
  }

  // ---- editare ----
  if (contract.status === "SIGNED") {
    return NextResponse.json(
      { error: "Contractul e deja semnat și nu mai poate fi modificat." },
      { status: 409 },
    );
  }

  const date = citesteDatele(body);
  const gresit = problema(date);
  if (gresit) return NextResponse.json({ error: gresit }, { status: 400 });

  const client = await db.user.findUnique({
    where: { email: date.email },
    select: { id: true },
  });

  await db.contract.update({
    where: { id },
    data: {
      type: date.tip,
      sentToName: date.nume,
      sentToEmail: date.email,
      price: Math.round(date.pret * 100),
      userId: client?.id ?? null,
      /* Dacă era anulat și îl corectezi, revine în așteptare. */
      status: "SENT",
    },
  });

  return NextResponse.json({ ok: true });
}
