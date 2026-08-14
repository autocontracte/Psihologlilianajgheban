import { WELCOME } from "@/content/site";
import { Reveal } from "../ui/Reveal";

export function Welcome() {
  return (
    <section className="grain relative overflow-hidden bg-ink py-28 lg:py-36">
      {/* Halou decorativ */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-96 w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-periwinkle/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-10">
        <Reveal>
          <span
            aria-hidden
            className="font-display text-7xl leading-none text-periwinkle/50"
          >
            &ldquo;
          </span>
        </Reveal>

        <Reveal delay={0.1}>
          <blockquote className="-mt-6 font-display text-[1.7rem] italic leading-[1.45] text-cream sm:text-4xl lg:text-[2.6rem]">
            {WELCOME.quote}
          </blockquote>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mx-auto mt-12 h-px w-20 bg-gradient-to-r from-transparent via-periwinkle-light to-transparent" />
        </Reveal>

        <div className="mx-auto mt-12 max-w-2xl space-y-6">
          {WELCOME.body.map((p, i) => (
            <Reveal key={i} delay={0.25 + i * 0.1}>
              <p className="font-sans text-[0.95rem] leading-[1.95] text-cream/70">
                {p}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
