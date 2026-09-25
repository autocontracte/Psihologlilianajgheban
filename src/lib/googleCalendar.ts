import "server-only";

import { createSign } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { clientOf } from "@/lib/appointments";
import { TZ } from "@/lib/tz";
import { FORMAT_LABEL, isFormat } from "@/lib/types";
import { SITE } from "@/content/site";

/* ----------------------------------------------------------------------------
   Google Calendar — clientul API.

   Autentificarea se face cu un cont de serviciu (service account): un „robot”
   Google căruia Liliana i-a dat drept de editare pe calendarul ei. Spre
   deosebire de OAuth, nu expiră și nu cere niciodată o nouă autentificare.

   Cheia contului de serviciu stă într-un fișier JSON pe server, în afara
   aplicației. Cât timp lipsește, sincronizarea e pur și simplu oprită — restul
   site-ului funcționează normal.
   -------------------------------------------------------------------------- */

const KEY_FILE = process.env.GOOGLE_SERVICE_ACCOUNT_FILE ?? "";
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID ?? "";

// Fără fișierul cu cheia, sincronizarea stă oprită în liniște (nu umple logul cu erori)
export const googleActiv = Boolean(KEY_FILE && CALENDAR_ID && existsSync(KEY_FILE));

const API = "https://www.googleapis.com/calendar/v3";
const SCOPE = "https://www.googleapis.com/auth/calendar";

type Cheie = { client_email: string; private_key: string };

let cheie: Cheie | null = null;
let token: { value: string; expiresAt: number } | null = null;

function citesteCheia(): Cheie {
  cheie ??= JSON.parse(readFileSync(KEY_FILE, "utf8")) as Cheie;
  return cheie;
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

/** Tokenul de acces, reînnoit cu câteva minute înainte să expire. */
async function accessToken(): Promise<string> {
  if (token && token.expiresAt > Date.now() + 5 * 60_000) return token.value;

  const { client_email, private_key } = citesteCheia();
  const now = Math.floor(Date.now() / 1000);

  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: client_email,
      scope: SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const semnatura = createSign("RSA-SHA256")
    .update(`${header}.${claims}`)
    .sign(private_key, "base64url");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${semnatura}`,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return token.value;
}

export class GoogleError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Cerere către API. Aruncă GoogleError, cu statusul HTTP, la orice eșec. */
export async function google<T>(
  path: string,
  init: { method?: string; body?: unknown; query?: Record<string, string> } = {},
): Promise<T> {
  const url = new URL(API + path);
  for (const [k, v] of Object.entries(init.query ?? {})) url.searchParams.set(k, v);

  const res = await fetch(url, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) throw new GoogleError(res.status, `Google ${res.status}: ${await res.text()}`);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export function caleEvenimente(eventId?: string): string {
  const cal = `/calendars/${encodeURIComponent(CALENDAR_ID)}/events`;
  return eventId ? `${cal}/${encodeURIComponent(eventId)}` : cal;
}

/* ------------------------------------------------------ evenimentul unei ședințe */

export type ProgramarePentruGoogle = Parameters<typeof clientOf>[0] & {
  id: string;
  startsAt: Date;
  endsAt: Date;
  status: string;
  format: string;
  notes: string | null;
  adminNote: string | null;
  paymentMethod: string;
  service: { name: string };
};

/* Culorile standard din Google Calendar: galben până la confirmare, verde
   după, gri când ședința a avut loc. */
const CULOARE: Record<string, string> = {
  PENDING: "5",
  CONFIRMED: "10",
  COMPLETED: "8",
};

export function evenimentDinProgramare(p: ProgramarePentruGoogle) {
  const client = clientOf(p);
  const format = isFormat(p.format) ? FORMAT_LABEL[p.format] : p.format;

  const descriere = [
    `${p.service.name} · ${format}`,
    p.paymentMethod === "ONLINE" ? "Plătită online" : "Plata la cabinet",
    "",
    `Client: ${client.name}${client.hasAccount ? "" : " (fără cont)"}`,
    `Telefon: ${client.phone || "-"}`,
    `Email: ${client.email || "-"}`,
    p.notes ? `\nMesajul clientului:\n${p.notes}` : "",
    p.adminNote ? `\nNotă internă:\n${p.adminNote}` : "",
    "",
    `Gestionează programarea: ${SITE.url}/admin/programari`,
    "",
    "Dacă muți sau ștergi evenimentul aici, site-ul se actualizează singur și îl anunță pe client.",
  ]
    .filter((l) => l !== "")
    .join("\n");

  return {
    summary: `${p.status === "PENDING" ? "⏳ De confirmat: " : ""}${client.name} — ${p.service.name}`,
    description: descriere,
    location: p.format === "ONLINE" ? "Online" : `Cabinet, ${SITE.city}`,
    start: { dateTime: p.startsAt.toISOString(), timeZone: TZ },
    end: { dateTime: p.endsAt.toISOString(), timeZone: TZ },
    colorId: CULOARE[p.status] ?? "5",
    transparency: "opaque",
    extendedProperties: { private: { appointmentId: p.id } },
  };
}
