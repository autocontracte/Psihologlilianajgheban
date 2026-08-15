import Link from "next/link";
import { NAV, SITE } from "@/content/site";
import {
  IconFacebook,
  IconInstagram,
  IconLinkedIn,
  IconMail,
  IconPhone,
} from "./ui/Icons";

const socials = [
  { key: "facebook", Icon: IconFacebook, label: "Facebook" },
  { key: "instagram", Icon: IconInstagram, label: "Instagram" },
  { key: "linkedin", Icon: IconLinkedIn, label: "LinkedIn" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();
  const activeSocials = socials.filter(
    (s) => SITE.social[s.key as keyof typeof SITE.social],
  );

  return (
    <footer className="grain relative overflow-hidden bg-ink pt-20 pb-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-periwinkle/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          {/* Identitate */}
          <div>
            <p className="font-display text-2xl text-cream">{SITE.name}</p>
            <p className="mt-2 font-sans text-[0.75rem] tracking-[0.02em] text-periwinkle-light">
              {SITE.role}
            </p>
            <p className="mt-6 max-w-sm font-sans text-[0.87rem] leading-[1.85] text-cream/55">
              Cabinet de psihologie și psihoterapie pentru adulți, adolescenți și
              copii. Ședințe în cabinet și online.
            </p>

            {activeSocials.length > 0 && (
              <div className="mt-7 flex gap-3">
                {activeSocials.map(({ key, Icon, label }) => (
                  <a
                    key={key}
                    href={SITE.social[key as keyof typeof SITE.social]}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream/70 transition-all duration-400 hover:border-periwinkle hover:bg-periwinkle hover:text-cream"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Navigare */}
          <div>
            <p className="font-sans text-[0.74rem] tracking-[0.02em] text-cream/40">
              Navigare
            </p>
            <ul className="mt-5 space-y-2.5">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-sans text-[0.87rem] text-cream/65 transition-colors duration-300 hover:text-periwinkle-light"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/programari"
                  className="font-sans text-[0.87rem] text-cream/65 transition-colors duration-300 hover:text-periwinkle-light"
                >
                  Programări
                </Link>
              </li>
              <li>
                <Link
                  href="/teste"
                  className="font-sans text-[0.87rem] text-cream/65 transition-colors duration-300 hover:text-periwinkle-light"
                >
                  Teste vocaționale
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="font-sans text-[0.74rem] tracking-[0.02em] text-cream/40">
              Contact
            </p>
            <ul className="mt-5 space-y-3.5">
              <li>
                <a
                  href={`tel:${SITE.phoneHref}`}
                  className="group flex items-center gap-3 font-sans text-[0.87rem] text-cream/65 transition-colors duration-300 hover:text-periwinkle-light"
                >
                  <IconPhone className="h-4 w-4 shrink-0 text-periwinkle-light" />
                  {SITE.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="group flex items-center gap-3 font-sans text-[0.87rem] break-all text-cream/65 transition-colors duration-300 hover:text-periwinkle-light"
                >
                  <IconMail className="h-4 w-4 shrink-0 text-periwinkle-light" />
                  {SITE.email}
                </a>
              </li>
            </ul>

            <div className="mt-7 rounded-[1.25rem] border border-cream/12 bg-cream/[0.04] p-5">
              <p className="font-sans text-[0.78rem] leading-relaxed text-cream/55">
                În situații de criză sau urgență psihiatrică, sună la{" "}
                <span className="text-cream">112</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Bară de jos */}
        <div className="mt-16 flex flex-col gap-4 border-t border-cream/12 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-[0.75rem] text-cream/40">
            © {year} {SITE.name}. Toate drepturile rezervate.
          </p>
          <div className="flex gap-6">
            <Link
              href="/confidentialitate"
              className="font-sans text-[0.75rem] text-cream/40 transition-colors duration-300 hover:text-cream/75"
            >
              Politica de confidențialitate
            </Link>
            <Link
              href="/termeni"
              className="font-sans text-[0.75rem] text-cream/40 transition-colors duration-300 hover:text-cream/75"
            >
              Termeni
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
