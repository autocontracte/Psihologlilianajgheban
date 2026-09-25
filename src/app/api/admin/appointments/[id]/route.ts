import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isStatus } from "@/lib/types";
import { emailStatusProgramare } from "@/lib/emailProgramari";
import { sincronizeazaProgramarea, stergeEvenimentul } from "@/lib/calendarSync";

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

  const statusNou = data.status !== undefined && data.status !== existing.status;

  const updated = await db.appointment.update({
    where: { id },
    data: {
      ...data,
      // O confirmare sau anulare manuală încheie orice așteptare a plății
      ...(statusNou ? { calendarSeq: { increment: 1 }, holdExpiresAt: null } : {}),
    },
    include: { service: true, user: true },
  });

  // Evenimentul din Google se actualizează la orice schimbare (și nota internă apare acolo)
  await sincronizeazaProgramarea(id);

  // Clientul află doar când statusul chiar s-a schimbat, nu la fiecare notă internă
  if (statusNou) {
    await emailStatusProgramare(updated, updated.status);
  }

  return NextResponse.json({
    ok: true,
    appointment: { id: updated.id, status: updated.status, adminNote: updated.adminNote },
  });
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
  const existing = await db.appointment.findUnique({ where: { id } });
  if (existing?.googleEventId) await stergeEvenimentul(existing.googleEventId);

  await db.appointment.delete({ where: { id } }).catch(() => {});

  return NextResponse.json({ ok: true });
}
