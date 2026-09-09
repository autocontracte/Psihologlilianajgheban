import Image from "next/image";
import { PHOTOS } from "@/content/site";
import { Reveal } from "../ui/Reveal";
import { ActionButtons } from "../ui/ActionButtons";

/** Fotografiile cabinetului. Un om care caută terapie vrea să vadă unde intră. */
export function Gallery() {
  const [principala, ...restul] = PHOTOS.cabinet;

  return (
    <section id="cabinet" className="relative overflow-hidden bg-cream py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-2xl">
          <Reveal>
            <p className="font-sans text-[0.95rem] text-periwinkle">Cabinetul</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
              Locul în care ne vedem
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="rule-soft mt-6" />
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 font-sans text-[1rem] leading-[1.85] text-ink-soft">
              Un apartament liniștit, cu lumină naturală și fără aer de clinică.
              Poți vedea dinainte unde vei sta, ca prima venire să fie mai ușoară.
            </p>
          </Reveal>
        </div>

        {/* O fotografie mare, restul într-o grilă dreaptă */}
        <div className="mt-14 grid gap-3 lg:grid-cols-2">
          {/* Fără `row-span`: pe un singur rând, cele două coloane se întind
              amândouă cât cea mai înaltă, oricâte poze ar fi în dreapta. */}
          <Reveal>
            <div className="relative h-72 w-full overflow-hidden bg-cream-deep sm:h-96 lg:h-full lg:min-h-[34rem]">
              <Image
                src={principala.src}
                alt={principala.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.03]"
              />
            </div>
          </Reveal>

          {/* Grila din dreapta se întinde cât fotografia mare, ca cele două
              coloane să se termine la aceeași înălțime indiferent câte poze
              sunt. */}
          <div className="grid grid-cols-2 gap-3 lg:h-full lg:auto-rows-fr">
            {restul.map((foto, i) => (
              <Reveal key={foto.src} delay={Math.min(i * 0.06, 0.3)} className="lg:h-full">
                <div className="relative h-40 w-full overflow-hidden bg-cream-deep sm:h-52 lg:h-full">
                  <Image
                    src={foto.src}
                    alt={foto.alt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.05]"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <ActionButtons variant="light" className="mt-16" />

      </div>
    </section>
  );
}
