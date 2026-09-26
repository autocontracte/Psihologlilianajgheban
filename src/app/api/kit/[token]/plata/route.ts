import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { platileSuntActive, stripe } from "@/lib/stripe";
import { getComanda, NUME_KIT, PRET_KIT_BANI, raspunsuriComanda } from "@/lib/kit";
import { testComplet } from "@/lib/kit/test";
import { SITE } from "@/content/site";

/** POST — pornește plata kitului (89 lei). Suma vine de pe server, nu din browser. */
export async function POST(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!platileSuntActive) {
    return NextResponse.json({ error: "Plata online nu este încă activată." }, { status: 503 });
  }

  const { token } = await params;
  const comanda = await getComanda(token);
  if (!comanda) return NextResponse.json({ error: "Comanda nu există." }, { status: 404 });
  if (comanda.status === "PAID") {
    return NextResponse.json({ ok: true, url: `${SITE.url}/kit/rezultat/${token}` });
  }
  if (!comanda.email) {
    return NextResponse.json({ error: "Lasă întâi adresa de e-mail." }, { status: 400 });
  }
  if (!testComplet(raspunsuriComanda(comanda))) {
    return NextResponse.json({ error: "Testul nu e complet. Răspunde la toate cele 30 de întrebări." }, { status: 400 });
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
            unit_amount: PRET_KIT_BANI,
            product_data: {
              name: `Kit „${NUME_KIT}”`,
              description:
                "Test de 30 de întrebări, raport personal detaliat (PDF) și ghidul practic de 63 de pagini (PDF)",
            },
          },
        },
      ],
      success_url: `${SITE.url}/kit/rezultat/${comanda.token}`,
      cancel_url: `${SITE.url}/kit#test`,
      metadata: { orderToken: comanda.token },
    });

    // Comenzile vechi pot avea alt preț salvat; contează cel de acum.
    await db.guideOrder.update({
      where: { id: comanda.id },
      data: { paymentRef: session.id, amount: PRET_KIT_BANI },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("[kit] checkout", err);
    return NextResponse.json({ error: "Plata nu a putut fi pornită." }, { status: 500 });
  }
}
