import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./programator.css";

/* Programatorul intern al cabinetelor. Se vede doar pe subdomeniul lui —
   vezi src/middleware.ts. Pe telefon se poate instala ca aplicație (manifestul
   și iconițele sunt în /api/programator/aplicatie). */
export const metadata: Metadata = {
  title: { absolute: "Programator cabinete — Therapy Home" },
  description: "Programatorul intern al cabinetelor Therapy Home.",
  robots: { index: false, follow: false, nocache: true },
  manifest: "/api/programator/aplicatie/manifest",
  appleWebApp: { capable: true, title: "Programator", statusBarStyle: "default" },
  icons: {
    icon: { url: "/api/programator/aplicatie/iconita?s=192", type: "image/png" },
    apple: { url: "/api/programator/aplicatie/iconita?s=180", sizes: "180x180" },
  },
};

export const viewport: Viewport = {
  themeColor: "#f3f4ee",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const dynamic = "force-dynamic";

export default function ProgramatorLayout({ children }: { children: ReactNode }) {
  return <div className="prog">{children}</div>;
}
