import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getComanda } from "@/lib/kit";
import { dateParte } from "@/lib/ghid/comanda";
import { caleParte } from "@/lib/ghid/pdf";

/** GET — descarcă ghidul PDF din kit. Doar după ce comanda e plătită. */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const comanda = await getComanda(token);
  if (!comanda || comanda.status !== "PAID") {
    return NextResponse.json({ error: "Ghidul nu e disponibil." }, { status: 403 });
  }

  const pe = dateParte(comanda);
  if (pe) {
    const bytes = await readFile(caleParte(pe.parte));
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(pe.parte.fisier.replace(".pdf", "-Liliana-Jgheban.pdf"))}`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  const bytes = await readFile(join(process.cwd(), "ghiduri", "ghid-divort.pdf"));
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename*=UTF-8''Ghid-Cum-stai-de-fapt-cu-relatia-ta-Liliana-Jgheban.pdf",
      "Cache-Control": "private, no-store",
    },
  });
}
