import { AUDIENCES } from "@/content/site";
import { ICONS, type IconName } from "../ui/Icons";
import { Reveal, Stagger, StaggerItem } from "../ui/Reveal";

export function Audiences() {
  return (
    <section
      id="pentru-cine"
      className="relative overflow-hidden bg-cream py-28 lg:py-36"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Antet */}
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="font-sans text-[0.65rem] uppercase tracking-[0.3em] text-periwinkle">
              {AUDIENCES.eyebrow}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-4xl leading-tight text-ink sm:text-5xl">
              {AUDIENCES.title}
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="rule-soft mx-auto mt-7" />
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-7 font-sans text-[0.95rem] leading-[1.9] text-ink-soft">
              {AUDIENCES.subtitle}
            </p>
          </Reveal>
        </div>

        {/* Carduri */}
        <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
          {AUDIENCES.items.map((item) => {
            const Icon = ICONS[item.icon as IconName];
            return (
              <StaggerItem key={item.title}>
                <article className="lift group h-full rounded-[2rem] border border-ink/8 bg-cream-warm p-8 lg:p-9">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.15rem] bg-periwinkle-pale text-periwinkle transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-periwinkle group-hover:text-cream">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-7 font-display text-[1.35rem] leading-snug text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-3.5 font-sans text-[0.88rem] leading-[1.85] text-ink-soft">
                    {item.description}
                  </p>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
