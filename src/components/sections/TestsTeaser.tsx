import Image from "next/image";
import { TESTS } from "@/content/site";
import { Reveal } from "../ui/Reveal";
import { Button } from "../ui/Button";
import { Lumina } from "../ui/Lumina";
import { Accent } from "../ui/Accent";
import { IconCheck } from "../ui/Icons";
import { PRET_KIT_LEI } from "@/lib/kit/pret";

/* Kitul „Cum stai, de fapt, cu relația ta?" pe prima pagină: în stânga,
   fotografia alb-negru cu voal întunecat și textul; în dreapta, ghidul. */
export function TestsTeaser() {
  return (
    <section id="kit" className="relative bg-cream py-20 lg:py-28">
      <Lumina din="dreapta" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="grid overflow-hidden lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative flex min-h-[23rem] items-center overflow-hidden lg:min-h-[30rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/foto/consiliere-hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
              {/* Voalul întunecat, mai dens la stânga, ca textul să fie lizibil */}
              <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/70 to-ink/40" />
              <div className="absolute inset-0 bg-ink/15" />

              <div className="relative px-8 py-14 lg:px-14 lg:py-16">
                <span className="inline-flex bg-cream/15 px-4 py-1.5 font-sans text-[0.74rem] tracking-[0.02em] text-cream backdrop-blur-sm">
                  {TESTS.eyebrow}
                </span>

                <h2 className="mt-6 font-display text-3xl leading-[1.08] text-cream sm:text-4xl lg:text-[3rem]">
                  <Accent text={TESTS.title} className="text-periwinkle-light" />
                </h2>

                <p className="mt-5 max-w-xl font-sans text-[0.92rem] leading-[1.9] text-cream/80">
                  {TESTS.description}
                </p>

                <ul className="mt-6 space-y-2">
                  {TESTS.items.map((t) => (
                    <li key={t} className="flex items-center gap-2.5 font-sans text-[0.88rem] text-cream">
                      <IconCheck className="h-4 w-4 text-periwinkle-light" />
                      {t}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Button href={TESTS.href} variant="light">
                    {TESTS.cta}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center bg-cream-deep px-6 py-10">
              <Image
                src="/foto/kit-relatie.webp"
                alt="Ghidul „Cum stai, de fapt, cu relația ta?” de Liliana Jgheban"
                width={2000}
                height={1333}
                sizes="(min-width: 1024px) 460px, 90vw"
                className="w-full max-w-md mix-blend-multiply"
              />
              <p className="mt-2 font-display text-[2rem] leading-none text-ink">
                {PRET_KIT_LEI} <span className="text-[1rem] text-ink-soft">lei</span>
              </p>
              <p className="mt-2 font-sans text-[0.8rem] text-ink-muted">Test, raport personal și ghid</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
