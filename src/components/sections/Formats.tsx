import { FORMATS } from "@/content/site";
import { ICONS, type IconName, IconCheck } from "../ui/Icons";
import { Reveal, Stagger, StaggerItem } from "../ui/Reveal";

export function Formats() {
  return (
    <section
      id="format"
      className="relative overflow-hidden bg-cream py-28 lg:py-36"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Antet */}
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="font-sans text-[0.78rem] tracking-[0.02em] text-sage">
              {FORMATS.eyebrow}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-4xl leading-tight text-ink sm:text-5xl">
              {FORMATS.title}
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="rule-soft mx-auto mt-7" />
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-7 font-sans text-[0.95rem] leading-[1.9] text-ink-soft">
              {FORMATS.subtitle}
            </p>
          </Reveal>
        </div>

        {/* Carduri format */}
        <Stagger className="mt-16 grid gap-6 lg:mt-20 lg:grid-cols-2">
          {FORMATS.items.map((item, i) => {
            const Icon = ICONS[item.icon as IconName];
            const accent = i === 0 ? "periwinkle" : "sage";
            return (
              <StaggerItem key={item.title}>
                <article
                  className={[
                    "lift group relative h-full overflow-hidden rounded-[2.5rem] p-9 lg:p-11",
                    accent === "periwinkle"
                      ? "bg-periwinkle-pale/55"
                      : "bg-sage-pale/60",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-cream transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105",
                      accent === "periwinkle" ? "text-periwinkle" : "text-sage",
                    ].join(" ")}
                  >
                    <Icon className="h-7 w-7" />
                  </div>

                  <h3 className="mt-7 font-display text-2xl text-ink lg:text-[1.9rem]">
                    {item.title}
                  </h3>

                  <p className="mt-4 font-sans text-[0.9rem] leading-[1.9] text-ink-soft">
                    {item.description}
                  </p>

                  <ul className="mt-7 space-y-3 border-t border-ink/10 pt-7">
                    {item.points.map((p) => (
                      <li key={p} className="flex items-start gap-3">
                        <span
                          className={[
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cream",
                            accent === "periwinkle"
                              ? "text-periwinkle"
                              : "text-sage",
                          ].join(" ")}
                        >
                          <IconCheck className="h-3 w-3" strokeWidth={2} />
                        </span>
                        <span className="font-sans text-[0.85rem] leading-relaxed text-ink-soft">
                          {p}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
