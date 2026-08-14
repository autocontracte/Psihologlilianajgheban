import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { Reveal } from "@/components/ui/Reveal";
import { OrbitFrame, OrbitRing } from "@/components/ui/OrbitFrame";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SITE } from "@/content/site";
import { IconArrow, IconCalendar, IconClock, IconOffice } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Programări",
  description:
    "Programează online o ședință de psihoterapie, consiliere parentală sau evaluare psihologică cu Liliana Jgheban. În cabinet sau online.",
};

export const dynamic = "force-dynamic";

export default async function ProgramariPage() {
  const [user, services] = await Promise.all([
    getCurrentUser(),
    db.service.findMany({
      where: { active: true },
      orderBy: { position: "asc" },
      select: { id: true, name: true, duration: true, description: true },
    }),
  ]);

  return (
    <>
      <Nav />
      <main>
        {/* Antet */}
        <section className="grain relative overflow-hidden bg-cream pt-40 pb-16 lg:pt-48 lg:pb-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-24 h-[30rem] w-[30rem] rounded-full bg-periwinkle-pale/60 blur-3xl"
          />
          <OrbitRing
            className="-left-28 top-32 hidden lg:block"
            size="22rem"
            accent="sage"
            duration={62}
            dashed
          />

          <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-10">
            <Reveal>
              <p className="font-sans text-[0.65rem] uppercase tracking-[0.3em] text-periwinkle">
                Programare online
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-5 font-display text-4xl leading-[1.05] text-ink sm:text-6xl lg:text-[4rem]">
                Hai să stabilim o{" "}
                <span className="italic text-periwinkle">întâlnire</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-7 max-w-xl font-sans text-[0.95rem] leading-[1.9] text-ink-soft">
                Alegi serviciul, ziua și ora care ți se potrivesc, iar eu îți
                confirm programarea. Dacă preferi să vorbim întâi, sună-mă la{" "}
                <a
                  href={`tel:${SITE.phoneHref}`}
                  className="text-periwinkle underline decoration-periwinkle/30 underline-offset-4 transition-colors hover:text-ink"
                >
                  {SITE.phone}
                </a>
                .
              </p>
            </Reveal>
          </div>
        </section>

        {/* Conținut */}
        <section className="relative bg-cream-deep py-16 lg:py-24">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            {user ? (
              <>
                <Reveal>
                  <div className="mb-9 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] bg-cream px-6 py-4">
                    <p className="font-sans text-[0.85rem] text-ink-soft">
                      Programezi ca{" "}
                      <span className="text-ink">{user.name}</span>
                    </p>
                    <Link
                      href="/cont"
                      className="font-sans text-[0.7rem] uppercase tracking-[0.14em] text-periwinkle transition-colors duration-300 hover:text-ink"
                    >
                      Programările mele →
                    </Link>
                  </div>
                </Reveal>

                <BookingFlow services={services} />
              </>
            ) : (
              <LoginPrompt />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

/* -------------------------------------------------------------------------- */

function LoginPrompt() {
  const steps = [
    {
      Icon: IconCalendar,
      title: "Alegi când",
      text: "Vezi în timp real intervalele libere și rezervi ce ți se potrivește.",
    },
    {
      Icon: IconOffice,
      title: "În cabinet sau online",
      text: "Alegi formatul la fiecare programare, în funcție de cum îți e mai ușor.",
    },
    {
      Icon: IconClock,
      title: "Ai totul la un loc",
      text: "Îți vezi ședințele viitoare și le poți anula cu 24 de ore înainte.",
    },
  ];

  return (
    <Reveal>
      <OrbitFrame accent="periwinkle" inset="-1rem" radius="3rem" duration={26} tilt={2}>
        <div className="rounded-[2.25rem] bg-cream p-8 text-center shadow-[0_30px_70px_-40px_rgba(56,62,82,0.4)] sm:p-11">
          <h2 className="font-display text-2xl text-ink sm:text-3xl">
            Ai nevoie de un cont
          </h2>
          <p className="mx-auto mt-4 max-w-md font-sans text-[0.92rem] leading-[1.9] text-ink-soft">
            Contul ține evidența ședințelor tale și îți permite să te programezi
            singur, fără telefoane. Durează un minut să îl creezi.
          </p>

          <div className="mt-9 grid gap-4 text-left sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.title} className="rounded-[1.5rem] bg-cream-warm p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-[0.85rem] bg-periwinkle-pale text-periwinkle">
                  <s.Icon className="h-4.5 w-4.5" />
                </span>
                <p className="mt-4 font-display text-[1rem] text-ink">{s.title}</p>
                <p className="mt-1.5 font-sans text-[0.78rem] leading-relaxed text-ink-soft">
                  {s.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/cont/inregistrare?redirect=/programari"
              className="group inline-flex items-center justify-center gap-2.5 rounded-pill bg-periwinkle px-8 py-4 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-cream transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink"
            >
              Creează cont
              <IconArrow className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/cont/autentificare?redirect=/programari"
              className="inline-flex items-center justify-center gap-2.5 rounded-pill border border-ink/20 px-8 py-4 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-ink transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-ink/50 hover:bg-ink hover:text-cream"
            >
              Am deja cont
            </Link>
          </div>
        </div>
      </OrbitFrame>
    </Reveal>
  );
}
