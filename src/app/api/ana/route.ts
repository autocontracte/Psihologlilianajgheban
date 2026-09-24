import { NextResponse } from "next/server";
import { clientIp } from "@/lib/request";
import { ANA_MAX_INTREBARI, anaActiva, curataIstoric, raspundeAna } from "@/lib/ana";

/* ----------------------------------------------------------------------------
   Ana — rută pentru chat. Primește istoricul conversației (ținut în browser)
   și întoarce răspunsul ca text care curge, bucată cu bucată.

   Două limite, ca să nu se consume cheia degeaba:
     - cel mult ANA_MAX_INTREBARI întrebări într-o conversație;
     - cel mult MAX_PE_ORA întrebări de la același IP într-o oră (cine golește
       conversația și o ia de la capăt nu trece de ea).
   Conversațiile nu se salvează nicăieri.
   -------------------------------------------------------------------------- */

export const dynamic = "force-dynamic";

const FEREASTRA_MS = 60 * 60 * 1000;
const MAX_PE_ORA = 40;
const accesari = new Map<string, number[]>();

function preaMulte(ip: string): boolean {
  const acum = Date.now();
  const recente = (accesari.get(ip) ?? []).filter((t) => acum - t < FEREASTRA_MS);
  recente.push(acum);
  accesari.set(ip, recente);
  if (accesari.size > 5000) {
    for (const [k, t] of accesari) if (t.every((x) => acum - x >= FEREASTRA_MS)) accesari.delete(k);
  }
  return recente.length > MAX_PE_ORA;
}

export async function POST(request: Request) {
  if (!anaActiva) {
    return NextResponse.json({ error: "Ana nu este disponibilă acum." }, { status: 503 });
  }

  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const istoric = curataIstoric(body.messages);
  if (!istoric.length || istoric[istoric.length - 1].role !== "user") {
    return NextResponse.json({ error: "Scrie o întrebare." }, { status: 400 });
  }

  if (istoric.filter((m) => m.role === "user").length > ANA_MAX_INTREBARI) {
    return NextResponse.json({ limita: true }, { status: 429 });
  }

  if (preaMulte(clientIp(request))) {
    return NextResponse.json(
      {
        error:
          "Ai pus multe întrebări în ultima oră. Pentru restul, cel mai simplu e să o suni pe Liliana sau să îți faci o programare.",
      },
      { status: 429 },
    );
  }

  try {
    const flux = await raspundeAna(istoric);
    return new Response(flux, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("[ana]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Ana nu a putut răspunde acum. Încearcă din nou în câteva momente." },
      { status: 502 },
    );
  }
}
