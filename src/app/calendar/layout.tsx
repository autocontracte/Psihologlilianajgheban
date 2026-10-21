import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./calendar.css";

/* Calendarul Lilianei: aplicația ei de telefon, doar pentru contul de
   administrator. Se instalează ca aplicație (manifestul și iconița sunt
   alături, service worker-ul e la /calendar-sw.js). */
export const metadata: Metadata = {
  title: { absolute: "Calendar — Liliana Jgheban" },
  robots: { index: false, follow: false, nocache: true },
  manifest: "/calendar/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Calendar", statusBarStyle: "default" },
  icons: {
    icon: { url: "/calendar/iconita?s=192", type: "image/png" },
    apple: { url: "/calendar/iconita?s=180", sizes: "180x180" },
  },
};

export const viewport: Viewport = {
  themeColor: "#f3f4ee",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const dynamic = "force-dynamic";

export default function CalendarLayout({ children }: { children: ReactNode }) {
  return <div className="cal-app">{children}</div>;
}
