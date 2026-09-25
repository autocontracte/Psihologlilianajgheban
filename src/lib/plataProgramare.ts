import "server-only";

import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { semneaza } from "@/lib/ics";
import { sincronizeazaProgramarea } from "@/lib/calendarSync";
import { emailProgramarePlatita } from "@/lib/emailProgramari";
import { SITE } from "@/content/site";

/* ----------------------------------------------------------------------------
   Plata unei ședințe.

   Cine alege „plătesc online” e trimis direct la Stripe. Ora îi e ținută cât
   timp plătește; dacă renunță sau nu termină, ora se eliberează singură.
   După plată, programarea e confirmată automat — fără să mai aștepte
   confirmarea Lilianei.
   -------------------------------------------------------------------------- */

/** Cât timp e ținută ora. Stripe nu acceptă sesiuni mai scurte de 30 de minute. */
export const HOLD_MIN = 30;

/** Pornește plata și întoarce adresa paginii Stripe. */
export async function pornestePlata(
  appointmentId: string,
  opt: { laProgramare?: boolean } = {},
): Promise<string> {
  const appointment = await db.appointment.findUniqueOrThrow({
    where: { id: appointmentId },
    include: { service: true, user: true },
  });

  const email = appointment.user?.email ?? appointment.guestEmail ?? undefined;
  const expiraLa = new Date(Date.now() + HOLD_MIN * 60_000 + 60_000);

  /* La programare, „Înapoi” din Stripe trebuie să elibereze ora imediat, nu
     peste o jumătate de oră. Linkul e semnat, ca nimeni să nu poată anula
     programarea altcuiva. */
  const cancelUrl = opt.laProgramare
    ? `${SITE.url}/api/plati/renunta?p=${appointment.id}&t=${semneaza("renunta", appointment.id)}`
    : `${SITE.url}/cont`;

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
    ...(opt.laProgramare ? { expires_at: Math.floor(expiraLa.getTime() / 1000) } : {}),
    success_url: `${SITE.url}/plata/confirmare?sesiune={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
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

  return session.url!;
}

/**
 * Plata a reușit: o programare încă neconfirmată devine confirmată, apare în
 * Google Calendar, iar clientul și cabinetul sunt anunțați.
 */
export async function confirmaDupaPlata(appointmentId: string): Promise<void> {
  const p = await db.appointment.findUnique({ where: { id: appointmentId } });
  if (!p || p.status !== "PENDING") return;

  const confirmata = await db.appointment.update({
    where: { id: p.id },
    data: {
      status: "CONFIRMED",
      holdExpiresAt: null,
      calendarSeq: { increment: 1 },
    },
    include: { service: true, user: true },
  });

  await Promise.all([
    sincronizeazaProgramarea(confirmata.id),
    emailProgramarePlatita(confirmata),
  ]);
}

/**
 * Programările online neplătite la timp se anulează, ca ora să rămână liberă
 * și în panou să nu apară cereri fantomă. Rulează periodic.
 */
export async function elibereazaNeplatite(): Promise<number> {
  const expirate = await db.appointment.findMany({
    where: {
      status: "PENDING",
      paymentMethod: "ONLINE",
      holdExpiresAt: { lt: new Date() },
      payments: { none: { status: "PAID" } },
    },
    select: { id: true },
  });

  for (const { id } of expirate) {
    await db.appointment.update({
      where: { id },
      data: { status: "CANCELLED", holdExpiresAt: null },
    });
    await sincronizeazaProgramarea(id);
  }
  return expirate.length;
}
