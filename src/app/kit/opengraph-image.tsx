import { miniatura, OG_MARIME, OG_TIP } from "@/lib/og";
import { NUME_KIT } from "@/lib/kit/pret";

export const alt = `„${NUME_KIT}”: chestionare gratuite și ghidul practic despre cuplu, divorț și familie`;
export const size = OG_MARIME;
export const contentType = OG_TIP;

export default function Image() {
  return miniatura({
    eticheta: "Chestionare gratuite",
    titlu: NUME_KIT,
    subtitlu: "Afli unde ești și ce parte din ghidul practic despre cuplu, divorț și familie ți se potrivește.",
    imagine: { src: "/og/kit-mockup.png", potrivire: "contain" },
  });
}
