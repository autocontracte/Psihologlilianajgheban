import { db } from "@/lib/db";
import { fisierIcs, semnaturaValida } from "@/lib/ics";

/** GET — o singură ședință ca fișier .ics (Apple, Outlook sau orice calendar). */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const sig = new URL(request.url).searchParams.get("t") ?? "";

  if (!semnaturaValida("ics", id, sig)) {
    return new Response("Link invalid.", { status: 404 });
  }

  const p = await db.appointment.findUnique({
    where: { id },
    include: { service: true },
  });
  if (!p) return new Response("Programarea nu mai există.", { status: 404 });

  return new Response(fisierIcs(p), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="sedinta.ics"',
      "Cache-Control": "no-store",
    },
  });
}
