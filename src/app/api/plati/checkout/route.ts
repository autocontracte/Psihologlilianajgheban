import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { platileSuntActive, stripe } from "@/lib/stripe";
import { SITE } from "@/content/site";

/* ----------------------------------------------------------------------------
   Pornește plata pentru o programare.

   Suma NU vine de la client — se citește din baza de date, după serviciul
   programării. Altfel oricine ar putea trimite „amount: 1" și ar plăti un leu.
   -------------------------------------------------------------------------- */

export async function POST(request: Request) {
  if (!platileSuntActive) {
    return NextResponse.json(
      { error: "Plata online nu este încă activată." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const appointmentId = String(body.appointmentId ?? "");
  const user = await getCurrentUser();

  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: { service: true, user: true, payments: true },
  });

  if (!appointment) {
    return NextResponse.json(
      { error: "Programarea nu a fost găsită." },
      { status: 404 },
    );
  }

  /* Cine are cont poate plăti doar programările proprii. Cine a rezervat fără
     cont ajunge aici prin linkul primit pe email, care conține identificatorul
     — deci nu cerem autentificare, dar nici nu expunem nimic în plus. */
  if (appointment.userId && (!user || user.id !== appointment.userId)) {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  if (appointment.status === "CANCELLED") {
    return NextResponse.json(
      { error: "Programarea este anulată." },
      { status: 400 },
    );
  }

  const dejaPlatita = appointment.payments.some((p) => p.status === "PAID");
  if (dejaPlatita) {
    return NextResponse.json(
      { error: "Ședința este deja plătită." },
      { status: 409 },
    );
  }

  const email =
    appointment.user?.email ?? appointment.guestEmail ?? undefined;

  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      client_reference_id: appointment.id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "ron",
            unit_amount: appointment.service.price,
            product_data: {
              name: appointment.service.name,
              description: `Ședință de ${appointment.service.duration} de minute`,
            },
          },
        },
      ],
      success_url: `${SITE.url}/plata/confirmare?sesiune={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE.url}/cont`,
      metadata: { appointmentId: appointment.id },
    });

    await db.payment.create({
      data: {
        appointmentId: appointment.id,
        provider: "STRIPE",
        externalId: session.id,
        amount: appointment.service.price,
        currency: "RON",
        status: "PENDING",
      },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("[plata] checkout", err);
    return NextResponse.json(
      { error: "Plata nu a putut fi pornită." },
      { status: 500 },
    );
  }
}
