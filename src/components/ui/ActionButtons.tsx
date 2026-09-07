import Link from "next/link";
import { SITE } from "@/content/site";
import { IconCalendar, IconPhone, IconWhatsApp } from "./Icons";

/**
 * Cele trei moduri de a lua legătura, repetate după fiecare secțiune mare.
 *
 * Un om se hotărăște în momente diferite ale paginii: unul după ce citește
 * serviciile, altul abia după recenzii. Dacă butoanele sunt doar la final,
 * pe cei dintâi îi pui să caute.
 */
export function ActionButtons({
  variant = "light",
  className = "",
}: {
  /** `light` — pe fundal deschis. `dark` — pe secțiunile întunecate. */
  variant?: "light" | "dark";
  className?: string;
}) {
  const primary =
    variant === "dark"
      ? "bg-cream text-ink hover:bg-periwinkle-light hover:text-ink"
      : "bg-periwinkle text-cream hover:bg-ink";

  const secondary =
    variant === "dark"
      ? "border-cream/40 text-cream hover:border-cream hover:bg-cream hover:text-ink"
      : "border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-cream";

  const base =
    "inline-flex items-center justify-center gap-2.5 px-7 py-3.5 font-sans text-[0.95rem] transition-colors duration-400";

  return (
    <div className={`flex flex-wrap justify-center gap-3 ${className}`}>
      <Link href="/programari" className={`${base} ${primary}`}>
        <IconCalendar className="h-5 w-5" />
        Programează-te
      </Link>

      <a href={`tel:${SITE.phoneHref}`} className={`${base} border ${secondary}`}>
        <IconPhone className="h-5 w-5" />
        Sună acum
      </a>

      <a
        href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(SITE.whatsappMessage)}`}
        target="_blank"
        rel="noreferrer"
        className={`${base} border ${secondary}`}
      >
        <IconWhatsApp className="h-5 w-5" />
        Scrie pe WhatsApp
      </a>
    </div>
  );
}
