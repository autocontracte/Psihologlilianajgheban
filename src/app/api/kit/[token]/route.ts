import { NextResponse } from "next/server";
import { salveazaComanda } from "@/lib/consiliere";
import type { Raspunsuri } from "@/lib/consiliere/intrebari";

/** PATCH — salvează răspunsurile și, opțional, emailul. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  let body: { answers?: unknown; email?: unknown };
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

  const comanda = await salveazaComanda(token, raspunsuri, email);
  if (!comanda) return NextResponse.json({ error: "Comanda nu există." }, { status: 404 });

  return NextResponse.json({ ok: true, status: comanda.status });
}
