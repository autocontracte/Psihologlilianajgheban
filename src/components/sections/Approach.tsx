import { APPROACH } from "@/content/site";
import { Reveal, Stagger, StaggerItem } from "../ui/Reveal";
import { OrbitRing } from "../ui/OrbitFrame";

export function Approach() {
  return (
    <section
      id="abordare"
      className="grain relative overflow-hidden bg-ink py-28 lg:py-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-periwinkle/15 blur-3xl"
      />
      <OrbitRing
        className="-right-32 top-16 hidden lg:block"
        size="26rem"
        accent="cream"
        duration={64}
        dashed
      />
      <OrbitRing
        className="-right-20 top-40 hidden lg:block"
        size="15rem"
        accent="cream"
        duration={44}
        reverse
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        {/* Antet */}
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="font-sans text-[0.78rem] tracking-[0.02em] text-periwinkle-light">
              {APPROACH.eyebrow}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-4xl leading-tight text-cream sm:text-5xl">
              {APPROACH.title}
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-7 font-sans text-[0.95rem] leading-[1.9] text-cream/60">
              {APPROACH.subtitle}
            </p>
          </Reveal>
        </div>

        {/* Etape */}
        <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {APPROACH.steps.map((s) => (
            <StaggerItem key={s.step}>
              <article className="group relative h-full rounded-[2rem] border border-cream/12 bg-cream/[0.045] p-8 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-periwinkle/50 hover:bg-cream/[0.09]">
                <span className="font-display text-4xl text-periwinkle-light/70 transition-colors duration-500 group-hover:text-periwinkle-light">
                  {s.step}
                </span>
                <h3 className="mt-5 font-display text-xl leading-snug text-cream">
                  {s.title}
                </h3>
                <p className="mt-3.5 font-sans text-[0.85rem] leading-[1.85] text-cream/55">
                  {s.description}
                </p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Valori */}
        <div className="mt-20 border-t border-cream/12 pt-14">
          <Stagger className="grid gap-10 sm:grid-cols-3">
            {APPROACH.values.map((v) => (
              <StaggerItem key={v.title}>
                <div className="text-center sm:text-left">
                  <h4 className="font-display text-[1.3rem] italic text-periwinkle-light">
                    {v.title}
                  </h4>
                  <p className="mt-3 font-sans text-[0.85rem] leading-[1.85] text-cream/55">
                    {v.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
