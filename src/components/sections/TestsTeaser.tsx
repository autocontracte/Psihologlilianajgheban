import { TESTS } from "@/content/site";
import { Reveal } from "../ui/Reveal";
import { Button } from "../ui/Button";

/* Mini-hero pentru secțiunea de consiliere — o fotografie alb-negru, cu un
   voal întunecat peste care stă textul, în spiritul copertei ghidului. */
export function TestsTeaser() {
  return (
    <section id="consiliere" className="relative bg-cream py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="relative flex min-h-[23rem] items-center overflow-hidden lg:min-h-[27rem]">
            {/* Fotografia alb-negru */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/foto/consiliere-hero.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Voalul întunecat, mai dens la stânga, ca textul să fie lizibil */}
            <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/65 to-ink/25" />
            <div className="absolute inset-0 bg-ink/15" />

            <div className="relative max-w-2xl px-8 py-14 lg:px-16 lg:py-20">
              <span className="inline-flex bg-cream/15 px-4 py-1.5 font-sans text-[0.74rem] tracking-[0.02em] text-cream backdrop-blur-sm">
                {TESTS.eyebrow}
              </span>

              <h2 className="mt-6 font-display text-3xl leading-[1.08] text-cream sm:text-4xl lg:text-[3.1rem]">
                {TESTS.title}
              </h2>

              <p className="mt-5 max-w-xl font-sans text-[0.92rem] leading-[1.9] text-cream/80">
                {TESTS.description}
              </p>

              <div className="mt-8">
                <Button href="/consiliere" variant="light">
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
