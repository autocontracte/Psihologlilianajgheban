import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

/* ----------------------------------------------------------------------------
   Email, prin SMTP (Zoho).

   Datele de conectare stau doar în .env, pe server. Cât timp lipsesc, nimic
   nu se trimite: mesajele rămân în baza de date / în log, iar formularele
   funcționează normal. O eroare de trimitere nu strică niciodată cererea
   omului — programarea e salvată oricum, doar emailul se pierde (și apare
   în log).
   -------------------------------------------------------------------------- */

const HOST = process.env.SMTP_HOST ?? "";
const PORT = Number(process.env.SMTP_PORT || 587);
const USER = process.env.SMTP_USER ?? "";
const PASSWORD = process.env.SMTP_PASSWORD ?? "";

/** Expeditorul trebuie să fie pe domeniul verificat în Zoho. */
const FROM =
  process.env.MAIL_FROM ||
  "Psiholog Liliana Jgheban <no-reply@psihologlilianajgheban.ro>";

/** Unde ajung înștiințările pentru cabinet. */
export const CABINET_EMAIL = process.env.CONTACT_EMAIL ?? "";

export const emailActiv = Boolean(HOST && USER && PASSWORD);

let transporter: Transporter | null = null;

function smtp(): Transporter {
  transporter ??= nodemailer.createTransport({
    host: HOST,
    port: PORT,
    // 465 = TLS de la început; 587 = STARTTLS
    secure: PORT === 465,
    auth: { user: USER, pass: PASSWORD },
    // Cererea omului așteaptă emailul; un SMTP blocat nu trebuie s-o țină minute întregi
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transporter;
}

type Mesaj = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  /** Invitație de calendar (.ics). Gmail/Outlook o arată ca eveniment. */
  ical?: { method: "REQUEST" | "CANCEL"; content: string };
};

/** Trimite un email. Nu aruncă niciodată; întoarce dacă a reușit. */
export async function trimiteEmail(mesaj: Mesaj): Promise<boolean> {
  if (!emailActiv || !mesaj.to) {
    console.log("[email] netrimis (SMTP neconfigurat)", {
      to: mesaj.to,
      subject: mesaj.subject,
    });
    return false;
  }

  try {
    const { ical, ...rest } = mesaj;
    await smtp().sendMail({
      from: FROM,
      ...rest,
      ...(ical
        ? {
            icalEvent: {
              method: ical.method,
              filename: "sedinta.ics",
              content: ical.content,
            },
          }
        : {}),
    });
    return true;
  } catch (err) {
    console.error("[email] trimitere esuata", { to: mesaj.to, subject: mesaj.subject }, err);
    return false;
  }
}
