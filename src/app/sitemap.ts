import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";
import { db } from "@/lib/db";

// Articolele noi apar în sitemap fără un build nou
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fără indexare, sitemap-ul nu are ce căuta — l-ar putea folosi ca punct de
  // plecare orice robot care ignoră robots.txt.
  if (!SITE.indexable) return [];

  const now = new Date();
  const articole = await db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  return [
    { url: SITE.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/programari`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/kit`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    {
      url: `${SITE.url}/blog`,
      lastModified: articole[0]?.updatedAt ?? now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...articole.map((a) => ({
      url: `${SITE.url}/blog/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
