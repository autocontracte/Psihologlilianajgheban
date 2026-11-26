import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { platileSuntActive, stripe } from "@/lib/stripe";
import { getComanda, NUME_KIT, PRET_KIT_BANI, raspunsuriComanda } from "@/lib/kit";
import { testComplet } from "@/lib/kit/test";
import { SITE } from "@/content/site";
import { dateParte } from "@/lib/ghid/comanda";
import { complet } from "@/lib/ghid/chestionare";
import { NUME_GHID, numeParte, PRET_PARTE_BANI } from "@/lib/ghid/parti";

/** POST — pornește plata trusei (89 lei). Suma vine de pe server, nu din browser. */
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
  const pe = dateParte(comanda);
  if (pe ? !complet(pe.chestionar, pe.raspunsuri) : !testComplet(raspunsuriComanda(comanda))) {
    return NextResponse.json({ error: "Testul nu e complet. Răspunde la toate cele 30 de întrebări." }, { status: 400 });
  }

  try {
    const pret = pe ? PRET_PARTE_BANI : PRET_KIT_BANI;
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: comanda.email,
      client_reference_id: comanda.id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "ron",
            unit_amount: pret,
            product_data: pe
              ? {
                  name: `${numeParte(pe.parte)}, din ${NUME_GHID}`,
                  description: `Raport personal pe răspunsurile tale și partea din ghid (PDF, ${pe.parte.pagini} de pagini)`,
                }
              : {
                  name: `Trusa de ajutor „${NUME_KIT}”`,
                  description:
                    "Test de 30 de întrebări, raport personal detaliat (PDF) și ghidul practic de 79 de pagini (PDF)",
                },
          },
        },
      ],
      success_url: `${SITE.url}/kit/rezultat/${comanda.token}`,
      cancel_url: pe ? `${SITE.url}/kit/rezultat/${comanda.token}` : `${SITE.url}/kit#test`,
      metadata: { orderToken: comanda.token },
    });

    // Comenzile vechi pot avea alt preț salvat; contează cel de acum.
    await db.guideOrder.update({
      where: { id: comanda.id },
      data: { paymentRef: session.id, amount: pret, ...(pe ? { parte: pe.parte.nr } : {}) },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("[kit] checkout", err);
    return NextResponse.json({ error: "Plata nu a putut fi pornită." }, { status: 500 });
  }
}
