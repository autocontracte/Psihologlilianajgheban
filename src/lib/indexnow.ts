import { SITE } from "@/content/site";

/* ----------------------------------------------------------------------------
   IndexNow: anunță Bing, Yandex, Seznam și ceilalți parteneri că o pagină
   e nouă sau s-a schimbat, ca să o indexeze în câteva ore, nu în săptămâni.
   (Google nu folosește IndexNow; pentru el contează sitemap-ul din Search
   Console.)

   Cheia e publică prin definiție: stă în public/<cheie>.txt, ca motoarele
   să poată verifica că anunțul vine de la proprietarul site-ului.
   -------------------------------------------------------------------------- */

export const INDEXNOW_CHEIE = "fe350f9e937ad888bc487f1cd5bf41eb";

/** Anunță paginile date (căi ca „/blog/articol”). Nu aruncă niciodată. */
export async function anuntaIndexNow(cai: string[]): Promise<void> {
  if (!SITE.indexable || !cai.length) return;
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(SITE.url).host,
        key: INDEXNOW_CHEIE,
        keyLocation: `${SITE.url}/${INDEXNOW_CHEIE}.txt`,
        urlList: cai.map((c) => `${SITE.url}${c}`),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error("[indexnow]", res.status, await res.text().catch(() => ""));
  } catch (err) {
    console.error("[indexnow]", err instanceof Error ? err.message : err);
  }
}
