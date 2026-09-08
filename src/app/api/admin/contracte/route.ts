import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { creeazaContract, esteTip } from "@/lib/contracts";

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

  const tip = String(body.tip ?? "");
  const nume = String(body.nume ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const pret = Number(body.pret);

  if (!esteTip(tip)) {
    return NextResponse.json({ error: "Alege tipul contractului." }, { status: 400 });
  }
  if (nume.length < 3) {
    return NextResponse.json({ error: "Scrie numele clientului." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Adresa de e-mail nu e validă." }, { status: 400 });
  }
  if (!Number.isFinite(pret) || pret <= 0 || pret > 100000) {
    return NextResponse.json({ error: "Prețul nu e valid." }, { status: 400 });
  }

  /* Dacă adresa aparține unui client cu cont, legăm contractul de el. */
  const client = await db.user.findUnique({ where: { email }, select: { id: true } });

  const contract = await creeazaContract({
    tip,
    numeDestinatar: nume,
    emailDestinatar: email,
    pretLei: pret,
    userId: client?.id ?? null,
  });

  return NextResponse.json({
    ok: true,
    numar: contract.number,
    link: `/contract/${contract.token}`,
  });
}

/** PATCH — anulează un contract trimis din greșeală. */
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
  if (contract.status === "SIGNED") {
    return NextResponse.json(
      { error: "Contractul e deja semnat și nu mai poate fi anulat." },
      { status: 409 },
    );
  }

  await db.contract.update({ where: { id }, data: { status: "CANCELLED" } });

  return NextResponse.json({ ok: true });
}
