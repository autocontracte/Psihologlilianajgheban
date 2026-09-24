import "server-only";

import { clientOf } from "@/lib/appointments";
import { CABINET_EMAIL, trimiteEmail } from "@/lib/email";
import { formatDateLong, formatTime } from "@/lib/tz";
import { FORMAT_LABEL, isFormat } from "@/lib/types";

/* ----------------------------------------------------------------------------
   Emailurile legate de programări: la creare (clientului și cabinetului) și
   când cabinetul confirmă sau anulează.
   -------------------------------------------------------------------------- */

type Programare = Parameters<typeof clientOf>[0] & {
  startsAt: Date;
  format: string;
  notes: string | null;
  service: { name: string };
};

const SEMNATURA = "\n\nCu drag,\nLiliana Jgheban\nPsiholog";

function cand(p: Programare): string {
  return `${formatDateLong(p.startsAt)}, ora ${formatTime(p.startsAt)}`;
}

function formatul(p: Programare): string {
  return isFormat(p.format) ? FORMAT_LABEL[p.format] : p.format;
}

/** O programare nouă: confirmare de primire pentru client, înștiințare pentru cabinet. */
export async function emailProgramareNoua(p: Programare): Promise<void> {
  const client = clientOf(p);

  await Promise.all([
    trimiteEmail({
      to: client.email,
      replyTo: CABINET_EMAIL || undefined,
      subject: `Am primit cererea de programare — ${cand(p)}`,
      text:
        `Bună, ${client.name},\n\n` +
        `Am primit cererea ta de programare:\n\n` +
        `${p.service.name}\n${cand(p)}\n${formatul(p)}\n\n` +
        `Programarea nu e încă confirmată. Îți scriu din nou imediat ce o confirm.` +
        SEMNATURA,
    }),
    trimiteEmail({
      to: CABINET_EMAIL,
      replyTo: client.email || undefined,
      subject: `Programare nouă: ${client.name} — ${cand(p)}`,
      text:
        `${p.service.name}\n${cand(p)}\n${formatul(p)}\n\n` +
        `Client: ${client.name}${client.hasAccount ? "" : " (fără cont)"}\n` +
        `Email: ${client.email}\nTelefon: ${client.phone || "-"}\n` +
        (p.notes ? `\nMesaj:\n${p.notes}\n` : "") +
        `\nConfirm-o din panoul de administrare.`,
    }),
  ]);
}

/** Cabinetul a schimbat statusul: clientul află doar de confirmare sau anulare. */
export async function emailStatusProgramare(
  p: Programare,
  status: string,
): Promise<void> {
  const client = clientOf(p);

  if (status === "CONFIRMED") {
    await trimiteEmail({
      to: client.email,
      replyTo: CABINET_EMAIL || undefined,
      subject: `Programare confirmată — ${cand(p)}`,
      text:
        `Bună, ${client.name},\n\n` +
        `Programarea ta e confirmată:\n\n` +
        `${p.service.name}\n${cand(p)}\n${formatul(p)}\n\n` +
        `Dacă nu mai poți ajunge, te rog să-mi dai de știre din timp, ` +
        `răspunzând la acest email.` +
        SEMNATURA,
    });
  } else if (status === "CANCELLED") {
    await trimiteEmail({
      to: client.email,
      replyTo: CABINET_EMAIL || undefined,
      subject: `Programare anulată — ${cand(p)}`,
      text:
        `Bună, ${client.name},\n\n` +
        `Programarea de ${cand(p)} (${p.service.name}) a fost anulată.\n\n` +
        `Dacă vrei să alegem altă zi, răspunde la acest email sau fă o ` +
        `programare nouă pe site.` +
        SEMNATURA,
    });
  }
}
