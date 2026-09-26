import { miniatura, OG_MARIME, OG_TIP } from "@/lib/og";
import { PHOTOS, PRICE, SITE } from "@/content/site";

export const alt = `${SITE.name}, psiholog clinician și psihoterapeut integrativ în ${SITE.city}`;
export const size = OG_MARIME;
export const contentType = OG_TIP;

export default function Image() {
  return miniatura({
    eticheta: "Psiholog clinician · Psihoterapeut",
    titlu: `Psihoterapie în ${SITE.city} și online`,
    subtitlu: `Pentru adulți, adolescenți, copii și părinți. ${PRICE.standard} ${PRICE.currency}, ședința de 50 de minute.`,
    imagine: { src: PHOTOS.heroPortret, pozitie: "50% 22%" },
  });
}
