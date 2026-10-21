import "server-only";

import { db } from "@/lib/db";
import { clientOf } from "@/lib/appointments";
import {
  intervalul,
  ocupatInGoogle,
  sincronizeazaProgramarea,
  toateEvenimentele,
} from "@/lib/calendarSync";
import { caleEvenimente, google, googleActiv } from "@/lib/googleCalendar";
import { TZ, toDateStr, toTimeStr, todayStr, zonedToUtc } from "@/lib/tz";
import { isFormat, type Format, type Status } from "@/lib/types";
import {
  addDays,
  minToTime,
  mondayOf,
  timeToMin,
  validDate,
  type Ev,
  type LunaCal,
} from "@/lib/calendarTelefon";

/* ----------------------------------------------------------------------------
   Calendarul Lilianei: programările clienților de pe site și tot ce e în
   Google Calendar-ul ei, pentru cele 6 săptămâni ale vederii pe lună.

   Evenimentele din Google se citesc pe loc, pentru toată luna (și cele
   trecute). Dacă Google nu răspunde, se folosesc blocările păstrate la ultima
   sincronizare, ca aplicația să meargă oricum.
   -------------------------------------------------------------------------- */

export class CalendarError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

function minute(d: Date): number {
  return timeToMin(toTimeStr(d));
}

/** Un interval din Google, tăiat pe zilele din vedere (unul pe zi). */
function peZile(
  base: { id: string; title: string; link: string | null; free: boolean },
  start: Date,
  end: Date,
  allDay: boolean,
  from: string,
  to: string,
): Ev[] {
  const out: Ev[] = [];
  const d0 = toDateStr(start);
  // ziua de final a unui eveniment pe toată ziua nu e inclusă
  const d1 = allDay ? addDays(toDateStr(end), -1) : toDateStr(new Date(end.getTime() - 1));
  for (let d = d0 < from ? from : d0; d <= d1 && d <= to; d = addDays(d, 1)) {
    const whole = allDay || (d !== d0 && d !== d1);
    out.push({
      kind: "google",
      ...base,
      id: `${base.id}:${d}`,
      date: d,
      allDay: whole,
      start: whole || d !== d0 ? 0 : minute(start),
      end: whole || d !== d1 ? 24 * 60 : minute(end) || 24 * 60,
    });
  }
  return out;
}

export async function lunaCalendar(anyDay: string): Promise<LunaCal> {
  const today = todayStr();
  const day = validDate(anyDay) ? anyDay : today;
  const month = `${day.slice(0, 7)}-01`;
  const start = mondayOf(month);
  const end = addDays(start, 41);
  const t0 = zonedToUtc(start, "00:00");
  const t1 = zonedToUtc(addDays(end, 1), "00:00");

  const [rows, services] = await Promise.all([
    db.appointment.findMany({
      where: {
        startsAt: { gte: t0, lt: t1 },
        status: { not: "CANCELLED" },
        // plățile online lăsate neterminate n-au fost programări reale
        NOT: { paymentMethod: "ONLINE", status: "PENDING", holdExpiresAt: { lt: new Date() } },
      },
      include: { service: true, user: true, payments: true },
      orderBy: { startsAt: "asc" },
    }),
    db.service.findMany({ where: { active: true }, orderBy: { position: "asc" } }),
  ]);

  const events: Ev[] = rows.map((r) => {
    const client = clientOf(r);
    return {
      kind: "prog",
      id: r.id,
      date: toDateStr(r.startsAt),
      start: minute(r.startsAt),
      end: minute(r.endsAt) || 24 * 60,
      allDay: false,
      title: client.name,
      status: r.status as Status,
      format: (isFormat(r.format) ? r.format : "CABINET") as Format,
      service: r.service.name,
      client,
      notes: r.notes,
      adminNote: r.adminNote,
      paymentMethod: r.paymentMethod,
      paid: r.payments.some((p) => p.status === "PAID"),
    };
  });

  let eroare: string | null = null;
  let dinGoogle = false;
  if (googleActiv) {
    try {
      for (const ev of await toateEvenimentele(t0, t1)) {
        if (ev.status === "cancelled") continue;
        // ședințele de pe site au deja rândul lor, din baza de date
        if (ev.extendedProperties?.private?.appointmentId) continue;
        if (ev.attendees?.some((a) => a.self && a.responseStatus === "declined")) continue;
        const iv = intervalul(ev);
        if (!iv) continue;
        events.push(
          ...peZile(
            { id: ev.id, title: ev.summary?.trim() || "Ocupat", link: ev.htmlLink ?? null, free: ev.transparency === "transparent" },
            iv.start,
            iv.end,
            iv.allDay,
            start,
            end,
          ),
        );
      }
      dinGoogle = true;
    } catch (err) {
      console.error("[calendar] citirea lunii din Google a esuat", err);
      eroare = "Google Calendar nu a răspuns; se văd evenimentele de la ultima sincronizare.";
    }
  }
  // fără răspuns de la Google: blocările păstrate la ultima sincronizare
  if (!dinGoogle) {
    const blocuri = await db.calendarBlock.findMany({ where: { startsAt: { lt: t1 }, endsAt: { gt: t0 } } });
    for (const b of blocuri) {
      events.push(...peZile({ id: b.googleEventId, title: b.title, link: null, free: false }, b.startsAt, b.endsAt, b.allDay, start, end));
    }
  }

  events.sort((a, b) => a.date.localeCompare(b.date) || Number(b.allDay) - Number(a.allDay) || a.start - b.start);

  return {
    month,
    start,
    end,
    today,
    events,
    services: services.map((s) => ({ id: s.id, name: s.name, duration: s.duration })),
    google: { activ: googleActiv, eroare },
  };
}

