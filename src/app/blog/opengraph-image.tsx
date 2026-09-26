import { miniatura, OG_MARIME, OG_TIP } from "@/lib/og";
import { PHOTOS, SITE } from "@/content/site";

export const alt = `Blogul psihologului ${SITE.name}`;
export const size = OG_MARIME;
export const contentType = OG_TIP;

export default function Image() {
  return miniatura({
    eticheta: "Blog",
    titlu: "Gânduri și resurse",
    subtitlu: "Articole despre relații, emoții, parenting și pașii mărunți prin care ne îngrijim de noi.",
    imagine: { src: PHOTOS.despre, pozitie: "50% 30%" },
  });
}
