/* Bucăți comune aplicației de calendar a Lilianei (/calendar). */

import { PAS, SYNC_INTARZIAT_MIN, ZI_END, type Ev, type LunaCal } from "@/lib/calendarTelefon";

export type Vedere = "an" | "luna" | "saptamana" | "zi" | "program";

function deCat(min: number): string {
  if (min < 1) return "chiar acum";
  if (min < 60) return `acum ${min} min`;
  const ore = Math.floor(min / 60);
  if (ore < 48) return `acum ${ore} ${ore === 1 ? "oră" : "ore"}`;
  return `acum ${Math.floor(ore / 24)} zile`;
}

/** Cât de proaspătă e sincronizarea cu Google: textul din meniu și dacă e cazul de avertisment. */
export function stareSync(sync: LunaCal["sync"]): { intarziat: boolean; text: string; eroare: string | null } {
  if (!sync.lastOkAt) return { intarziat: true, text: "Google nu s-a sincronizat niciodată.", eroare: sync.lastError };
  const min = Math.floor((Date.now() - new Date(sync.lastOkAt).getTime()) / 60_000);
  const intarziat = min >= SYNC_INTARZIAT_MIN;
  return {
    intarziat,
    text: intarziat ? `Google nu s-a mai sincronizat de ${deCat(min).replace("acum ", "")}.` : `Sincronizat cu Google ${deCat(min)}.`,
    eroare: intarziat ? sync.lastError : null,
  };
}

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
