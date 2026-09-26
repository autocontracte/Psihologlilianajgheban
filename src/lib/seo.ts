import type { Metadata } from "next";
import { SITE } from "@/content/site";

/* ----------------------------------------------------------------------------
   Metadatele unei pagini: titlu, descriere, adresa canonică și ce arată
   linkul când e distribuit.

   Fără ele, o pagină moștenește tot din layout — inclusiv adresa canonică
   a primei pagini (Google ar crede că e o copie a ei) și titlul primei
   pagini în previzualizarea de pe WhatsApp sau Facebook.

   Miniatura vine separat, din `opengraph-image.tsx`-ul fiecărei pagini.
   -------------------------------------------------------------------------- */

type Pagina = {
  titlu: string;
  descriere: string;
  /** Calea paginii, de exemplu „/programari”. */
  cale: string;
  articol?: { publicat?: Date | null; modificat?: Date | null };
  robots?: Metadata["robots"];
};

export function metaPagina({ titlu, descriere, cale, articol, robots }: Pagina): Metadata {
  const url = `${SITE.url}${cale === "/" ? "" : cale}`;
  const titluComplet = `${titlu} | ${SITE.name}`;

  return {
    title: titlu,
    description: descriere,
    alternates: { canonical: url },
    openGraph: {
      locale: "ro_RO",
      siteName: SITE.name,
      url,
      title: titluComplet,
      description: descriere,
      ...(articol
        ? {
            type: "article",
            publishedTime: articol.publicat?.toISOString(),
            modifiedTime: articol.modificat?.toISOString(),
            authors: [SITE.name],
          }
        : { type: "website" }),
    },
    twitter: { card: "summary_large_image", title: titluComplet, description: descriere },
    ...(robots ? { robots } : {}),
  };
}
