import { TESTS } from "@/content/site";
import { PARTI } from "@/lib/ghid/parti";
import { Reveal } from "../ui/Reveal";
import { Button } from "../ui/Button";
import { Lumina } from "../ui/Lumina";
import { Accent } from "../ui/Accent";
import { IconCheck } from "../ui/Icons";
import { Carte3D } from "../ghid/Carte3D";
import { Telefon3D } from "../ghid/Telefon3D";

/* Ghidurile pe prima pagină: un panou închis, cu textul în stânga și, în
   dreapta, telefonul animat (chestionarul real, în buclă) și cărțile 3D ale
   părților. Prețul e pe pagina ghidurilor, nu pe prima pagină. */
export function TestsTeaser() {
  return (
    <section id="kit" className="relative bg-cream py-20 lg:py-28">
      <Lumina din="dreapta" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="grain relative overflow-hidden bg-ink">
            {/* luminile din fundal */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -right-24 -top-32 h-[30rem] w-[30rem] rounded-full bg-periwinkle/35 blur-3xl" />
              <div className="absolute -bottom-40 right-[30%] h-[24rem] w-[24rem] rounded-full bg-sage/25 blur-3xl" />
              <div className="absolute -left-32 top-1/2 h-[20rem] w-[20rem] rounded-full bg-periwinkle-light/15 blur-3xl" />
            </div>

            <div className="relative grid items-center lg:grid-cols-[1fr_1.05fr]">
              <div className="px-8 pb-6 pt-14 sm:px-12 lg:py-20 lg:pl-14 lg:pr-4">
                <p className="font-sans text-[0.85rem] text-periwinkle-light">Ghiduri pentru cuplu și familie</p>
                <h2 className="mt-4 font-display text-3xl leading-[1.08] text-cream sm:text-4xl lg:text-[3rem]">
                  <Accent text={TESTS.title} className="text-periwinkle-light" />
                </h2>

                <p className="mt-5 max-w-xl font-sans text-[0.95rem] leading-[1.9] text-cream/75">{TESTS.description}</p>

                <ul className="mt-6 space-y-2.5">
                  {TESTS.items.map((t) => (
                    <li key={t} className="flex items-center gap-2.5 font-sans text-[0.9rem] text-cream">
                      <span className="flex h-5 w-5 items-center justify-center bg-periwinkle-light/20">
                        <IconCheck className="h-3.5 w-3.5 text-periwinkle-light" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>

                <div className="mt-9">
                  <Button href={TESTS.href} variant="light">
                    {TESTS.cta}
                  </Button>
                </div>
              </div>

              {/* Telefonul cu chestionarul și cărțile, ca pe pagina ghidurilor */}
              <div className="relative mx-auto h-[24rem] w-full max-w-[34rem] sm:h-[34rem] lg:my-8">
                <Carte3D
                  parte={PARTI[2]}
                  rotatieY={30}
                  rotatieX={4}
                  grosime={18}
                  className="absolute left-[2%] top-[10%] w-[33%] -rotate-[7deg]"
                />
                <Carte3D
                  parte={PARTI[3]}
                  rotatieY={-32}
                  rotatieX={4}
                  grosime={18}
                  className="absolute right-[4%] top-[6%] w-[30%] rotate-[6deg]"
                />
                <Carte3D
                  parte={PARTI[1]}
                  rotatieY={-18}
                  rotatieX={8}
                  grosime={20}
                  className="absolute bottom-[3%] left-[12%] w-[29%] -rotate-[2deg]"
                />
                <Telefon3D className="absolute left-[54%] top-[3%] w-[38%] -translate-x-1/2" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
