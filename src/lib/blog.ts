import "server-only";

import sanitizeHtml from "sanitize-html";
import { db } from "./db";

/* ----------------------------------------------------------------------------
   Blogul.

   Editorul produce HTML. Nu avem încredere în el niciodată: îl curățăm aici,
   la salvare, păstrând doar un set mic de etichete sigure. Așa, chiar dacă
   cineva ar reuși să bage un <script> prin editor, el nu ajunge în baza de
   date și nu se execută la nimeni.
   -------------------------------------------------------------------------- */

/** Etichetele și atributele permise în conținutul unui articol. */
export function curataHtml(murdar: string): string {
  return sanitizeHtml(murdar, {
    allowedTags: [
      "h2", "h3", "h4", "p", "blockquote", "ul", "ol", "li",
      "strong", "em", "u", "s", "a", "br", "hr", "img", "figure", "figcaption",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
    // Doar linkuri http(s), relative sau mailto — fără javascript:
    allowedSchemes: ["http", "https", "mailto"],
    // Imaginile pot fi din /blog-media (încărcate de noi) sau de pe web.
    allowedSchemesByTag: { img: ["http", "https"] },
    transformTags: {
      // Orice link extern se deschide în filă nouă, în siguranță.
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const extern = /^https?:\/\//i.test(href);
        return {
          tagName: "a",
          attribs: {
            ...attribs,
            ...(extern ? { target: "_blank", rel: "noopener noreferrer" } : {}),
          },
        };
      },
    },
  }).trim();
}

/** Primul paragraf, curățat de etichete — pentru rezumatul automat. */
export function rezumatDinHtml(html: string, lungime = 200): string {
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= lungime) return text;
  return text.slice(0, lungime).replace(/\s+\S*$/, "") + "…";
}

/** Transformă un titlu într-un slug curat, cu diacriticele redate fonetic. */
export function facSlug(text: string): string {
  const diacritice: Record<string, string> = {
    ă: "a", â: "a", î: "i", ș: "s", ş: "s", ț: "t", ţ: "t",
    Ă: "a", Â: "a", Î: "i", Ș: "s", Ş: "s", Ț: "t", Ţ: "t",
  };
  return text
    .replace(/[ăâîșşțţĂÂÎȘŞȚŢ]/g, (c) => diacritice[c] ?? c)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Slug unic: dacă e deja folosit, adaugă -2, -3… (ignoră articolul curent). */
export async function slugUnic(baza: string, exceptId?: string): Promise<string> {
  const start = facSlug(baza) || "articol";
  let slug = start;
  let n = 1;
  while (true) {
    const existent = await db.blogPost.findUnique({ where: { slug } });
    if (!existent || existent.id === exceptId) return slug;
    n += 1;
    slug = `${start}-${n}`;
  }
}

export type ArticolCard = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  publishedAt: Date | null;
};

/** Articolele publicate, cele mai noi primele. */
export async function articolePublicate(): Promise<ArticolCard[]> {
  const posts = await db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: { slug: true, title: true, excerpt: true, coverImage: true, publishedAt: true },
  });
  return posts.map((p) => ({ ...p, excerpt: p.excerpt ?? "" }));
}

/** Un articol publicat, după slug. `null` dacă nu există sau e ciornă. */
export async function articolPublicat(slug: string) {
  const post = await db.blogPost.findUnique({ where: { slug } });
  if (!post || post.status !== "PUBLISHED") return null;
  return post;
}
