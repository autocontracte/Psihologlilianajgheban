import { WELCOME } from "@/content/site";
import { Reveal } from "../ui/Reveal";
import { Lumina } from "../ui/Lumina";

export function Welcome() {
  return (
    <section className="grain relative overflow-hidden bg-ink py-28 lg:py-36">
      <Lumina varianta="noapte" din="stanga" />
      {/* Halou decorativ, static — inelele rotitoare de aici oboseau privirea */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[12%] h-[36rem] w-[56rem] -translate-x-1/2"
        style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--color-periwinkle) 22%, transparent), transparent)" }}
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
          <div className="relative mx-auto mt-12 h-px w-20 bg-gradient-to-r from-transparent via-periwinkle-light to-transparent" />
        </Reveal>

        <div className="relative mx-auto mt-12 max-w-2xl space-y-6">
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
