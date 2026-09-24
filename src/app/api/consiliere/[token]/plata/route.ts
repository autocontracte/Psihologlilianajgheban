import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { platileSuntActive, stripe } from "@/lib/stripe";
import { eEvaluareGratuita, getComanda } from "@/lib/consiliere";
import { SITE } from "@/content/site";

/** POST — pornește plata de 50 lei pentru ghid. Suma vine din baza de date. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  if (!platileSuntActive) {
    return NextResponse.json({ error: "Plata online nu este încă activată." }, { status: 503 });
  }

  const { token } = await params;
  const comanda = await getComanda(token);
  if (!comanda) return NextResponse.json({ error: "Comanda nu există." }, { status: 404 });
  // O evaluare gratuită se plătește doar după ce devine comandă de ghid (/api/evaluare/[token]/ghid)
  if (eEvaluareGratuita(comanda)) {
    return NextResponse.json({ error: "Comanda ghidului nu a fost pornită." }, { status: 400 });
  }
  if (comanda.status === "PAID") {
    return NextResponse.json({ error: "Ghidul e deja plătit." }, { status: 409 });
  }
  if (!comanda.email) {
    return NextResponse.json({ error: "Lasă întâi adresa de e-mail." }, { status: 400 });
  }

  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: comanda.email,
      client_reference_id: comanda.id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "ron",
            unit_amount: comanda.amount,
            product_data: {
              name: "Ghid practic despre divorț",
              description: "Interpretare personalizată + ghidul complet în PDF",
            },
          },
        },
      ],
      success_url: `${SITE.url}/consiliere/rezultat/${comanda.token}`,
      cancel_url: `${SITE.url}/consiliere`,
      metadata: { orderToken: comanda.token },
    });

    await db.guideOrder.update({
      where: { id: comanda.id },
      data: { paymentRef: session.id },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("[consiliere] checkout", err);
    return NextResponse.json({ error: "Plata nu a putut fi pornită." }, { status: 500 });
  }
}
