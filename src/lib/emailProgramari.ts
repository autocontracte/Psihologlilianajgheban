import "server-only";

import { clientOf } from "@/lib/appointments";
import { CABINET_EMAIL, trimiteEmail } from "@/lib/email";
import { invitatieIcs, linkuriCalendar } from "@/lib/ics";
import { formatDateLong, formatTime } from "@/lib/tz";
import { FORMAT_LABEL, isFormat } from "@/lib/types";

/* ----------------------------------------------------------------------------
   Emailurile legate de programări.

   Fiecare email către client are atașată o invitație de calendar (.ics) cu
   același identificator: Gmail, Outlook sau Apple Mail o adaugă în calendar,
   iar confirmarea, mutarea sau anularea ulterioară actualizează același
   eveniment, în loc să creeze unul nou.
   -------------------------------------------------------------------------- */

type Programare = Parameters<typeof clientOf>[0] & {
  id: string;
  startsAt: Date;
  endsAt: Date;
  format: string;
  status: string;
  notes: string | null;
  paymentMethod: string;
  calendarSeq: number;
  updatedAt: Date;
  service: { name: string };
};

const SEMNATURA = "\n\nCu drag,\nLiliana Jgheban\nPsiholog";

function cand(p: Programare): string {
  return `${formatDateLong(p.startsAt)}, ora ${formatTime(p.startsAt)}`;
}

function formatul(p: Programare): string {
  return isFormat(p.format) ? FORMAT_LABEL[p.format] : p.format;
}

function plata(p: Programare): string {
  return p.paymentMethod === "ONLINE" ? "Plătită online" : "Plata la cabinet";
}

function deAdaugatInCalendar(p: Programare): string {
  const linkuri = linkuriCalendar(p);
  if (!linkuri) return "";
  return (
    `\n\nO pui în calendar cu un clic (dacă nu s-a adăugat singură):\n` +
    `Google Calendar: ${linkuri.google}\n` +
    `Apple, Outlook sau alt calendar: ${linkuri.ics}`
  );
}

function catreClient(
  p: Programare,
  subject: string,
  text: string,
  method: "REQUEST" | "CANCEL",
) {
  const client = clientOf(p);
  return trimiteEmail({
    to: client.email,
    replyTo: CABINET_EMAIL || undefined,
    subject,
    text,
    ical: { method, content: invitatieIcs(p, method, { name: client.name, email: client.email }) },
  });
}

function detalii(p: Programare): string {
  return `${p.service.name}\n${cand(p)}\n${formatul(p)} · ${plata(p)}`;
}

/** Programare nouă cu plata la cabinet: cererea așteaptă confirmarea Lilianei. */
export async function emailProgramareNoua(p: Programare): Promise<void> {
  const client = clientOf(p);

  await Promise.all([
    catreClient(
      p,
      `Am primit cererea de programare — ${cand(p)}`,
      `Bună, ${client.name},\n\n` +
        `Am primit cererea ta de programare:\n\n${detalii(p)}\n\n` +
        `Programarea nu e încă confirmată. Îți scriu din nou imediat ce o confirm.` +
        deAdaugatInCalendar(p) +
        SEMNATURA,
      "REQUEST",
    ),
    trimiteEmail({
      to: CABINET_EMAIL,
      replyTo: client.email || undefined,
      subject: `Programare nouă: ${client.name} — ${cand(p)}`,
      text:
        `${detalii(p)}\n\n` +
        `Client: ${client.name}${client.hasAccount ? "" : " (fără cont)"}\n` +
        `Email: ${client.email}\nTelefon: ${client.phone || "-"}\n` +
        (p.notes ? `\nMesaj:\n${p.notes}\n` : "") +
        `\nConfirm-o din panoul de administrare.`,
    }),
  ]);
}

