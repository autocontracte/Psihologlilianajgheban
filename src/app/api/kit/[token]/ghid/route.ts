import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getComanda } from "@/lib/consiliere";

/** GET — descarcă ghidul PDF. Doar după ce comanda e plătită. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const comanda = await getComanda(token);
  if (!comanda || comanda.status !== "PAID") {
    return NextResponse.json({ error: "Ghidul nu e disponibil." }, { status: 403 });
  }

  const bytes = await readFile(join(process.cwd(), "ghiduri", "ghid-divort.pdf"));
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename*=UTF-8''Ghid-practic-despre-divort.pdf",
      "Cache-Control": "private, no-store",
    },
  });
}
