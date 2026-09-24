import { NextResponse } from "next/server";
import { creeazaComanda } from "@/lib/consiliere";
import { clientIp } from "@/lib/request";

/* ----------------------------------------------------------------------------
   Evaluarea psihologică gratuită — începe o evaluare nouă.

   Folosește același chestionar ca ghidul despre divorț, dar cu suma 0:
   interpretarea e gratuită, fără plată și fără PDF.
   -------------------------------------------------------------------------- */

const FEREASTRA = 60 * 60 * 1000;
const MAX = 20;
const hits = new Map<string, number[]>();
function preaDese(ip: string) {
  const acum = Date.now();
  const recente = (hits.get(ip) ?? []).filter((t) => acum - t < FEREASTRA);
  recente.push(acum);
  hits.set(ip, recente);
  return recente.length > MAX;
}

export async function POST(request: Request) {
  if (preaDese(clientIp(request))) {
    return NextResponse.json({ error: "Prea multe cereri. Încearcă mai târziu." }, { status: 429 });
  }
  const comanda = await creeazaComanda(0);
  return NextResponse.json({ ok: true, token: comanda.token });
}
