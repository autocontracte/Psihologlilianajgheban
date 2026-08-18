import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/** GET — descarcă un document încărcat. Doar administratorul. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  const { id } = await params;
  const record = await db.briefFile.findUnique({ where: { id } });
  if (!record) {
    return NextResponse.json({ error: "Fișierul nu există." }, { status: 404 });
  }

  /* Numele de pe disc e generat de noi, deci nu poate ieși din folder. */
  const bytes = await readFile(join(process.cwd(), "uploads", record.storedAs));

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": record.mimeType,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(record.fileName)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
