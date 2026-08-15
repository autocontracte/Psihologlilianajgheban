import { SERVICES } from "@/content/site";
import { Reveal, Stagger, StaggerItem } from "../ui/Reveal";
import { Button } from "../ui/Button";

export function Services() {
  return (
    <section
      id="servicii"
      className="grain relative overflow-hidden bg-cream-deep py-28 lg:py-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-sage-pale/50 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        {/* Antet */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <Reveal>
              <p className="font-sans text-[0.78rem] tracking-[0.02em] text-sage">
                {SERVICES.eyebrow}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5 font-display text-4xl leading-tight text-ink sm:text-5xl lg:text-[3.4rem]">
                {SERVICES.title}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.16}>
            <p className="font-sans text-[0.95rem] leading-[1.9] text-ink-soft lg:pb-3">
              {SERVICES.subtitle}
            </p>
          </Reveal>
        </div>

        {/* Listă servicii */}
        <Stagger className="mt-16 grid gap-5 lg:mt-20 lg:grid-cols-2">
          {SERVICES.items.map((item) => (
            <StaggerItem key={item.number}>
              <article className="lift group relative h-full overflow-hidden rounded-[2.25rem] bg-cream p-9 lg:p-11">
                {/* Număr filigran */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-2 -top-5 font-display text-[6rem] leading-none text-ink/[0.045] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-periwinkle/10 lg:text-[7.5rem]"
                >
                  {item.number}
                </span>

                <div className="relative">
                  <span className="inline-flex rounded-pill bg-sage-pale px-4 py-1.5 font-sans text-[0.74rem] tracking-[0.02em] text-sage">
                    {item.audience}
                  </span>

                  <h3 className="mt-6 max-w-sm font-display text-[1.55rem] leading-[1.25] text-ink lg:text-[1.75rem]">
                    {item.title}
                  </h3>

                  <p className="mt-4 font-sans text-[0.88rem] leading-[1.9] text-ink-soft">
                    {item.description}
                  </p>
                </div>

                {/* Bară de accent la hover */}
                <span
                  aria-hidden
                  className="absolute inset-x-9 bottom-0 h-[2px] origin-left scale-x-0 rounded-pill bg-gradient-to-r from-periwinkle to-sage transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 lg:inset-x-11"
                />
              </article>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1}>
          <div className="mt-14 text-center">
            <Button href="/programari" variant="primary">
              Programează o ședință
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
