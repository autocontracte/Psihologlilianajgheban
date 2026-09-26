import { miniatura, OG_MARIME, OG_TIP } from "@/lib/og";

export const alt = "Termeni și condiții";
export const size = OG_MARIME;
export const contentType = OG_TIP;

export default function Image() {
  return miniatura({ eticheta: "Informații legale", titlu: "Termeni și condiții", subtitlu: "Condițiile de utilizare a site-ului și de furnizare a serviciilor." });
}
