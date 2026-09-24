import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { genereazaSiSalveaza } from "@/lib/consiliere";

/** POST — (re)generează interpretarea pentru o comandă. Doar administratorul.
   Util pentru a testa rezultatul înainte de a lega Stripe. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }
  const { id } = await params;
  const comanda = await db.guideOrder.findUnique({ where: { id } });
  if (!comanda) return NextResponse.json({ error: "Comanda nu există." }, { status: 404 });

  const rezultat = await genereazaSiSalveaza(comanda.token, true);
  if (!rezultat.ok) return NextResponse.json({ error: rezultat.error }, { status: 502 });
  return NextResponse.json({ ok: true });
}
