import { miniatura, OG_MARIME, OG_TIP } from "@/lib/og";
import { PHOTOS, SITE } from "@/content/site";

export const alt = `Programează o ședință cu ${SITE.name}`;
export const size = OG_MARIME;
export const contentType = OG_TIP;

export default function Image() {
  return miniatura({
    eticheta: "Programări online",
    titlu: "Programează o ședință",
    subtitlu: `Alegi ziua și ora direct din calendar. În cabinetul din ${SITE.city} sau online.`,
    imagine: { src: PHOTOS.hero, pozitie: "40% 50%" },
  });
}
