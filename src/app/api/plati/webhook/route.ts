import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { platileSuntActive, stripe } from "@/lib/stripe";
import { issueInvoiceForPayment } from "@/lib/invoicing";
import { genereazaSiSalveaza } from "@/lib/consiliere";
import { confirmaDupaPlata } from "@/lib/plataProgramare";

/* ----------------------------------------------------------------------------
   Confirmarea plății, direct de la Stripe.

   Nu ne bazăm pe întoarcerea în browser: omul poate închide pagina imediat
   după plată. Stripe ne anunță aici, iar semnătura demonstrează că mesajul
   chiar vine de la ei — fără verificarea ei, oricine ar putea marca o ședință
   drept plătită printr-o simplă cerere.
   -------------------------------------------------------------------------- */

const SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export async function POST(request: Request) {
  if (!platileSuntActive || !SECRET) {
    return NextResponse.json({ error: "Neconfigurat." }, { status: 503 });
  }

  const semnatura = request.headers.get("stripe-signature");
  if (!semnatura) {
    return NextResponse.json({ error: "Lipsește semnătura." }, { status: 400 });
  }

  // Semnătura se verifică pe corpul brut, neatins
  const brut = await request.text();

  let event;
  try {
    event = stripe().webhooks.constructEvent(brut, semnatura, SECRET);
  } catch (err) {
    console.error("[plata] semnatura invalida", err);
    return NextResponse.json({ error: "Semnătură invalidă." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { id: string; payment_status?: string };

    const payment = await db.payment.findUnique({
      where: { externalId: session.id },
    });

    if (payment && payment.status !== "PAID") {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: "PAID", paidAt: new Date() },
      });

      /* Factura se emite imediat, dar dacă programul de facturare nu e încă
         ales, datele rămân salvate și pot fi emise retroactiv. O eroare aici
         nu trebuie să facă Stripe să reia notificarea la nesfârșit. */
      try {
        await issueInvoiceForPayment(payment.id);
      } catch (err) {
        console.error("[factura] emitere esuata", err);
      }

      // Plătită online → confirmată automat, fără să mai aștepte cabinetul
      try {
        await confirmaDupaPlata(payment.appointmentId);
      } catch (err) {
        console.error("[plata] confirmare programare esuata", err);
      }
    }

    /* Aceeași notificare acoperă și cumpărarea ghidului. O găsim după id-ul
       sesiunii; la confirmare, generăm interpretarea AI. O eroare de AI e
       prinsă, ca Stripe să nu reia notificarea la nesfârșit — interpretarea
       se poate regenera oricând din panou. */
    const order = await db.guideOrder.findFirst({
      where: { paymentRef: session.id },
    });
    if (order && order.status !== "PAID") {
      await db.guideOrder.update({
        where: { id: order.id },
        data: { status: "PAID", paidAt: new Date() },
      });
      try {
        await genereazaSiSalveaza(order.token);
      } catch (err) {
        console.error("[consiliere] interpretare esuata", err);
      }
    }
  }

  if (
    event.type === "checkout.session.expired" ||
    event.type === "payment_intent.payment_failed"
  ) {
    const obj = event.data.object as { id: string };
    await db.payment
      .updateMany({ where: { externalId: obj.id }, data: { status: "FAILED" } })
      .catch(() => {});
  }

  return NextResponse.json({ received: true });
}
