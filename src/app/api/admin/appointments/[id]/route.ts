import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isStatus } from "@/lib/types";

/** PATCH — administratorul schimbă statusul sau adaugă o notă internă. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const data: { status?: string; adminNote?: string | null } = {};

  if (body.status !== undefined) {
    if (!isStatus(body.status)) {
      return NextResponse.json({ error: "Status invalid." }, { status: 400 });
    }
    data.status = body.status;
  }

  if (body.adminNote !== undefined) {
    const note = String(body.adminNote).trim();
    if (note.length > 2000) {
      return NextResponse.json({ error: "Nota este prea lungă." }, { status: 400 });
    }
    data.adminNote = note || null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nimic de modificat." }, { status: 400 });
  }

  const existing = await db.appointment.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { error: "Programarea nu a fost găsită." },
      { status: 404 },
    );
  }

  const updated = await db.appointment.update({
    where: { id },
    data,
    include: { service: true, user: true },
  });

  /* TODO livrare — anunță clientul pe email când programarea e confirmată
     sau anulată. */

  return NextResponse.json({ ok: true, appointment: updated });
}

/** DELETE — șterge definitiv o programare. */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  const { id } = await params;
  await db.appointment.delete({ where: { id } }).catch(() => {});

  return NextResponse.json({ ok: true });
}
