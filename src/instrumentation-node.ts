import { sincronizeazaDinGoogle } from "@/lib/calendarSync";
import { elibereazaNeplatite } from "@/lib/plataProgramare";

/* ----------------------------------------------------------------------------
   Ceasul care, la fiecare două minute:
     - eliberează orele ținute pentru plăți online neterminate;
     - citește Google Calendar (ședințe mutate/șterse acolo, ore ocupate).

   Aplicația rulează într-un singur proces (pm2), deci nu e nevoie de cron.
   -------------------------------------------------------------------------- */

const INTERVAL_MS = 2 * 60_000;

const g = globalThis as { __ceasCalendar?: NodeJS.Timeout };

async function pas() {
  try {
    await elibereazaNeplatite();
    await sincronizeazaDinGoogle();
  } catch (err) {
    console.error("[ceas] eroare", err);
  }
}

if (!g.__ceasCalendar) {
  // Prima trecere puțin după pornire, ca serverul să fie deja gata
  setTimeout(pas, 15_000);
  g.__ceasCalendar = setInterval(pas, INTERVAL_MS);
}
