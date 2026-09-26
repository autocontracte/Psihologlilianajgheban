import "server-only";

import { clientOf } from "@/lib/appointments";
import { CABINET_EMAIL, trimiteEmail } from "@/lib/email";
import { compuneEmail, type ContinutEmail } from "@/lib/emailSablon";
import { invitatieIcs, linkuriCalendar } from "@/lib/ics";
import { formatDateLong, formatTime } from "@/lib/tz";
import { FORMAT_LABEL, isFormat } from "@/lib/types";
import { SITE } from "@/content/site";

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

function cand(p: Programare): string {
  return `${formatDateLong(p.startsAt)}, ora ${formatTime(p.startsAt)}`;
}

function formatul(p: Programare): string {
  return isFormat(p.format) ? FORMAT_LABEL[p.format] : p.format;
}

function plata(p: Programare): string {
  return p.paymentMethod === "ONLINE" ? "Plătită online" : "Plata la cabinet";
}

/** Caseta cu datele ședinței, aceeași în toate emailurile. */
function detalii(p: Programare): NonNullable<ContinutEmail["detalii"]> {
  return [
    { eticheta: "Ședința", valoare: p.service.name },
    { eticheta: "Când", valoare: cand(p) },
    { eticheta: "Format", valoare: `${formatul(p)} · ${plata(p)}` },
    {
      eticheta: "Unde",
      valoare: p.format === "ONLINE" ? "Online, linkul îl primești pe email înainte de ședință" : SITE.address,
    },
  ];
}

/** Linkurile de adăugare în calendar, dacă invitația nu s-a adăugat singură. */
function deAdaugatInCalendar(p: Programare): Pick<ContinutEmail, "linkuri"> {
  const linkuri = linkuriCalendar(p);
  if (!linkuri) return {};
  return {
    linkuri: [
      { text: "Adaugă în Google Calendar", href: linkuri.google },
      { text: "Apple, Outlook sau alt calendar", href: linkuri.ics },
    ],
  };
}

function catreClient(
  p: Programare,
  subject: string,
  continut: ContinutEmail,
  method: "REQUEST" | "CANCEL",
) {
  const client = clientOf(p);
  return trimiteEmail({
    to: client.email,
    replyTo: CABINET_EMAIL || undefined,
    subject,
    ...compuneEmail({ salut: `Bună, ${client.name},`, semnatura: true, ...continut }),
    ical: { method, content: invitatieIcs(p, method, { name: client.name, email: client.email }) },
  });
}

/** Înștiințarea pentru cabinet: datele ședinței și ale clientului. */
function catreCabinet(p: Programare, subject: string, eticheta: string, titlu: string, incheiere: string) {
  const client = clientOf(p);
  return trimiteEmail({
    to: CABINET_EMAIL,
    replyTo: client.email || undefined,
    subject,
    ...compuneEmail({
      intern: true,
      eticheta,
      titlu,
      detalii: [
        ...detalii(p),
        { eticheta: "Client", valoare: `${client.name}${client.hasAccount ? "" : " (fără cont)"}` },
        { eticheta: "Email", valoare: client.email || "-" },
        { eticheta: "Telefon", valoare: client.phone || "-" },
      ],
      ...(p.notes ? { citat: { eticheta: "Mesajul clientului", text: p.notes } } : {}),
      dupaDetalii: [incheiere],
      buton: { text: "Deschide programările", href: `${SITE.url}/admin/programari` },
    }),
  });
}

/** Programare nouă cu plata la cabinet: cererea așteaptă confirmarea Lilianei. */
export async function emailProgramareNoua(p: Programare): Promise<void> {
  const client = clientOf(p);

  await Promise.all([
    catreClient(
      p,
      `Am primit cererea de programare — ${cand(p)}`,
      {
        eticheta: "Cerere de programare",
        titlu: "Am primit cererea ta",
        previzualizare: `${p.service.name}, ${cand(p)}. Îți scriu imediat ce o confirm.`,
        paragrafe: ["Am primit cererea ta de programare:"],
        detalii: detalii(p),
        dupaDetalii: ["Programarea nu e încă confirmată. Îți scriu din nou imediat ce o confirm."],
        ...deAdaugatInCalendar(p),
      },
      "REQUEST",
    ),
    catreCabinet(
      p,
      `Programare nouă: ${client.name} — ${cand(p)}`,
      "Programare nouă",
      `${client.name} vrea o ședință`,
      "Programarea așteaptă confirmarea ta în panoul de administrare.",
    ),
  ]);
}

