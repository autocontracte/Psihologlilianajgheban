import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { citestePdf, numeDescarcare } from "@/lib/contracts";

/**
 * GET — clientul își descarcă propriul contract semnat.
 *
 * Tokenul din link ține loc de autentificare: are 32 de octeți aleatori, deci
 * nu poate fi ghicit. Răspunsul nu se pune niciodată în cache, fiind un
 * document cu date personale.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const contract = await db.contract.findUnique({ where: { token } });

  if (!contract || contract.status !== "SIGNED" || !contract.pdfPath) {
    return NextResponse.json(
      { error: "Contractul nu e disponibil." },
      { status: 404 },
    );
  }

  return new NextResponse(await citestePdf(contract.pdfPath), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
        numeDescarcare(contract.number, contract.type),
      )}`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
