import Link from "next/link";
import type { ReactNode } from "react";
import { Nav } from "../Nav";
import { Footer } from "../Footer";
import { OrbitFrame, OrbitRing } from "../ui/OrbitFrame";
import { Reveal } from "../ui/Reveal";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="grain relative flex min-h-screen items-center overflow-hidden bg-cream px-6 pt-36 pb-24 lg:pt-40">
        {/* Accente decorative */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-10 h-[28rem] w-[28rem] rounded-full bg-periwinkle-pale/50 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 bottom-0 h-[26rem] w-[26rem] rounded-full bg-sage-pale/50 blur-3xl"
        />
        <OrbitRing
          className="-right-24 top-24 hidden lg:block"
          size="20rem"
          accent="periwinkle"
          duration={58}
          dashed
        />

        <div className="relative mx-auto w-full max-w-md">
          <Reveal>
            <div className="mb-9 text-center">
              <p className="font-sans text-[0.62rem] uppercase tracking-[0.28em] text-periwinkle">
                {eyebrow}
              </p>
              <h1 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
                {title}
              </h1>
              <p className="mx-auto mt-4 max-w-sm font-sans text-[0.88rem] leading-[1.85] text-ink-soft">
                {subtitle}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <OrbitFrame
              accent="periwinkle"
              inset="-1rem"
              radius="3rem"
              duration={24}
              tilt={2.5}
            >
              <div className="rounded-[2.25rem] bg-cream-warm p-8 shadow-[0_30px_70px_-40px_rgba(56,62,82,0.45)] sm:p-10">
                {children}
              </div>
            </OrbitFrame>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-8 text-center font-sans text-[0.85rem] text-ink-soft">
              {footer}
            </p>
          </Reveal>

          <Reveal delay={0.26}>
            <p className="mt-4 text-center">
              <Link
                href="/"
                className="font-sans text-[0.75rem] text-ink-muted transition-colors duration-300 hover:text-periwinkle"
              >
                ← Înapoi la site
              </Link>
            </p>
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* Stiluri comune pentru câmpurile din formularele de cont. */
export const authInput =
  "w-full rounded-[1.25rem] border border-ink/15 bg-cream px-5 py-3.5 font-sans text-[0.9rem] text-ink placeholder:text-ink-muted transition-all duration-300 focus:border-periwinkle focus:outline-none focus:ring-4 focus:ring-periwinkle/12";

export const authLabel =
  "mb-2 block font-sans text-[0.58rem] uppercase tracking-[0.22em] text-ink-muted";
