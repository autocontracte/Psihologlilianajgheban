import "server-only";

import { db } from "@/lib/db";
import {
  caleEvenimente,
  evenimentDinProgramare,
  google,
  googleActiv,
  GoogleError,
} from "@/lib/googleCalendar";
import { emailProgramareMutata, emailStatusProgramare } from "@/lib/emailProgramari";
import { BOOKING_HORIZON_DAYS } from "@/lib/slots";
import { addMinutes, zonedToUtc } from "@/lib/tz";

/* ----------------------------------------------------------------------------
   Sincronizarea în ambele sensuri între site și Google Calendar.

   Site → Google: fiecare programare activă are un eveniment în calendarul
   Lilianei, actualizat la fiecare schimbare și șters la anulare.

   Google → site: la câteva minute se citește calendarul.
     - Evenimentele puse direct în Google ocupă orele pe site (CalendarBlock).
     - Dacă o ședință venită de pe site e mutată în Google, programarea se mută
       și clientul e anunțat; dacă e ștearsă, programarea se anulează.

   Nicio eroare de aici nu trebuie să strice o programare: Google poate fi
   indisponibil, iar sincronizarea următoare repară ce a rămas în urmă.
   -------------------------------------------------------------------------- */

const ACTIVE = ["PENDING", "CONFIRMED", "COMPLETED"];

type EvenimentGoogle = {
  id: string;
  status?: string;
  summary?: string;
  transparency?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  attendees?: { self?: boolean; responseStatus?: string }[];
  extendedProperties?: { private?: Record<string, string> };
};

function lipsesteEvenimentul(err: unknown): boolean {
  return err instanceof GoogleError && (err.status === 404 || err.status === 410);
}

/** Aduce evenimentul din Google la zi cu programarea. Nu aruncă niciodată. */
export async function sincronizeazaProgramarea(appointmentId: string): Promise<void> {
  if (!googleActiv) return;

  try {
    const p = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true, user: true },
    });
    if (!p) return;

    if (!ACTIVE.includes(p.status)) {
      if (p.googleEventId) {
        await stergeEvenimentul(p.googleEventId);
        await db.appointment.update({ where: { id: p.id }, data: { googleEventId: null } });
      }
      return;
    }

    const body = evenimentDinProgramare(p);

    if (p.googleEventId) {
      try {
        await google(caleEvenimente(p.googleEventId), { method: "PATCH", body });
        return;
      } catch (err) {
        // Evenimentul a dispărut între timp — îl refacem mai jos
        if (!lipsesteEvenimentul(err)) throw err;
      }
    }

    const creat = await google<{ id: string }>(caleEvenimente(), { method: "POST", body });
    await db.appointment.update({ where: { id: p.id }, data: { googleEventId: creat.id } });
  } catch (err) {
    console.error("[calendar] sincronizare programare esuata", appointmentId, err);
  }
}

/** Șterge un eveniment; dacă nu mai există, e deja ce voiam. */
export async function stergeEvenimentul(eventId: string): Promise<void> {
  if (!googleActiv) return;
  try {
    await google(caleEvenimente(eventId), { method: "DELETE" });
  } catch (err) {
    if (!lipsesteEvenimentul(err)) {
      console.error("[calendar] stergere esuata", eventId, err);
    }
  }
}

/**
 * Verificare de ultim moment, chiar înainte de a salva o programare: e liberă
 * ora și în Google? Acoperă evenimentele adăugate în ultimele minute, încă
 * neajunse pe site. Dacă Google nu răspunde, nu blocăm programarea.
 */
export async function ocupatInGoogle(startsAt: Date, endsAt: Date): Promise<boolean> {
  if (!googleActiv) return false;
  try {
    const cal = process.env.GOOGLE_CALENDAR_ID!;
    const res = await google<{ calendars: Record<string, { busy: unknown[] }> }>(
      "/freeBusy",
      {
        method: "POST",
        body: {
          timeMin: startsAt.toISOString(),
          timeMax: endsAt.toISOString(),
          items: [{ id: cal }],
        },
      },
    );
    return (res.calendars[cal]?.busy.length ?? 0) > 0;
  } catch (err) {
    console.error("[calendar] freeBusy esuat", err);
    return false;
  }
}

