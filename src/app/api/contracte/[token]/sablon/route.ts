import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { db } from "@/lib/db";
import { SABLOANE, esteTip } from "@/lib/contracts";

/**
 * GET — contractul nesemnat, ca omul să-l poată citi înainte să semneze.
 *
 * Nu conține date personale: e chiar șablonul gol. Se cere totuși un token
 * valid, ca să nu ajungă documentul cabinetului la indexare.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const contract = await db.contract.findUnique({
    where: { token },
    select: { type: true },
  });

  if (!contract || !esteTip(contract.type)) {
    return NextResponse.json({ error: "Contractul nu există." }, { status: 404 });
  }

  const bytes = await readFile(
    join(process.cwd(), "contracte", "sabloane", SABLOANE[contract.type].fisier),
  );

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=\"contract.pdf\"",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
