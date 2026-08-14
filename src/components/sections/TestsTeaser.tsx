import { TESTS } from "@/content/site";
import { Reveal } from "../ui/Reveal";
import { Button } from "../ui/Button";
import { IconCompass } from "../ui/Icons";

export function TestsTeaser() {
  return (
    <section id="teste" className="relative bg-cream py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="grain relative overflow-hidden rounded-[2.75rem] bg-gradient-to-br from-periwinkle to-[#57679b] px-8 py-14 lg:rounded-[3.5rem] lg:px-16 lg:py-20">
            {/* Forme decorative */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-cream/15"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-cream/[0.07]"
            />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-[0.95rem] bg-cream/15 text-cream">
                    <IconCompass className="h-5 w-5" />
                  </span>
                  <span className="rounded-pill bg-cream/15 px-4 py-1.5 font-sans text-[0.58rem] uppercase tracking-[0.22em] text-cream">
                    {TESTS.eyebrow}
                  </span>
                </div>

                <h2 className="mt-7 font-display text-3xl leading-tight text-cream sm:text-4xl lg:text-[3rem]">
                  {TESTS.title}
                </h2>

                <p className="mt-5 max-w-xl font-sans text-[0.92rem] leading-[1.9] text-cream/75">
                  {TESTS.description}
                </p>
              </div>

              <div className="lg:justify-self-end">
                <Button href="/teste" variant="light">
                  {TESTS.cta}
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
