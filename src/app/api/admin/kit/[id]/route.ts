import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { genereazaSiSalveaza } from "@/lib/kit";

/** POST — (re)generează interpretarea unei comenzi, în fundal. Doar administratorul.
   Durează aproximativ un minut; butonul din panou urmărește starea. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }
  const { id } = await params;
  const comanda = await db.guideOrder.findUnique({ where: { id } });
  if (!comanda) return NextResponse.json({ error: "Comanda nu există." }, { status: 404 });

  void genereazaSiSalveaza(comanda.token, true);
  return NextResponse.json({ ok: true, token: comanda.token });
}
