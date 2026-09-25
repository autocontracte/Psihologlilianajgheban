import { db } from "@/lib/db";
import { abonamentIcs, semnaturaValida } from "@/lib/ics";
import { SITE } from "@/content/site";

/* ----------------------------------------------------------------------------
   Abonamentul de calendar al unui client: toate ședințele contului, într-un
   link permanent de forma /api/calendar/feed/<userId>.<semnătură>.ics.

   Calendarul clientului (Google, Apple, Outlook) îl reîmprospătează singur,
   deci ședințele noi, mutate sau anulate apar fără să facă nimic.
   -------------------------------------------------------------------------- */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const [userId, sig] = file.replace(/\.ics$/, "").split(".");

  if (!userId || !sig || !semnaturaValida("feed", userId, sig)) {
    return new Response("Link invalid.", { status: 404 });
  }

  // Ultimele trei luni și tot ce urmează — destul cât să vadă istoricul recent
  const dela = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const programari = await db.appointment.findMany({
    where: {
      userId,
      startsAt: { gte: dela },
      /* Plățile online neterminate (sau abandonate) n-au fost niciodată
         programări; cele plătite au trecut prin confirmare, deci seq > 0. */
      NOT: { paymentMethod: "ONLINE", calendarSeq: 0 },
    },
    include: { service: true },
    orderBy: { startsAt: "asc" },
  });

  return new Response(abonamentIcs(programari, `Ședințe — ${SITE.name}`), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="sedinte.ics"',
      "Cache-Control": "no-store",
    },
  });
}
