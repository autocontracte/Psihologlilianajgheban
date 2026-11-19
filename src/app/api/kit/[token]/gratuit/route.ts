import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { platileSuntActive } from "@/lib/stripe";
import { confirmaPlata, getComanda, PRET_KIT_BANI, raspunsuriComanda } from "@/lib/kit";
import { testComplet } from "@/lib/kit/test";
import { dateParte } from "@/lib/ghid/comanda";
import { complet } from "@/lib/ghid/chestionare";
import { PRET_PARTE_BANI } from "@/lib/ghid/parti";

/* ----------------------------------------------------------------------------
   Finalizare fără plată — doar în perioada de testare.

   Cât timp plata online NU e configurată, kitul se poate primi gratuit, ca să
   putem testa tot fluxul. În clipa în care se completează cheile Stripe,
   această rută se închide singură (403): finalizarea trece prin plată.
   -------------------------------------------------------------------------- */
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  if (platileSuntActive) {
    return NextResponse.json(
      { error: "Finalizarea gratuită nu mai e disponibilă. Folosește plata." },
      { status: 403 },
    );
  }

  const { token } = await params;
  const comanda = await getComanda(token);
  if (!comanda) return NextResponse.json({ error: "Comanda nu există." }, { status: 404 });
  const pe = dateParte(comanda);
  if (pe ? !complet(pe.chestionar, pe.raspunsuri) : !testComplet(raspunsuriComanda(comanda))) {
    return NextResponse.json({ error: "Testul nu e complet." }, { status: 400 });
  }

  let email = comanda.email;
  try {
    const body = await request.json();
    if (typeof body?.email === "string" && body.email.trim()) email = body.email.trim().toLowerCase();
  } catch {
    /* fără email în corp — rămâne cel salvat */
  }

  if (pe) {
    await db.guideOrder.update({ where: { id: comanda.id }, data: { amount: PRET_PARTE_BANI, parte: pe.parte.nr } });
  } else if (comanda.amount !== PRET_KIT_BANI) {
    await db.guideOrder.update({ where: { id: comanda.id }, data: { amount: PRET_KIT_BANI } });
  }
  await confirmaPlata(comanda.id, email);
  return NextResponse.json({ ok: true });
}
