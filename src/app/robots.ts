import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  // Cât timp site-ul nu e public, interzicem tot și nu anunțăm sitemap-ul.
  if (!SITE.indexable) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/cont/"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