/** Plata online a reușit: programarea e confirmată automat. */
export async function emailProgramarePlatita(p: Programare): Promise<void> {
  const client = clientOf(p);

  await Promise.all([
    catreClient(
      p,
      `Programare confirmată — ${cand(p)}`,
      {
        eticheta: "Programare confirmată",
        titlu: "Ne vedem curând",
        previzualizare: `Plata a fost primită. ${p.service.name}, ${cand(p)}.`,
        paragrafe: ["Plata a fost primită, iar programarea ta e confirmată:"],
        detalii: detalii(p),
        dupaDetalii: ["Dacă nu mai poți ajunge, te rog să-mi dai de știre din timp, răspunzând la acest email."],
        ...deAdaugatInCalendar(p),
      },
      "REQUEST",
    ),
    catreCabinet(
      p,
      `Programare nouă, plătită online: ${client.name} — ${cand(p)}`,
      "Programare plătită online",
      `${client.name} și-a rezervat o ședință`,
      "E deja confirmată și apare în Google Calendar.",
    ),
  ]);
}

/** Cabinetul a schimbat statusul: clientul află doar de confirmare sau anulare. */
export async function emailStatusProgramare(p: Programare, status: string): Promise<void> {
  if (status === "CONFIRMED") {
    await catreClient(
      p,
      `Programare confirmată — ${cand(p)}`,
      {
        eticheta: "Programare confirmată",
        titlu: "Ne vedem curând",
        previzualizare: `${p.service.name}, ${cand(p)}.`,
        paragrafe: ["Programarea ta e confirmată:"],
        detalii: detalii(p),
        dupaDetalii: ["Dacă nu mai poți ajunge, te rog să-mi dai de știre din timp, răspunzând la acest email."],
        ...deAdaugatInCalendar(p),
      },
      "REQUEST",
    );
  } else if (status === "CANCELLED") {
    await catreClient(
      p,
      `Programare anulată — ${cand(p)}`,
      {
        eticheta: "Programare anulată",
        titlu: "Programarea a fost anulată",
        previzualizare: `Ședința de ${cand(p)} a fost anulată.`,
        paragrafe: [
          `Programarea de ${cand(p)} (${p.service.name}) a fost anulată și a fost scoasă din calendarul tău.`,
          "Dacă vrei să alegem altă zi, răspunde la acest email sau fă o programare nouă pe site.",
        ],
        buton: { text: "Alege o altă zi", href: `${SITE.url}/programari` },
      },
      "CANCEL",
    );
  }
}

/** Liliana a mutat ședința în Google Calendar: clientul primește noua oră. */
export async function emailProgramareMutata(p: Programare): Promise<void> {
  await catreClient(
    p,
    `Programare mutată — ${cand(p)}`,
    {
      eticheta: "Programare mutată",
      titlu: "Ședința ta are o nouă oră",
      previzualizare: `Noua programare: ${cand(p)}.`,
      paragrafe: ["Ședința ta a fost mutată. Noua programare:"],
      detalii: detalii(p),
      dupaDetalii: [
        "Evenimentul din calendarul tău se actualizează singur. Dacă noua oră nu îți convine, răspunde la acest email și găsim alta.",
      ],
    },
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
      {
        eticheta: "Programare anulată",
        titlu: "Am primit anularea",
        previzualizare: `Ședința de ${cand(p)} a fost anulată.`,
        paragrafe: [
          `Am primit anularea programării de ${cand(p)} (${p.service.name}). A fost scoasă și din calendarul tău.`,
          ...(p.paymentMethod === "ONLINE"
            ? ["Pentru ședința plătită online, te contactez pentru rambursare sau reprogramare."]
            : []),
        ],
        buton: { text: "Fă o programare nouă", href: `${SITE.url}/programari` },
      },
      "CANCEL",
    ),
    catreCabinet(
      p,
      `Programare anulată de client: ${client.name} — ${cand(p)}`,
      "Anulare",
      `${client.name} a anulat programarea`,
      "Ora a fost eliberată pe site și ședința a fost scoasă din Google Calendar.",
    ),
  ]);
}
