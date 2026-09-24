import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** GET /api/servicii — serviciile active, pentru programarea făcută din chatul cu Ana. */
export async function GET() {
  const servicii = await db.service.findMany({
    where: { active: true },
    orderBy: { position: "asc" },
    select: { id: true, name: true, duration: true, price: true },
  });
  return NextResponse.json({ servicii });
}
