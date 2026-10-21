import { miniatura, OG_MARIME, OG_TIP } from "@/lib/og";
import { PHOTOS, SITE } from "@/content/site";

export const alt = `${SITE.name}, psihoterapeut integrativ în ${SITE.city}`;
export const size = OG_MARIME;
export const contentType = OG_TIP;

export default function Image() {
  return miniatura({
    eticheta: "Psihoterapeut integrativ",
    titlu: `Psihoterapie în ${SITE.city} și online`,
    subtitlu: "Pentru adulți, adolescenți, copii și părinți. În cabinet și online.",
    imagine: { src: PHOTOS.heroPortret, pozitie: "50% 22%" },
  });
}
