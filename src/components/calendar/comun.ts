/* Bucăți comune aplicației de calendar a Lilianei (/calendar). */

import { PAS, ZI_END, type Ev, type LunaCal } from "@/lib/calendarTelefon";

export type Vedere = "an" | "luna" | "saptamana" | "zi" | "program";

/** Ce se poate ascunde din meniul lateral. */
export type Strat = "PENDING" | "CONFIRMED" | "COMPLETED" | "google";

export const STRATURI: [Strat, string][] = [
  ["PENDING", "De confirmat"],
  ["CONFIRMED", "Confirmate"],
  ["COMPLETED", "Finalizate"],
  ["google", "Google Calendar"],
];

/** Culoarea barei: verde pentru confirmate, ocru pentru cele de confirmat,
    gri pentru cele trecute, albastru pentru Google. */
export const CULOARE: Record<Strat, string> = {
  CONFIRMED: "#6e8567",
  PENDING: "#c0904a",
  COMPLETED: "#8b9098",
  google: "#6f93b8",
};

export function stratul(e: Ev): Strat {
  return e.kind === "google" ? "google" : e.status === "CANCELLED" ? "COMPLETED" : e.status;
}

export function culoare(e: Ev): string {
  return CULOARE[stratul(e)];
}

/** Fundalul deschis al unui eveniment, în culoarea lui. */
export function fundal(e: Ev, cat = 22): string {
  return `color-mix(in srgb, ${culoare(e)} ${e.kind === "google" && e.free ? Math.round(cat / 2) : cat}%, white)`;
}

export function prenume(e: Ev): string {
  return e.kind === "prog" ? e.title.trim().split(/\s+/)[0] : e.title;
}

/** Evenimentele unei zile, fără straturile ascunse: întâi cele pe toată ziua. */
export function aleZilei(data: LunaCal, date: string, ascunse: Strat[]): Ev[] {
  return data.events.filter((e) => e.date === date && !ascunse.includes(stratul(e)));
}

/** Idul din Google al unui eveniment (în calendar e tăiat pe zile: „id:zi"). */
export function idGoogle(e: Ev): string {
  return e.id.slice(0, e.id.lastIndexOf(":"));
}

/** Prima jumătate de oră care n-a trecut încă (azi, din timpul zilei) sau 10:00. */
export function oraImplicita(date: string, today: string): number {
  const next = Math.ceil(acum() / PAS) * PAS;
  if (date !== today || next < 9 * 60) return 10 * 60;
  return Math.min(next, ZI_END - 60);
}

/** Ora României, în minute de la miezul nopții. */
export function acum(): number {
  const [h, m] = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Bucharest",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .format(new Date())
    .split(":")
    .map(Number);
  return h * 60 + m;
}

export function durata(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return [h ? `${h} h` : "", m ? `${m} min` : ""].filter(Boolean).join(" ");
}

/** Cerere către API; aruncă eroarea cu mesajul primit. La sesiune expirată, la autentificare. */
export async function cere<T = Record<string, unknown>>(
  url: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (res.status === 401) window.location.href = "/cont/autentificare?redirect=/calendar";
  if (!res.ok) throw Object.assign(new Error(json.error ?? "Operațiunea nu a reușit."), { status: res.status });
  return json as T;
}
