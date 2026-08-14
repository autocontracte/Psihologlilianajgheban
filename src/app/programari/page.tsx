import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { Reveal } from "@/components/ui/Reveal";
import { OrbitRing } from "@/components/ui/OrbitFrame";
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
            <Reveal>
              <div className="mb-9 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] bg-cream px-6 py-4">
                {user ? (
                  <>
                    <p className="font-sans text-[0.85rem] text-ink-soft">
                      Programezi ca <span className="text-ink">{user.name}</span>
                    </p>
                    <Link
                      href="/cont"
                      className="font-sans text-[0.7rem] uppercase tracking-[0.14em] text-periwinkle transition-colors duration-300 hover:text-ink"
                    >
                      Programările mele →
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="font-sans text-[0.85rem] text-ink-soft">
                      Poți programa direct, <span className="text-ink">fără cont</span>.
                    </p>
                    <span className="font-sans text-[0.8rem] text-ink-muted">
                      Ai deja cont?{" "}
                      <Link
                        href="/cont/autentificare?redirect=/programari"
                        className="text-periwinkle underline decoration-periwinkle/30 underline-offset-4 transition-colors hover:text-ink"
                      >
                        Autentifică-te
                      </Link>
                    </span>
                  </>
                )}
              </div>
            </Reveal>

            <BookingFlow services={services} loggedIn={!!user} />

            {!user && <AccountBenefits />}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

/* -------------------------------------------------------------------------- */

/** Afișat sub formular, celor care nu sunt autentificați. Nu blochează nimic —
    doar explică ce câștigă dacă își fac cont. */
function AccountBenefits() {
  const steps = [
    {
      Icon: IconCalendar,
      title: "Îți vezi ședințele",
      text: "Toate programările, viitoare și trecute, într-un singur loc.",
    },
    {
      Icon: IconClock,
      title: "Anulezi singur",
      text: "Poți anula sau elibera un interval cu 24 de ore înainte, fără telefon.",
    },
    {
      Icon: IconOffice,
      title: "Programezi mai repede",
      text: "Datele tale sunt deja completate data viitoare.",
    },
  ];

  return (
    <Reveal>
      <div className="mt-10 rounded-[2rem] border border-ink/10 bg-cream/60 p-8 text-center sm:p-10">
        <h2 className="font-display text-xl text-ink sm:text-2xl">
          Vrei să îți faci și cont?
        </h2>
        <p className="mx-auto mt-3 max-w-md font-sans text-[0.88rem] leading-[1.85] text-ink-soft">
          Nu e obligatoriu — programarea de mai sus funcționează și fără. Contul
          îți e util dacă vii la mai multe ședințe.
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

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/cont/inregistrare?redirect=/programari"
            className="group inline-flex items-center justify-center gap-2.5 rounded-pill bg-periwinkle px-7 py-3.5 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-cream transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink"
          >
            Creează cont
            <IconArrow className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/cont/autentificare?redirect=/programari"
            className="inline-flex items-center justify-center gap-2.5 rounded-pill border border-ink/20 px-7 py-3.5 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-ink transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-ink/50 hover:bg-ink hover:text-cream"
          >
            Am deja cont
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
