import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";

/* Roboții care fac previzualizarea unui link (miniatura, titlul) când e
   trimis pe WhatsApp, Facebook, LinkedIn etc. Nu indexează nimic, deci au
   voie peste tot mereu — altfel linkurile ar apărea fără miniatură. */
const PREVIZUALIZARE = [
  "facebookexternalhit",
  "Facebot",
  "WhatsApp",
  "Twitterbot",
  "LinkedInBot",
  "TelegramBot",
  "Slackbot-LinkExpanding",
  "Discordbot",
  "Pinterestbot",
];

export default function robots(): MetadataRoute.Robots {
  const previzualizare = { userAgent: PREVIZUALIZARE, allow: "/", disallow: ["/api/", "/admin/", "/cont/"] };

  // Cât timp site-ul nu e public, motoarele de căutare nu au voie nicăieri
  // și nu anunțăm sitemap-ul.
  if (!SITE.indexable) {
    return { rules: [previzualizare, { userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      previzualizare,
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/cont/"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
