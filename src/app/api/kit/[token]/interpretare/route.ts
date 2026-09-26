import { NextResponse } from "next/server";
import { genereazaSiSalveaza, getComanda, interpretareaActiva, seGenereaza } from "@/lib/kit";

/* ----------------------------------------------------------------------------
   Starea interpretării personale, pentru pagina rezultatului.

   GET  — gata | in_lucru | lipsa
   POST — pornește generarea (în fundal) dacă lipsește și nu rulează deja.
          Plasa de siguranță pentru cazul în care generarea de după plată a
          picat (de exemplu, serverul a fost repornit chiar atunci).
   -------------------------------------------------------------------------- */

async function stare(token: string) {
  const comanda = await getComanda(token);
  if (!comanda || comanda.status !== "PAID") return null;
  if (seGenereaza(token)) return "in_lucru" as const;
  return comanda.interpretation ? ("gata" as const) : ("lipsa" as const);
}

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const s = await stare(token);
  if (!s) return NextResponse.json({ error: "Comanda nu există." }, { status: 404 });
  return NextResponse.json({ stare: s });
}

export async function POST(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const s = await stare(token);
  if (!s) return NextResponse.json({ error: "Comanda nu există." }, { status: 404 });
  if (s === "lipsa" && interpretareaActiva) {
    void genereazaSiSalveaza(token);
    return NextResponse.json({ stare: "in_lucru" });
  }
  return NextResponse.json({ stare: s });
}
