import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { semnaturaValida } from "@/lib/ics";
import { sincronizeazaProgramarea } from "@/lib/calendarSync";
import { SITE } from "@/content/site";

/* ----------------------------------------------------------------------------
   Clientul a apăsat „Înapoi” în pagina Stripe, la o programare cu plată
   online. Ora se eliberează imediat, nu peste o jumătate de oră.

   Linkul e semnat și anulează doar programări online încă neplătite — nimic
   altceva nu se poate face cu el.
   -------------------------------------------------------------------------- */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("p") ?? "";
  const sig = searchParams.get("t") ?? "";

  if (semnaturaValida("renunta", id, sig)) {
    const p = await db.appointment.findUnique({
      where: { id },
      include: { payments: true },
    });

    const neplatita =
      p &&
      p.status === "PENDING" &&
      p.paymentMethod === "ONLINE" &&
      !p.payments.some((x) => x.status === "PAID");

    if (neplatita) {
      await db.appointment.update({
        where: { id },
        data: { status: "CANCELLED", holdExpiresAt: null },
      });
      await sincronizeazaProgramarea(id);
    }
  }

  return NextResponse.redirect(`${SITE.url}/programari?plata=anulata`, 303);
}
