import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { platileSuntActive } from "@/lib/stripe";
import { eEvaluareGratuita, getComanda, genereazaSiSalveaza } from "@/lib/consiliere";

/* ----------------------------------------------------------------------------
   Finalizare gratuită — doar în perioada de testare.

   Cât timp plata online NU e configurată, omul primește interpretarea și
   ghidul fără plată, ca să putem testa tot fluxul. În clipa în care se
   completează cheile Stripe, această rută se închide singură (întoarce 403):
   atunci finalizarea trece obligatoriu prin plată.
   -------------------------------------------------------------------------- */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  if (platileSuntActive) {
    return NextResponse.json(
      { error: "Finalizarea gratuită nu mai e disponibilă. Folosește plata." },
      { status: 403 },
    );
  }

  const { token } = await params;
  const comanda = await getComanda(token);
  if (!comanda) return NextResponse.json({ error: "Comanda nu există." }, { status: 404 });
  // O evaluare gratuită primește ghidul doar după ce devine comandă de ghid
  if (eEvaluareGratuita(comanda)) {
    return NextResponse.json({ error: "Comanda ghidului nu a fost pornită." }, { status: 400 });
  }

  let email = comanda.email;
  try {
    const body = await request.json();
    if (typeof body?.email === "string") email = body.email.trim().toLowerCase();
  } catch {
    /* fără email în corp — rămâne cel salvat */
  }

  if (comanda.status !== "PAID") {
    await db.guideOrder.update({
      where: { id: comanda.id },
      data: { status: "PAID", paidAt: new Date(), ...(email ? { email } : {}) },
    });
    // Generează interpretarea acum (webhook-ul Stripe ar face-o în mod normal).
    try {
      await genereazaSiSalveaza(token);
    } catch {
      /* dacă pică, se poate regenera din admin; nu blocăm rezultatul */
    }
  }

  return NextResponse.json({ ok: true });
}
