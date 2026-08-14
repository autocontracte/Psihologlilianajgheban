import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CANCEL_LEAD_HOURS } from "@/lib/slots";

/** PATCH — clientul își anulează propria programare. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Neautentificat." }, { status: 401 });
  }

  const { id } = await params;

  const appointment = await db.appointment.findUnique({ where: { id } });

  // Același răspuns pentru „nu există" și „nu e a ta", ca să nu se poată
  // afla ce programări există în sistem.
  if (!appointment || appointment.userId !== user.id) {
    return NextResponse.json(
      { error: "Programarea nu a fost găsită." },
      { status: 404 },
    );
  }

  if (appointment.status === "CANCELLED") {
    return NextResponse.json({ error: "Programarea este deja anulată." }, {
      status: 400,
    });
  }

  if (appointment.status === "COMPLETED") {
    return NextResponse.json(
      { error: "Programarea a avut deja loc." },
      { status: 400 },
    );
  }

  const hoursLeft =
    (appointment.startsAt.getTime() - Date.now()) / (60 * 60 * 1000);

  if (hoursLeft < CANCEL_LEAD_HOURS) {
    return NextResponse.json(
      {
        error: `Anularea se poate face cu cel puțin ${CANCEL_LEAD_HOURS} de ore înainte. Sună-mă pentru a reprograma.`,
      },
      { status: 400 },
    );
  }

  await db.appointment.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ ok: true });
}
