import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE } from "@/content/site";
import { FORMAT_LABEL, isFormat } from "@/lib/types";

/* ----------------------------------------------------------------------------
   Ședințele în calendarul clientului — orice calendar, nu doar Google.

   Formatul .ics (iCalendar) e înțeles de Google, Apple, Outlook, Proton etc.
   Îl folosim în trei feluri:
     - invitație atașată la email: Gmail și Outlook o adaugă cu un clic (sau
       singure), iar o actualizare/anulare trimisă ulterior o mută/șterge;
     - fișier de descărcat pentru o singură ședință;
     - abonament: un link permanent cu toate ședințele unui cont, pe care
       calendarul îl reîmprospătează singur.

   Linkurile conțin o semnătură HMAC, ca nimeni să nu poată ghici calendarul
   altcuiva doar schimbând un id în adresă.
   -------------------------------------------------------------------------- */

const SECRET = process.env.CALENDAR_SECRET ?? "";
const DOMAIN = new URL(SITE.url).hostname;

/* ---------------------------------------------------------------- semnături */

export function semneaza(tip: "ics" | "feed" | "renunta", id: string): string {
  return createHmac("sha256", SECRET).update(`${tip}:${id}`).digest("base64url").slice(0, 32);
}

export function semnaturaValida(tip: "ics" | "feed" | "renunta", id: string, sig: string): boolean {
  if (!SECRET || !sig) return false;
  const a = Buffer.from(semneaza(tip, id));
  const b = Buffer.from(sig);
  return a.length === b.length && timingSafeEqual(a, b);
}

/* -------------------------------------------------------------------- linkuri */

type PentruLink = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  format: string;
  service: { name: string };
};

function utc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function titlu(p: PentruLink): string {
  return `${p.service.name} — ${SITE.name}`;
}

function locatie(format: string): string {
  return format === "ONLINE" ? "Online (linkul îl primești pe email)" : `Cabinet, ${SITE.city}`;
}

function descriere(p: PentruLink): string {
  const format = isFormat(p.format) ? FORMAT_LABEL[p.format] : p.format;
  return [
    `${p.service.name} · ${format}`,
    p.format === "ONLINE" ? "" : SITE.addressNote,
    `Pentru schimbări: ${SITE.phone} sau ${SITE.url}/cont`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Linkurile „Adaugă în calendar” pentru o ședință. Null dacă lipsește secretul. */
export function linkuriCalendar(p: PentruLink): { google: string; ics: string } | null {
  if (!SECRET) return null;

  const google = new URL("https://calendar.google.com/calendar/render");
  google.searchParams.set("action", "TEMPLATE");
  google.searchParams.set("text", titlu(p));
  google.searchParams.set("dates", `${utc(p.startsAt)}/${utc(p.endsAt)}`);
  google.searchParams.set("details", descriere(p));
  google.searchParams.set("location", locatie(p.format));
  google.searchParams.set("ctz", "Europe/Bucharest");

  return {
    google: google.toString(),
    ics: `${SITE.url}/api/calendar/ics/${p.id}?t=${semneaza("ics", p.id)}`,
  };
}

/** Linkul de abonament pentru toate ședințele unui cont. */
export function linkAbonament(userId: string): string | null {
  if (!SECRET) return null;
  return `${SITE.url}/api/calendar/feed/${userId}.${semneaza("feed", userId)}.ics`;
}

/* ----------------------------------------------------------------- iCalendar */

export type PentruIcs = PentruLink & {
  status: string;
  calendarSeq: number;
  updatedAt: Date;
};

/** Textul se escapează după RFC 5545: \ ; , și rânduri noi. */
function text(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/* Rândurile mai lungi de 75 de octeți se împart, cu spațiu la început. Se
   numără octeți, nu caractere: diacriticele au câte doi. */
function pliaza(linie: string): string {
  const parti: string[] = [];
  let curent = "";
  let octeti = 0;
  for (const ch of linie) {
    const n = Buffer.byteLength(ch);
    if (octeti + n > (parti.length ? 74 : 75)) {
      parti.push(curent);
      curent = "";
      octeti = 0;
    }
    curent += ch;
    octeti += n;
  }
  parti.push(curent);
  return parti.join("\r\n ");
}

const STATUS_ICS: Record<string, string> = {
  PENDING: "TENTATIVE",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "CONFIRMED",
  CANCELLED: "CANCELLED",
};

function vevent(
  p: PentruIcs,
  opt: { method?: "REQUEST" | "CANCEL"; participant?: { name: string; email: string } },
): string[] {
  const anulata = opt.method === "CANCEL" || p.status === "CANCELLED";
  const lines = [
    "BEGIN:VEVENT",
    `UID:${p.id}@${DOMAIN}`,
    `SEQUENCE:${p.calendarSeq}`,
    `DTSTAMP:${utc(new Date())}`,
    `LAST-MODIFIED:${utc(p.updatedAt)}`,
    `DTSTART:${utc(p.startsAt)}`,
    `DTEND:${utc(p.endsAt)}`,
    `SUMMARY:${text((anulata ? "Anulată: " : p.status === "PENDING" ? "De confirmat: " : "") + titlu(p))}`,
    `DESCRIPTION:${text(descriere(p))}`,
    `LOCATION:${text(locatie(p.format))}`,
    `STATUS:${anulata ? "CANCELLED" : (STATUS_ICS[p.status] ?? "TENTATIVE")}`,
    `ORGANIZER;CN=${text(SITE.name)}:mailto:${SITE.email}`,
  ];

  if (opt.participant?.email) {
    lines.push(
      `ATTENDEE;CN=${text(opt.participant.name)};ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=FALSE:mailto:${opt.participant.email}`,
    );
  }

  if (!anulata) {
    // Memento cu o zi înainte și cu o oră înainte
    for (const cand of ["-P1D", "-PT1H"]) {
      lines.push(
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `DESCRIPTION:${text(titlu(p))}`,
        `TRIGGER:${cand}`,
        "END:VALARM",
      );
    }
  }

  lines.push("END:VEVENT");
  return lines;
}

function calendar(evenimente: string[][], extra: string[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${DOMAIN}//Programari//RO`,
    "CALSCALE:GREGORIAN",
    ...extra,
    ...evenimente.flat(),
    "END:VCALENDAR",
  ];
  return lines.map(pliaza).join("\r\n") + "\r\n";
}

/** Invitația atașată la email: REQUEST adaugă/actualizează, CANCEL șterge. */
export function invitatieIcs(
  p: PentruIcs,
  method: "REQUEST" | "CANCEL",
  participant: { name: string; email: string },
): string {
  return calendar([vevent(p, { method, participant })], [`METHOD:${method}`]);
}

/** O singură ședință, pentru descărcare. */
export function fisierIcs(p: PentruIcs): string {
  return calendar([vevent(p, {})], ["METHOD:PUBLISH"]);
}

/** Toate ședințele unui cont, pentru abonament. */
export function abonamentIcs(programari: PentruIcs[], numeCalendar: string): string {
  return calendar(programari.map((p) => vevent(p, {})), [
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${text(numeCalendar)}`,
    "X-WR-TIMEZONE:Europe/Bucharest",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
  ]);
}
