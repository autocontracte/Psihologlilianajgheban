import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { ChestionarConsiliere } from "@/components/consiliere/ChestionarConsiliere";
import { platileSuntActive } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Consiliere psihologică — Ghid despre divorț",
  description:
    "Răspunzi la câteva întrebări și primești o interpretare personalizată, sprijinită pe Ghidul practic despre divorț, plus ghidul complet în PDF.",
};

const beneficii = [
  {
    icon: "description",
    titlu: "Ghidul complet, în PDF",
    text: "63 de pagini de psihoeducație despre divorț: prevenție, separare, copii și viața de după.",
  },
  {
    icon: "draw",
    titlu: "O interpretare personală",
    text: "Pe baza răspunsurilor tale, o reflecție caldă și clară — nu un scor, ci o perspectivă.",
  },
  {
    icon: "schedule",
    titlu: "În ritmul tău",
    text: "Câteva minute, cu răspunsurile salvate pe măsură ce le dai. Poți reveni oricând.",
  },
];

export default function ConsilierePage() {
  return (
    <>
      <Nav />
      <main>
        <section className="grain relative overflow-hidden bg-cream pt-40 pb-16 lg:pt-48 lg:pb-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-20 h-[30rem] w-[30rem] bg-sage-pale/60 blur-3xl"
          />
          <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-10">
            <Reveal>
              <span className="inline-flex bg-periwinkle-pale px-5 py-2 font-sans text-[0.74rem] tracking-[0.02em] text-periwinkle">
                Consiliere psihologică
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-7 font-display text-4xl leading-[1.05] text-ink sm:text-6xl">
                Ghid despre <span className="italic text-sage">divorț</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-8 max-w-xl font-sans text-[0.95rem] leading-[1.9] text-ink-soft">
                Divorțul e un proces, nu un moment. Acest ghid te ajută să
                înțelegi ce se întâmplă cu tine și cu cei dragi — și îți oferă o
                interpretare personală, pornind de la situația ta.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="bg-cream pb-10">
          <div className="mx-auto max-w-5xl px-6 lg:px-10">
            <div className="grid gap-5 sm:grid-cols-3">
              {beneficii.map((b) => (
                <Reveal key={b.titlu}>
                  <div className="h-full border border-ink/8 bg-cream-warm p-7">
                    <span className="flex h-12 w-12 items-center justify-center bg-sage-pale text-sage">
                      <span className="mi" style={{ fontSize: "1.5rem" }} aria-hidden="true">{b.icon}</span>
                    </span>
                    <h2 className="mt-5 font-display text-[1.2rem] text-ink">{b.titlu}</h2>
                    <p className="mt-2 font-sans text-[0.86rem] leading-[1.8] text-ink-soft">{b.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-cream pb-24 lg:pb-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <ChestionarConsiliere platesteActiv={platileSuntActive} />
            <p className="mt-6 text-center font-sans text-[0.78rem] leading-relaxed text-ink-muted">
              Interpretarea e o reflecție de psihoeducație și nu înlocuiește o
              ședință de terapie. Datele tale sunt folosite doar pentru acest ghid.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
