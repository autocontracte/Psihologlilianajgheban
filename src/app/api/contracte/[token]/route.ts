import { NextResponse } from "next/server";
import { semneazaContract } from "@/lib/contracts";
import { clientIp } from "@/lib/request";

/* ----------------------------------------------------------------------------
   Limita e pusă larg dinadins.

   Cine completează un contract greșește: un CNP tastat pe telefon, un număr cu
   spații, un câmp uitat. Fiecare corectare e o cerere nouă. O limită strânsă ar
   bloca exact omul care se străduiește, iar mesajul „așteaptă zece minute" nu-i
   spune ce a greșit.

   Costul real e generarea PDF-ului, iar aceea se întâmplă o singură dată: la a
   doua încercare contractul e deja semnat și cererea e respinsă. Deci limita de
   aici apără doar împotriva inundării, nu a omului care se corectează.
   -------------------------------------------------------------------------- */
const FEREASTRA_MS = 10 * 60 * 1000;
const MAX_INCERCARI = 60;
const incercari = new Map<string, number[]>();

function preaDese(ip: string): boolean {
  const acum = Date.now();
  const recente = (incercari.get(ip) ?? []).filter((t) => acum - t < FEREASTRA_MS);
  recente.push(acum);
  incercari.set(ip, recente);
  return recente.length > MAX_INCERCARI;
}

/** POST — clientul completează și semnează contractul. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const ip = clientIp(request);

  if (preaDese(ip)) {
    return NextResponse.json(
      { error: "Prea multe încercări. Așteaptă câteva minute." },
      { status: 429 },
    );
  }

  const { token } = await params;

  let body: { date?: Record<string, string>; semnaturi?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  if (typeof body.date !== "object" || !body.date || !Array.isArray(body.semnaturi)) {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const date: Record<string, string> = {};
  for (const [k, v] of Object.entries(body.date)) {
    if (typeof v === "string") date[k] = v.slice(0, 1500);
  }

  const rezultat = await semneazaContract(token, {
    date,
    semnaturi: body.semnaturi.filter((s): s is string => typeof s === "string"),
    ip,
    agent: request.headers.get("user-agent") ?? "necunoscut",
  });

  if (!rezultat.ok) {
    return NextResponse.json(
      { error: rezultat.error, probleme: rezultat.probleme },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
