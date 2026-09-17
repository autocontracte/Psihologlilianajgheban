import { NextResponse } from "next/server";
import { creeazaComanda } from "@/lib/consiliere";
import { clientIp } from "@/lib/request";

/* Limită largă: cineva poate reîncepe de câteva ori. Doar contra inundării. */
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

/** POST — începe o comandă nouă și întoarce tokenul. */
export async function POST(request: Request) {
  if (preaDese(clientIp(request))) {
    return NextResponse.json({ error: "Prea multe cereri. Încearcă mai târziu." }, { status: 429 });
  }
  const comanda = await creeazaComanda();
  return NextResponse.json({ ok: true, token: comanda.token });
}