/* ------------------------------------------------------------- Google → site */

function intervalul(ev: EvenimentGoogle): { start: Date; end: Date; allDay: boolean } | null {
  if (ev.start?.dateTime && ev.end?.dateTime) {
    return { start: new Date(ev.start.dateTime), end: new Date(ev.end.dateTime), allDay: false };
  }
  // Evenimentele pe toată ziua au doar data; ziua de final nu e inclusă
  if (ev.start?.date && ev.end?.date) {
    return {
      start: zonedToUtc(ev.start.date, "00:00"),
      end: zonedToUtc(ev.end.date, "00:00"),
      allDay: true,
    };
  }
  return null;
}

async function toateEvenimentele(timeMin: Date, timeMax: Date): Promise<EvenimentGoogle[]> {
  const out: EvenimentGoogle[] = [];
  let pageToken: string | undefined;

  do {
    const res = await google<{ items?: EvenimentGoogle[]; nextPageToken?: string }>(
      caleEvenimente(),
      {
        query: {
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          singleEvents: "true",
          maxResults: "2500",
          ...(pageToken ? { pageToken } : {}),
        },
      },
    );
    out.push(...(res.items ?? []));
    pageToken = res.nextPageToken;
  } while (pageToken);

  return out;
}

let ruleaza = false;

export type RezultatSincronizare = {
  ok: boolean;
  evenimenteExterne?: number;
  mutate?: number;
  anulate?: number;
  trimise?: number;
  eroare?: string;
};

