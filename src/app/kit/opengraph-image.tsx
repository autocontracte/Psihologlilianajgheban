import { miniatura, OG_MARIME, OG_TIP } from "@/lib/og";
import { NUME_KIT } from "@/lib/kit/pret";

export const alt = `Trusa de ajutor „${NUME_KIT}”: raportul personal și ghidul practic`;
export const size = OG_MARIME;
export const contentType = OG_TIP;

export default function Image() {
  return miniatura({
    eticheta: "Trusă de ajutor pentru cuplu",
    titlu: NUME_KIT,
    subtitlu: "Test de 30 de întrebări, raport personal în PDF și ghidul practic de 79 de pagini.",
    imagine: { src: "/og/kit-mockup.png", potrivire: "contain" },
  });
}
