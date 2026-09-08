import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { citestePdf, numeDescarcare } from "@/lib/contracts";

/** GET — psihologul descarcă un contract din arhivă. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  const { id } = await params;
  const contract = await db.contract.findUnique({ where: { id } });

  if (!contract?.pdfPath) {
    return NextResponse.json({ error: "Contractul nu e semnat." }, { status: 404 });
  }

  return new NextResponse(await citestePdf(contract.pdfPath), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
        numeDescarcare(contract.number, contract.type),
      )}`,
      "Cache-Control": "private, no-store",
    },
  });
}
