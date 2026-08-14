import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { BookingForm } from "@/components/sections/BookingForm";
import { Reveal } from "@/components/ui/Reveal";
import { SITE } from "@/content/site";
import { IconCalendar, IconClock, IconMail } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Programări",
  description:
    "Programează o ședință de psihoterapie, consiliere parentală sau evaluare psihologică cu Liliana Jgheban. Ședințe în cabinet și online.",
};

const steps = [
  {
    Icon: IconMail,
    title: "Trimiți cererea",
    text: "Completezi formularul cu ce te aduce în terapie și cu intervalele care ți se potrivesc.",
  },
  {
    Icon: IconClock,
    title: "Te contactez",
    text: "Îți răspund de regulă în aceeași zi lucrătoare, ca să stabilim detaliile.",
  },
  {
    Icon: IconCalendar,
    title: "Confirmăm ședința",
    text: "Primești confirmarea cu data, ora și, dacă e online, linkul de conectare.",
  },
];

export default function ProgramariPage() {
  return (
    <>
      <Nav />
      <main>
        {/* Antet */}
        <section className="grain relative overflow-hidden bg-cream pt-40 pb-20 lg:pt-48 lg:pb-24">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-24 h-[30rem] w-[30rem] rounded-full bg-periwinkle-pale/60 blur-3xl"
          />
          <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-10">
            <Reveal>
              <p className="font-sans text-[0.65rem] uppercase tracking-[0.3em] text-periwinkle">
                Programări
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-5 font-display text-4xl leading-[1.05] text-ink sm:text-6xl lg:text-[4.2rem]">
                Hai să stabilim o{" "}
                <span className="italic text-periwinkle">întâlnire</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-8 max-w-xl font-sans text-[0.95rem] leading-[1.9] text-ink-soft">
                Completează formularul de mai jos și te contactez pentru a
                confirma ziua și ora. Dacă preferi, mă poți suna direct la{" "}
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

        {/* Cum decurge */}
        <section className="relative bg-cream pb-16">
          <div className="mx-auto max-w-5xl px-6 lg:px-10">
            <div className="grid gap-5 sm:grid-cols-3">
              {steps.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.1}>
                  <div className="h-full rounded-[1.85rem] border border-ink/8 bg-cream-warm p-7 text-center">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[1rem] bg-periwinkle-pale text-periwinkle">
                      <s.Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-5 font-display text-lg text-ink">
                      {s.title}
                    </p>
                    <p className="mt-2.5 font-sans text-[0.83rem] leading-[1.8] text-ink-soft">
                      {s.text}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Formular */}
        <section className="relative bg-cream-deep py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <BookingForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
