import { miniatura, OG_MARIME, OG_TIP } from "@/lib/og";
import { articolPublicat } from "@/lib/blog";
import { formatDateLong } from "@/lib/tz";
import { PHOTOS, SITE } from "@/content/site";

export const alt = `Articol de pe blogul lui ${SITE.name}`;
export const size = OG_MARIME;
export const contentType = OG_TIP;

/** Rezumatul, tăiat la un cuvânt întreg, ca să încapă sub titlu. */
function scurt(text: string, max = 130) {
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(" ", max)).replace(/[,;:.\s]+$/, "") + "…";
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await articolPublicat(slug);

  return miniatura({
    eticheta: post?.publishedAt ? `Blog · ${formatDateLong(post.publishedAt)}` : "Blog",
    titlu: post?.title ?? "Gânduri și resurse",
    subtitlu: post?.excerpt ? scurt(post.excerpt) : undefined,
    imagine: post?.coverImage ? { src: post.coverImage, pozitie: "50% 50%" } : undefined,
    rezerva: { src: PHOTOS.portrete[0], pozitie: "50% 22%" },
  });
}
