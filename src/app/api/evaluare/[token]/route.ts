import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientIp } from "@/lib/request";
import { eEvaluareGratuita, genereazaSiSalveaza, getComanda } from "@/lib/consiliere";

/* ----------------------------------------------------------------------------
   Evaluarea gratuită — finalizare: salvează răspunsurile (și emailul, dacă
   omul l-a lăsat) și generează interpretarea, o singură dată pe evaluare.

   Fiecare interpretare costă un apel la OpenAI, deci limităm câte evaluări
   poate finaliza un IP într-o oră.
   -------------------------------------------------------------------------- */

const FEREASTRA = 60 * 60 * 1000;
const MAX_PE_ORA = 5;
const finalizari = new Map<string, number[]>();
function preaMulte(ip: string) {
  const acum = Date.now();
  const recente = (finalizari.get(ip) ?? []).filter((t) => acum - t < FEREASTRA);
  recente.push(acum);
  finalizari.set(ip, recente);
  if (finalizari.size > 5000) {
    for (const [k, t] of finalizari) if (t.every((x) => acum - x >= FEREASTRA)) finalizari.delete(k);
  }
  return recente.length > MAX_PE_ORA;
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const comanda = await getComanda(token);
  if (!comanda || !eEvaluareGratuita(comanda)) {
    return NextResponse.json({ error: "Evaluarea nu există." }, { status: 404 });
  }

  // Interpretarea există deja: nu mai plătim încă un apel.
  if (comanda.interpretation) return NextResponse.json({ ok: true });

  if (preaMulte(clientIp(request))) {
    return NextResponse.json(
      { error: "Ai finalizat mai multe evaluări în ultima oră. Încearcă din nou mai târziu." },
      { status: 429 },
    );
  }

  let body: { answers?: unknown; email?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    /* fără corp — rămân răspunsurile deja salvate */
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Adresa de e-mail nu pare validă." }, { status: 400 });
  }

  await db.guideOrder.update({
    where: { id: comanda.id },
    data: {
      ...(body.answers && typeof body.answers === "object" ? { answers: JSON.stringify(body.answers) } : {}),
      ...(email ? { email } : {}),
    },
  });

  const rezultat = await genereazaSiSalveaza(token);
  if (!rezultat.ok) {
    console.error("[evaluare]", rezultat.error);
    return NextResponse.json(
      { error: "Interpretarea nu a putut fi generată acum. Încearcă din nou în câteva minute." },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}
