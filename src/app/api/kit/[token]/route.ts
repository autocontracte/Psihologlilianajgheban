import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { salveazaComanda } from "@/lib/kit";
import type { Raspunsuri } from "@/lib/kit/test";

/** PATCH — salvează răspunsurile și, opțional, emailul. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  let body: { answers?: unknown; email?: unknown; parte?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const raspunsuri: Raspunsuri = {};
  if (body.answers && typeof body.answers === "object") {
    for (const [k, v] of Object.entries(body.answers as Record<string, unknown>)) {
      if (typeof v === "string") raspunsuri[k] = v.slice(0, 4000);
      else if (Array.isArray(v)) raspunsuri[k] = v.filter((x) => typeof x === "string").map((x) => String(x).slice(0, 300));
    }
  }
  const email = typeof body.email === "string" ? body.email.slice(0, 200) : undefined;

  // Fără răspunsuri în corp (de exemplu doar emailul), cele salvate rămân.
  const comanda = await salveazaComanda(token, body.answers ? raspunsuri : undefined, email);
  if (!comanda) return NextResponse.json({ error: "Comanda nu există." }, { status: 404 });

  // Partea din ghid pe care o cumpără (doar la comenzile pe părți, înainte de plată)
  if (
    comanda.chestionar &&
    comanda.status !== "PAID" &&
    Number.isInteger(body.parte) &&
    (body.parte as number) >= 1 &&
    (body.parte as number) <= 6
  ) {
    await db.guideOrder.update({ where: { id: comanda.id }, data: { parte: body.parte as number } });
  }

  return NextResponse.json({ ok: true, status: comanda.status });
}