/* ------------------------------------------------------------ Adăugare */

function interval(date: unknown, start: unknown, end: unknown): { startsAt: Date; endsAt: Date } {
  const a = Number(start);
  const b = Number(end);
  if (!validDate(date) || !Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b > 24 * 60 || b <= a || a % 5 || b % 5) {
    throw new CalendarError("Data sau orele nu sunt valide.");
  }
  return { startsAt: zonedToUtc(date, minToTime(a)), endsAt: zonedToUtc(date, minToTime(b)) };
}

function text(v: unknown, max: number): string {
  return String(v ?? "").trim().slice(0, max);
}

/**
 * Liliana pune ea o programare pentru un client (la telefon, la cabinet).
 * Intră direct confirmată și ajunge în Google Calendar ca orice programare.
 */
export async function creeazaProgramare(b: Record<string, unknown>) {
  const name = text(b.name, 120);
  const phone = text(b.phone, 40);
  const email = text(b.email, 160).toLowerCase();
  if (!name) throw new CalendarError("Scrie numele clientului.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new CalendarError("Adresa de email nu pare corectă.");
  const service = await db.service.findUnique({ where: { id: String(b.serviceId ?? "") } });
  if (!service) throw new CalendarError("Alege serviciul.");
  const format = isFormat(b.format) ? b.format : "CABINET";
  const { startsAt, endsAt } = interval(b.date, b.start, b.end);

  const suprapusa = await db.appointment.findFirst({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
      NOT: { paymentMethod: "ONLINE", status: "PENDING", holdExpiresAt: { lt: new Date() } },
    },
    include: { user: true },
  });
  if (suprapusa) {
    throw new CalendarError(
      `Ora se suprapune cu o programare: ${clientOf(suprapusa).name}, ${toTimeStr(suprapusa.startsAt)}–${toTimeStr(suprapusa.endsAt)}.`,
      409,
    );
  }
  if (b.force !== true && (await ocupatInGoogle(startsAt, endsAt))) {
    throw new CalendarError("În Google Calendar ai deja ceva la ora asta.", 409);
  }

  // un client care are deja cont primește programarea în contul lui
  const user = email ? await db.user.findUnique({ where: { email } }) : null;
  const p = await db.appointment.create({
    data: {
      ...(user ? { userId: user.id } : { guestName: name, guestPhone: phone || null, guestEmail: email || null }),
      serviceId: service.id,
      startsAt,
      endsAt,
      format,
      status: "CONFIRMED",
      paymentMethod: "CABINET",
      adminNote: text(b.note, 2000) || null,
    },
  });
  await sincronizeazaProgramarea(p.id);
  return { id: p.id };
}

/** Un eveniment al Lilianei, scris direct în Google Calendar (ocupă ora pe site). */
export async function creeazaEveniment(b: Record<string, unknown>) {
  if (!googleActiv) throw new CalendarError("Google Calendar nu este conectat pe server.", 503);
  const title = text(b.title, 200) || "Ocupat";
  const allDay = b.allDay === true;
  if (!validDate(b.date)) throw new CalendarError("Data nu e validă.");
  const date = b.date;

  const { startsAt, endsAt } = allDay
    ? { startsAt: zonedToUtc(date, "00:00"), endsAt: zonedToUtc(addDays(date, 1), "00:00") }
    : interval(date, b.start, b.end);
  const description = text(b.note, 2000) || undefined;
  const body = allDay
    ? { summary: title, description, start: { date }, end: { date: addDays(date, 1) } }
    : {
        summary: title,
        description,
        start: { dateTime: startsAt.toISOString(), timeZone: TZ },
        end: { dateTime: endsAt.toISOString(), timeZone: TZ },
      };

  const creat = await google<{ id: string }>(caleEvenimente(), { method: "POST", body });

  // ocupă ora pe site imediat, fără să aștepte sincronizarea de la 2 minute
  await db.calendarBlock
    .upsert({
      where: { googleEventId: creat.id },
      create: { googleEventId: creat.id, title, startsAt, endsAt, allDay },
      update: { title, startsAt, endsAt, allDay },
    })
    .catch(() => {});
  return { id: creat.id };
}

/** Șterge un eveniment pus de Liliana în Google (nu o programare de pe site). */
export async function stergeEveniment(id: string) {
  if (!googleActiv) throw new CalendarError("Google Calendar nu este conectat pe server.", 503);
  const ev = await google<{ extendedProperties?: { private?: Record<string, string> } }>(caleEvenimente(id));
  if (ev.extendedProperties?.private?.appointmentId) {
    throw new CalendarError("Programările clienților se anulează din programare, nu de aici.");
  }
  await google(caleEvenimente(id), { method: "DELETE" });
  await db.calendarBlock.deleteMany({ where: { googleEventId: id } });
  return { ok: true };
}

