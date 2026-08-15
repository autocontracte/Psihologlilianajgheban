import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { Reveal } from "./ui/Reveal";

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <Nav />
      <main>
        <section className="grain relative overflow-hidden bg-cream pt-40 pb-16 lg:pt-48">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-24 h-96 w-96 rounded-full bg-periwinkle-pale/50 blur-3xl"
          />
          <div className="relative mx-auto max-w-3xl px-6 lg:px-10">
            <Reveal>
              <p className="font-sans text-[0.75rem] tracking-[0.02em] text-periwinkle">
                Actualizat: {updated}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-5 font-display text-4xl leading-tight text-ink sm:text-5xl">
                {title}
              </h1>
            </Reveal>
            <Reveal delay={0.14}>
              <div className="rule-soft mt-7" />
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-7 font-sans text-[0.93rem] leading-[1.9] text-ink-soft">
                {intro}
              </p>
            </Reveal>
          </div>
        </section>

        <section className="bg-cream pb-28 lg:pb-36">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <div className="space-y-10">
              {sections.map((s, i) => (
                <Reveal key={s.heading} delay={Math.min(i * 0.05, 0.3)}>
                  <div className="rounded-[2rem] border border-ink/8 bg-cream-warm p-8 lg:p-9">
                    <h2 className="font-display text-[1.4rem] leading-snug text-ink">
                      {s.heading}
                    </h2>
                    {s.paragraphs?.map((p, j) => (
                      <p
                        key={j}
                        className="mt-4 font-sans text-[0.88rem] leading-[1.9] text-ink-soft"
                      >
                        {p}
                      </p>
                    ))}
                    {s.bullets && (
                      <ul className="mt-4 space-y-2.5">
                        {s.bullets.map((b) => (
                          <li
                            key={b}
                            className="flex gap-3 font-sans text-[0.88rem] leading-[1.85] text-ink-soft"
                          >
                            <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-periwinkle" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
