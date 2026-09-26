import { NextResponse } from "next/server";
import { getComanda, raspunsuriComanda } from "@/lib/kit";
import { genereazaRaportPdf } from "@/lib/kit/pdf";
import { citesteInterpretarea } from "@/lib/kit/raport";
import { calculeaza } from "@/lib/kit/test";

/** GET — raportul personal, în PDF. Doar după plată. */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const comanda = await getComanda(token);
  if (!comanda || comanda.status !== "PAID") {
    return NextResponse.json({ error: "Raportul nu e disponibil." }, { status: 403 });
  }

  const raspunsuri = raspunsuriComanda(comanda);
  const rezultat = calculeaza(raspunsuri);
  if (!rezultat) return NextResponse.json({ error: "Testul nu e complet." }, { status: 404 });

  const interpretare = citesteInterpretarea(comanda.interpretation);
  try {
    const bytes = await genereazaRaportPdf({
      email: comanda.email,
      data: comanda.paidAt ?? comanda.createdAt,
      raspunsuri,
      rezultat,
      ai: interpretare?.tip === "raport" ? interpretare.raport : null,
    });
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename*=UTF-8''Raport-Cum-stai-cu-relatia-ta.pdf",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[kit] pdf", err);
    return NextResponse.json({ error: "Nu am putut genera PDF-ul. Încearcă din nou." }, { status: 500 });
  }
}
