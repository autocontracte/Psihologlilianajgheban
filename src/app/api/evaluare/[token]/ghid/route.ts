import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eEvaluareGratuita, getComanda, PRET_GHID_BANI } from "@/lib/consiliere";

/* ----------------------------------------------------------------------------
   Din evaluarea gratuită, omul poate cumpăra ghidul complet.

   Evaluarea devine o comandă obișnuită a ghidului (aceleași răspunsuri,
   aceeași interpretare, deja gata), cu prețul ghidului. De aici clientul
   continuă cu fluxul existent: plata (/api/consiliere/[token]/plata) sau, cât
   plata online nu e activă, finalizarea de test (/gratuit).
   -------------------------------------------------------------------------- */
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const comanda = await getComanda(token);
  if (!comanda) return NextResponse.json({ error: "Evaluarea nu există." }, { status: 404 });
  if (comanda.status === "PAID") return NextResponse.json({ ok: true, platit: true });

  let email = comanda.email ?? "";
  try {
    const body = await request.json();
    if (typeof body?.email === "string" && body.email.trim()) email = body.email.trim().toLowerCase();
  } catch {
    /* fără corp */
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Lasă o adresă de e-mail validă: acolo primești ghidul." }, { status: 400 });
  }

  await db.guideOrder.update({
    where: { id: comanda.id },
    data: { email, ...(eEvaluareGratuita(comanda) ? { amount: PRET_GHID_BANI } : {}) },
  });
  return NextResponse.json({ ok: true });
}
