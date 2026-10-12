import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./programator.css";

/* Programatorul intern al cabinetelor. Se vede doar pe subdomeniul lui —
   vezi src/middleware.ts. */
export const metadata: Metadata = {
  title: { absolute: "Programator cabinete — Therapy Home" },
  description: "Programatorul intern al cabinetelor Therapy Home.",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default function ProgramatorLayout({ children }: { children: ReactNode }) {
  return <div className="prog">{children}</div>;
}
