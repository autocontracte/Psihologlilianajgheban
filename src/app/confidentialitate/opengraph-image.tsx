import { miniatura, OG_MARIME, OG_TIP } from "@/lib/og";

export const alt = "Politica de confidențialitate";
export const size = OG_MARIME;
export const contentType = OG_TIP;

export default function Image() {
  return miniatura({ eticheta: "Informații legale", titlu: "Politica de confidențialitate", subtitlu: "Cum sunt colectate, folosite și protejate datele tale." });
}
