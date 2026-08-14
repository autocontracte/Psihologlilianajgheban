import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: SITE.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    {
      url: `${SITE.url}/programari`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE.url}/teste`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE.url}/confidentialitate`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE.url}/termeni`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