/** O trecere completă de sincronizare. Rulează periodic și la cerere. */
export async function sincronizeazaDinGoogle(): Promise<RezultatSincronizare> {
  if (!googleActiv) return { ok: false, eroare: "Google Calendar nu este configurat." };
  if (ruleaza) return { ok: true };
  ruleaza = true;

  const rezultat = { ok: true, evenimenteExterne: 0, mutate: 0, anulate: 0, trimise: 0 };
  await db.calendarSync.upsert({
    where: { id: "google" },
    create: { id: "google", lastRunAt: new Date() },
    update: { lastRunAt: new Date() },
  });

  try {
    const timeMin = addMinutes(new Date(), -24 * 60);
    const timeMax = addMinutes(new Date(), (BOOKING_HORIZON_DAYS + 7) * 24 * 60);

    /* Dacă lista nu poate fi citită, ne oprim aici: fără ea nu putem ști ce
       s-a șters, iar o listă goală ar anula pe nedrept programările. */
    const evenimente = await toateEvenimentele(timeMin, timeMax);

    const vazuteLegate = new Set<string>();
    const externe: { googleEventId: string; title: string; start: Date; end: Date; allDay: boolean }[] = [];

    for (const ev of evenimente) {
      if (ev.status === "cancelled") continue;
      const interval = intervalul(ev);
      if (!interval) continue;

      const appointmentId = ev.extendedProperties?.private?.appointmentId;

      if (appointmentId) {
        vazuteLegate.add(ev.id);
        const p = await db.appointment.findUnique({
          where: { id: appointmentId },
          include: { service: true, user: true },
        });

        /* Un id necunoscut îl lăsăm în pace (poate veni dintr-o copie de test a
           site-ului legată din greșeală de același calendar). Ștergerea unei
           programări din panou își șterge singură evenimentul. */
        if (!p) continue;

        // Anulată pe site, dar evenimentul a rămas (Google nu a răspuns atunci)
        if (!ACTIVE.includes(p.status)) {
          await stergeEvenimentul(ev.id);
          continue;
        }

        if (p.googleEventId !== ev.id) {
          await db.appointment.update({ where: { id: p.id }, data: { googleEventId: ev.id } });
        }

        const mutata =
          p.startsAt.getTime() !== interval.start.getTime() ||
          p.endsAt.getTime() !== interval.end.getTime();

        if (mutata && !interval.allDay && p.status !== "COMPLETED") {
          const actualizata = await db.appointment.update({
            where: { id: p.id },
            data: {
              startsAt: interval.start,
              endsAt: interval.end,
              calendarSeq: { increment: 1 },
            },
            include: { service: true, user: true },
          });
          rezultat.mutate++;
          console.log("[calendar] programare mutata din Google", p.id);
          await emailProgramareMutata(actualizata);
        }
        continue;
      }

      // Evenimentele marcate „Liber” și invitațiile refuzate nu ocupă ora
      if (ev.transparency === "transparent") continue;
      if (ev.attendees?.some((a) => a.self && a.responseStatus === "declined")) continue;

      externe.push({
        googleEventId: ev.id,
        title: ev.summary?.trim() || "Ocupat",
        start: interval.start,
        end: interval.end,
        allDay: interval.allDay,
      });
    }

    /* Tabela de blocări se reface integral din ce e acum în Google, deci și
       ștergerile sau mutările făcute acolo ajung pe site. */
    await db.$transaction([
      db.calendarBlock.deleteMany({
        where: { googleEventId: { notIn: externe.map((e) => e.googleEventId) } },
      }),
      ...externe.map((e) =>
        db.calendarBlock.upsert({
          where: { googleEventId: e.googleEventId },
          create: {
            googleEventId: e.googleEventId,
            title: e.title,
            startsAt: e.start,
            endsAt: e.end,
            allDay: e.allDay,
          },
          update: { title: e.title, startsAt: e.start, endsAt: e.end, allDay: e.allDay },
        }),
      ),
    ]);
    rezultat.evenimenteExterne = externe.length;

    /* Ședințele legate de un eveniment care nu a mai apărut în listă: fie au
       fost mutate în afara intervalului citit, fie șterse. Întrebăm direct. */
    const lipsa = await db.appointment.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        googleEventId: { not: null, notIn: [...vazuteLegate] },
        startsAt: { gte: timeMin, lte: timeMax },
      },
      include: { service: true, user: true },
    });

    for (const p of lipsa) {
      try {
        const ev = await google<EvenimentGoogle>(caleEvenimente(p.googleEventId!));
        const interval = ev.status === "cancelled" ? null : intervalul(ev);
        if (interval) {
          const mutata =
            !interval.allDay &&
            (p.startsAt.getTime() !== interval.start.getTime() ||
              p.endsAt.getTime() !== interval.end.getTime());
          if (mutata) {
            const actualizata = await db.appointment.update({
              where: { id: p.id },
              data: { startsAt: interval.start, endsAt: interval.end, calendarSeq: { increment: 1 } },
              include: { service: true, user: true },
            });
            rezultat.mutate++;
            await emailProgramareMutata(actualizata);
          }
          // Evenimentul există — sub nicio formă nu anulăm programarea
          continue;
        }
      } catch (err) {
        if (!lipsesteEvenimentul(err)) throw err;
      }

      // Șters din Google → programarea se anulează și clientul află
      const anulata = await db.appointment.update({
        where: { id: p.id },
        data: { status: "CANCELLED", googleEventId: null, calendarSeq: { increment: 1 } },
        include: { service: true, user: true },
      });
      rezultat.anulate++;
      console.log("[calendar] programare anulata din Google", p.id);
      await emailStatusProgramare(anulata, "CANCELLED");
    }

    /* Site → Google: programările încă netrimise (create cât timp Google nu
       răspundea sau înainte de conectarea calendarului). */
    const netrimise = await db.appointment.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        googleEventId: null,
        endsAt: { gte: timeMin },
      },
      select: { id: true },
    });
    for (const { id } of netrimise) {
      await sincronizeazaProgramarea(id);
      rezultat.trimise++;
    }

    await db.calendarSync.update({
      where: { id: "google" },
      data: { lastOkAt: new Date(), lastError: null },
    });
    return rezultat;
  } catch (err) {
    const eroare = err instanceof Error ? err.message : String(err);
    console.error("[calendar] sincronizare esuata", err);
    await db.calendarSync.update({
      where: { id: "google" },
      data: { lastError: eroare.slice(0, 500) },
    });
    return { ok: false, eroare };
  } finally {
    ruleaza = false;
  }
}
