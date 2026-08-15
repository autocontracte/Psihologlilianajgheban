import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { IconCompass, IconGroup, IconSandtray } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Teste vocaționale gratuite",
  description:
    "Teste vocaționale gratuite pentru adolescenți și tineri: descoperă-ți interesele, valorile și direcția profesională potrivită. În curând pe site.",
};

/* Editează liber lista de mai jos, în funcție de testele pe care le vei publica. */
const planned = [
  {
    Icon: IconCompass,
    title: "Chestionar de interese profesionale",
    text: "Îți arată domeniile către care înclini natural și profesiile care se potrivesc cu ele.",
  },
  {
    Icon: IconGroup,
    title: "Valori în carieră",
    text: "Ce contează cu adevărat pentru tine într-un job: stabilitate, autonomie, sens, echipă, recunoaștere.",
  },
  {
    Icon: IconSandtray,
    title: "Profil de abilități",
    text: "O imagine asupra punctelor tale forte și a zonelor în care merită să investești.",
  },
];

export default function TestePage() {
  return (
    <>
      <Nav />
      <main>
        {/* Antet */}
        <section className="grain relative overflow-hidden bg-cream pt-40 pb-20 lg:pt-48 lg:pb-24">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 -top-20 h-[30rem] w-[30rem] rounded-full bg-sage-pale/60 blur-3xl"
          />
          <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-10">
            <Reveal>
              <span className="inline-flex rounded-pill bg-periwinkle-pale px-5 py-2 font-sans text-[0.74rem] tracking-[0.02em] text-periwinkle">
                În curând
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-7 font-display text-4xl leading-[1.05] text-ink sm:text-6xl lg:text-[4.2rem]">
                Teste vocaționale{" "}
                <span className="italic text-sage">gratuite</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-8 max-w-xl font-sans text-[0.95rem] leading-[1.9] text-ink-soft">
                Pregătesc o secțiune dedicată adolescenților și tinerilor aflați
                în fața unei alegeri: ce liceu, ce facultate, ce direcție
                profesională. Testele vor fi gratuite, iar rezultatele vor veni
                însoțite de o interpretare clară — nu doar de un scor.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Ce va conține */}
        <section className="relative bg-cream pb-24 lg:pb-32">
          <div className="mx-auto max-w-6xl px-6 lg:px-10">
            <Stagger className="grid gap-6 sm:grid-cols-3">
              {planned.map((p) => (
                <StaggerItem key={p.title}>
                  <div className="lift h-full rounded-[2rem] border border-ink/8 bg-cream-warm p-8 text-center">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.15rem] bg-sage-pale text-sage">
                      <p.Icon className="h-6 w-6" />
                    </span>
                    <h2 className="mt-6 font-display text-[1.25rem] leading-snug text-ink">
                      {p.title}
                    </h2>
                    <p className="mt-3 font-sans text-[0.85rem] leading-[1.85] text-ink-soft">
                      {p.text}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            {/* Îndemn */}
            <Reveal delay={0.2}>
              <div className="mt-16 rounded-[2.5rem] bg-ink px-8 py-14 text-center lg:rounded-[3rem] lg:px-16">
                <h2 className="font-display text-3xl leading-tight text-cream lg:text-4xl">
                  Nu vrei să aștepți?
                </h2>
                <p className="mx-auto mt-5 max-w-lg font-sans text-[0.92rem] leading-[1.9] text-cream/65">
                  Orientarea vocațională se poate face și în cabinet, printr-o
                  evaluare completă și o discuție aplicată pe situația concretă a
                  adolescentului.
                </p>
                <div className="mt-9">
                  <Button href="/programari" variant="light">
                    Programează o evaluare
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
