/* Bucăți comune interfeței programatorului. */

export type Me = { personId: string | null; name: string; manager: boolean };

export const camp =
  "w-full rounded-none border border-ink/20 bg-cream-warm px-3 py-2.5 font-sans text-[0.95rem] text-ink focus:border-periwinkle focus:outline-none focus:ring-4 focus:ring-periwinkle/15 disabled:opacity-60";

export const eticheta = "mb-1.5 block font-sans text-[0.78rem] font-semibold text-ink-soft";

export const butonPlin =
  "inline-flex items-center justify-center gap-2 rounded-none bg-periwinkle px-5 py-2.5 font-sans text-[0.9rem] font-semibold text-cream transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60";

export const butonSimplu =
  "inline-flex items-center justify-center gap-2 rounded-none border border-ink/25 bg-transparent px-4 py-2.5 font-sans text-[0.9rem] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream disabled:cursor-not-allowed disabled:opacity-60";

export const butonPericol =
  "inline-flex items-center justify-center gap-2 rounded-none border border-clay/40 bg-transparent px-4 py-2.5 font-sans text-[0.9rem] text-clay transition-colors hover:bg-clay hover:text-cream disabled:cursor-not-allowed disabled:opacity-60";

/** Cerere către API-ul programatorului; aruncă eroarea cu mesajul primit. */
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
  if (res.status === 401 && !url.endsWith("/login")) {
    window.location.href = "/intra";
  }
  if (!res.ok) throw new Error(json.error ?? "Operațiunea nu a reușit.");
  return json as T;
}