/** Plata online a reușit: programarea e confirmată automat. */
export async function emailProgramarePlatita(p: Programare): Promise<void> {
  const client = clientOf(p);

  await Promise.all([
    catreClient(
      p,
      `Programare confirmată — ${cand(p)}`,
      `Bună, ${client.name},\n\n` +
        `Plata a fost primită, iar programarea ta e confirmată:\n\n${detalii(p)}\n\n` +
        `Dacă nu mai poți ajunge, te rog să-mi dai de știre din timp, răspunzând la acest email.` +
        deAdaugatInCalendar(p) +
        SEMNATURA,
      "REQUEST",
    ),
    trimiteEmail({
      to: CABINET_EMAIL,
      replyTo: client.email || undefined,
      subject: `Programare nouă, plătită online: ${client.name} — ${cand(p)}`,
      text:
        `${detalii(p)}\n\n` +
        `Client: ${client.name}${client.hasAccount ? "" : " (fără cont)"}\n` +
        `Email: ${client.email}\nTelefon: ${client.phone || "-"}\n` +
        (p.notes ? `\nMesaj:\n${p.notes}\n` : "") +
        `\nE deja confirmată și apare în Google Calendar.`,
    }),
  ]);
}

/** Cabinetul a schimbat statusul: clientul află doar de confirmare sau anulare. */
export async function emailStatusProgramare(p: Programare, status: string): Promise<void> {
  const client = clientOf(p);

  if (status === "CONFIRMED") {
    await catreClient(
      p,
      `Programare confirmată — ${cand(p)}`,
      `Bună, ${client.name},\n\n` +
        `Programarea ta e confirmată:\n\n${detalii(p)}\n\n` +
        `Dacă nu mai poți ajunge, te rog să-mi dai de știre din timp, răspunzând la acest email.` +
        deAdaugatInCalendar(p) +
        SEMNATURA,
      "REQUEST",
    );
  } else if (status === "CANCELLED") {
    await catreClient(
      p,
      `Programare anulată — ${cand(p)}`,
      `Bună, ${client.name},\n\n` +
        `Programarea de ${cand(p)} (${p.service.name}) a fost anulată` +
        ` și a fost scoasă din calendarul tău.\n\n` +
        `Dacă vrei să alegem altă zi, răspunde la acest email sau fă o programare nouă pe site.` +
        SEMNATURA,
      "CANCEL",
    );
  }
}

/** Liliana a mutat ședința în Google Calendar: clientul primește noua oră. */
export async function emailProgramareMutata(p: Programare): Promise<void> {
  const client = clientOf(p);

  await catreClient(
    p,
    `Programare mutată — ${cand(p)}`,
    `Bună, ${client.name},\n\n` +
      `Ședința ta a fost mutată. Noua programare:\n\n${detalii(p)}\n\n` +
      `Evenimentul din calendarul tău se actualizează singur. Dacă noua oră nu ` +
      `îți convine, răspunde la acest email și găsim alta.` +
      SEMNATURA,
    "REQUEST",
  );
}

/** Clientul și-a anulat singur programarea din cont. */
export async function emailAnulareDeClient(p: Programare): Promise<void> {
  const client = clientOf(p);

  await Promise.all([
    catreClient(
      p,
      `Ai anulat programarea — ${cand(p)}`,
      `Bună, ${client.name},\n\n` +
        `Am primit anularea programării de ${cand(p)} (${p.service.name}). ` +
        `A fost scoasă și din calendarul tău.` +
        (p.paymentMethod === "ONLINE"
          ? `\n\nPentru ședința plătită online, te contactez pentru rambursare sau reprogramare.`
          : "") +
        SEMNATURA,
      "CANCEL",
    ),
    trimiteEmail({
      to: CABINET_EMAIL,
      replyTo: client.email || undefined,
      subject: `Programare anulată de client: ${client.name} — ${cand(p)}`,
      text:
        `${detalii(p)}\n\n` +
        `Client: ${client.name}\nEmail: ${client.email}\nTelefon: ${client.phone || "-"}\n\n` +
        `Ora a fost eliberată pe site și ședința a fost scoasă din Google Calendar.`,
    }),
  ]);
}
