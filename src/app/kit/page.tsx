import type { Metadata } from "next";
import { metaPagina } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, CalendarDays, ClipboardList, FileText, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { Lumina } from "@/components/ui/Lumina";
import { Val } from "@/components/ui/Val";
import { IconArrow, IconCheck } from "@/components/ui/Icons";
import { INTREBARI_FRECVENTE } from "@/lib/kit/faq";
import { AnaPanou } from "@/components/ana/AnaPanou";
import { CHESTIONARE } from "@/lib/ghid/chestionare";
import { NUME_GHID, PARTI, PRET_PARTE_LEI } from "@/lib/ghid/parti";
import { SITE } from "@/content/site";

/* ----------------------------------------------------------------------------
   Ghidul practic despre cuplu, divorț și familie, pe 6 părți.

   Fiecare parte are un chestionar gratuit (/kit/<slug>) cu interpretare
   generală; partea se ia cu 59 de lei, cu raportul personal inclus. Pagina
   aceasta e intrarea: alegi situația ta și pornești chestionarul ei.
   -------------------------------------------------------------------------- */

export const metadata: Metadata = metaPagina({
  titlu: "Chestionare gratuite despre cuplu, despărțire și familie, cu ghid practic",
  descriere: `Șase chestionare gratuite, pentru cupluri în criză, despărțire, divorț cu sau fără copii, co-parentaj și familia recompusă. Afli unde ești și ce parte din ghidul psihoterapeutului Liliana Jgheban ți se potrivește: ${PRET_PARTE_LEI} lei, cu raport personal.`,
  cale: "/kit",
});

const STATISTICI = [
  { cifra: "6 ani", text: "atât așteaptă, în medie, un cuplu nefericit până să ceară ajutor. Între timp, tiparele se adâncesc." },
  { cifra: "70%", text: "dintre conflictele unui cuplu sunt perpetue: nu se rezolvă definitiv, se gestionează. Contează cum vă certați, nu dacă." },
  { cifra: "5 la 1", text: "e raportul dintre momentele bune și cele tensionate la cuplurile care rămân stabile în timp." },
];

const PASI = [
  { icon: ClipboardList, nr: "01", titlu: "Chestionarul, gratuit", text: "Alegi situația ta și răspunzi la câteva întrebări. În jur de 5 minute, fără cont." },
  { icon: Sparkles, nr: "02", titlu: "Rezultatul, imediat", text: "Vezi o interpretare generală pe trei zone și afli ce parte a ghidului ți se potrivește." },
  { icon: FileText, nr: "03", titlu: `Partea ta, ${PRET_PARTE_LEI} lei`, text: "Raportul tău personal, scris pe răspunsurile tale, și partea din ghid, într-un singur PDF." },
  { icon: CalendarDays, nr: "04", titlu: "Pasul următor", text: "Citești, revii, iar dacă simți nevoia, te programezi la o ședință cu Liliana." },
];

export default function KitPage() {
  return (
    <>
      <Nav />
      <main>
        {/* ---------- Hero ---------- */}
        <section className="relative overflow-hidden bg-cream pb-16 pt-36 lg:pb-24 lg:pt-44">
          <Lumina din="dreapta" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
            <Reveal>
              <span className="inline-flex bg-periwinkle-pale px-4 py-2 font-sans text-[0.8rem] text-periwinkle">
                Pentru cupluri, părinți care se separă și familii noi
              </span>
              <h1 className="mt-6 font-display text-[2.6rem] leading-[1.06] text-ink sm:text-[3.4rem] lg:text-[3.9rem]">
                Cum stai, de fapt, în <em className="not-italic text-periwinkle">relația ta</em>?
              </h1>
              <p className="mt-6 max-w-xl font-sans text-[1.02rem] leading-[1.85] text-ink-soft">
                Șase chestionare gratuite, câte unul pentru fiecare situație: o criză de cuplu, o despărțire, un divorț cu
                sau fără copii, viața după divorț sau o familie nouă. Afli unde ești și ce parte din ghidul Lilianei
                Jgheban, psihoterapeut, te poate ajuta acum.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <a
                  href="#parti"
                  className="group inline-flex items-center justify-center gap-3 bg-periwinkle px-8 py-4 font-sans text-[0.97rem] text-cream shadow-[0_18px_40px_-18px_rgba(110,133,103,0.9)] transition-colors hover:bg-ink"
                >
                  Alege situația ta
                  <IconArrow className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
                <span className="font-sans text-[0.84rem] text-ink-muted">Chestionarul e gratuit</span>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {["Rezultat imediat", "Creat de un psihoterapeut", "Confidențial"].map((t) => (
                  <li key={t} className="flex items-center gap-2 font-sans text-[0.88rem] text-ink">
                    <IconCheck className="h-4 w-4 text-periwinkle" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.15} className="relative">
              <Image
                src="/foto/kit-raport-ghid.webp"
                alt="Raportul personal și ghidul practic despre cuplu, divorț și familie, de Liliana Jgheban"
                width={1514}
                height={1154}
                priority
                sizes="(min-width: 1024px) 720px, 100vw"
                className="w-full lg:w-[118%] lg:max-w-none"
              />
              <div className="glass-strong absolute bottom-[8%] left-[4%] hidden p-4 sm:block">
                <p className="font-sans text-[0.75rem] text-ink-muted">Partea ta, cu raport personal</p>
                <p className="font-display text-[1.9rem] leading-none text-ink">
                  {PRET_PARTE_LEI} <span className="text-[1rem] text-ink-soft">lei</span>
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <Val culoare="var(--color-cream-deep)" />

        {/* ---------- Cele 6 părți ---------- */}
        <section id="parti" className="relative scroll-mt-24 overflow-hidden bg-cream-deep py-20 lg:py-28">
          <Lumina din="stanga" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal className="max-w-3xl">
              <p className="font-sans text-[0.85rem] text-periwinkle">Unde te afli acum?</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
                Alege situația care seamănă cu a <em className="not-italic text-periwinkle">ta</em>
              </h2>
              <p className="mt-5 font-sans text-[0.98rem] leading-[1.85] text-ink-soft">
                Dacă nu știi de unde să pornești, începe cu prima. Primele întrebări din orice chestionar arată oricum
                ce parte ți se potrivește.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {PARTI.map((p, i) => {
                const c = CHESTIONARE.find((x) => x.parte === p.nr)!;
                return (
                  <Reveal key={p.nr} delay={Math.min(i * 0.06, 0.3)}>
                    <Link
                      href={`/kit/${p.slug}`}
                      className="glass group flex h-full flex-col p-7 transition-colors hover:bg-white/70"
                    >
                      <p className="font-sans text-[0.75rem] tracking-[0.04em] text-periwinkle">
                        PARTEA {p.nr} · {p.titlu.toUpperCase()}
                      </p>
                      <h3 className="mt-3 font-display text-[1.4rem] leading-snug text-ink">{c.carlig}</h3>
                      <p className="mt-3 flex-1 font-sans text-[0.9rem] leading-[1.75] text-ink-soft">{p.pentruCine}</p>
                      <p className="mt-5 inline-flex items-center gap-2 font-sans text-[0.9rem] text-periwinkle">
                        Fă chestionarul gratuit
                        <IconArrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </p>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <Val culoare="var(--color-cream)" varianta={2} />

        {/* ---------- Cum funcționează ---------- */}
        <section className="relative overflow-hidden bg-cream py-20 lg:py-28">
          <Lumina din="dreapta" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal className="max-w-2xl">
              <p className="font-sans text-[0.85rem] text-periwinkle">Cum funcționează</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
                De la o întrebare la un <em className="not-italic text-periwinkle">plan</em>
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PASI.map((p, i) => (
                <Reveal key={p.nr} delay={Math.min(i * 0.08, 0.3)}>
                  <div className="glass h-full p-7">
                    <span className="flex h-11 w-11 items-center justify-center bg-periwinkle-pale text-periwinkle">
                      <p.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="mt-5 font-display text-[1.25rem] text-ink">{p.titlu}</h3>
                    <p className="mt-2 font-sans text-[0.88rem] leading-[1.8] text-ink-soft">{p.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-10">
              <div className="flex flex-col gap-4 border-l-2 border-periwinkle bg-periwinkle-pale/50 px-6 py-5 sm:flex-row sm:items-center">
                <BookOpen className="h-6 w-6 shrink-0 text-periwinkle" aria-hidden />
                <p className="font-sans text-[0.92rem] leading-relaxed text-ink-soft">
                  Fiecare parte vine din „{NUME_GHID}”, scris de Liliana Jgheban, și are introducerea, capitolele ei,
                  concluziile și bibliografia ghidului.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <Val culoare="var(--color-ink)" />

        {/* ---------- Ce spun cercetările ---------- */}
        <section className="grain relative overflow-hidden bg-ink py-20 lg:py-28">
          <Lumina varianta="noapte" din="stanga" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal className="max-w-3xl">
              <p className="font-sans text-[0.85rem] text-periwinkle-light">Ce spun cercetările despre cuplu</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-cream sm:text-5xl">
                Cele mai multe cupluri cer ajutor <em className="not-italic text-periwinkle-light">prea târziu</em>
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {STATISTICI.map((s, i) => (
                <Reveal key={s.cifra} delay={Math.min(i * 0.08, 0.24)}>
                  <div className="glass-dark h-full p-7">
                    <p className="font-display text-[3rem] leading-none text-periwinkle-light">{s.cifra}</p>
                    <p className="mt-4 font-sans text-[0.93rem] leading-[1.8] text-cream/75">{s.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <p className="mt-4 font-sans text-[0.76rem] text-cream/45">
              Sursa: cercetările dr. John Gottman despre stabilitatea cuplului, The Gottman Institute.
            </p>
            <Reveal className="mt-14">
              <blockquote className="border-l-2 border-periwinkle-light pl-6">
                <p className="max-w-3xl font-display text-[1.5rem] italic leading-snug text-cream sm:text-[1.9rem]">
                  „Nu conflictele distrug relațiile, ci transformarea lor în conflicte distructive și nerezolvate.”
                </p>
                <footer className="mt-3 font-sans text-[0.85rem] text-cream/55">Liliana Jgheban, din ghid</footer>
              </blockquote>
            </Reveal>
          </div>
        </section>

        <Val culoare="var(--color-cream-deep)" />

        {/* ---------- Autoarea ---------- */}
        <section className="relative overflow-hidden bg-cream-deep py-20 lg:py-24">
          <Lumina din="stanga" />
          <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-6 md:grid-cols-[0.8fr_1.2fr] lg:px-10">
            <Reveal>
              <Image
                src="/foto/liliana-portret-2.jpg"
                alt="Liliana Jgheban, psihoterapeut integrativ"
                width={800}
                height={1000}
                sizes="(min-width: 768px) 360px, 100vw"
                className="aspect-[4/5] w-full object-cover"
              />
            </Reveal>
            <Reveal delay={0.12}>
              <p className="font-sans text-[0.85rem] text-periwinkle">Cine a scris ghidul</p>
              <h2 className="mt-3 font-display text-[2.2rem] leading-tight text-ink sm:text-[2.6rem]">
                Liliana <em className="not-italic text-periwinkle">Jgheban</em>
              </h2>
              <p className="mt-5 font-sans text-[0.96rem] leading-[1.85] text-ink-soft">
                Psihoterapeut integrativ și psiholog clinician, cu cabinet în București. Lucrează cu adulți, cupluri, copii și
                părinți, și a scris ghidul pentru oamenii care trec printr-o criză de cuplu, o separare sau începutul unei
                familii noi.
              </p>
              <p className="mt-4 font-sans text-[0.96rem] leading-[1.85] text-ink-soft">
                Chestionarele și ghidul nu țin locul unei ședințe, dar sunt un prim pas bun: te ajută să pui în cuvinte ce
                trăiești și să știi de unde să pornești.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#parti"
                  className="inline-flex items-center justify-center gap-2 bg-periwinkle px-7 py-4 font-sans text-[0.93rem] text-cream transition-colors hover:bg-ink"
                >
                  Alege situația ta
                  <IconArrow className="h-5 w-5" />
                </a>
                <Link
                  href="/programari"
                  className="inline-flex items-center justify-center gap-2 border border-ink/25 px-7 py-4 font-sans text-[0.93rem] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream"
                >
                  <CalendarDays className="h-5 w-5" aria-hidden />
                  Programează o ședință
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <Val culoare="var(--color-cream)" varianta={2} />

        {/* ---------- Întrebări frecvente ---------- */}
        {/* overflow-clip, nu hidden: altfel panoul Anei nu mai poate sta „sticky" */}
        <section className="relative overflow-clip bg-cream py-20 lg:py-28">
          <Lumina din="dreapta" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal>
              <p className="font-sans text-[0.85rem] text-periwinkle">Întrebări frecvente</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
                Ce e bine să <em className="not-italic text-periwinkle">știi</em>
              </h2>
            </Reveal>
            <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
              <div className="space-y-3">
                {INTREBARI_FRECVENTE.map((f) => (
                  <Reveal key={f.q}>
                    <details className="glass group p-6">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-[1.1rem] text-ink [&::-webkit-details-marker]:hidden">
                        {f.q}
                        <span
                          aria-hidden
                          className="flex h-8 w-8 shrink-0 items-center justify-center bg-periwinkle-pale font-sans text-lg text-periwinkle transition-colors group-open:bg-periwinkle group-open:text-cream"
                        >
                          <span className="group-open:hidden">+</span>
                          <span className="hidden group-open:inline">−</span>
                        </span>
                      </summary>
                      <p className="mt-4 font-sans text-[0.92rem] leading-[1.85] text-ink-soft">{f.a}</p>
                    </details>
                  </Reveal>
                ))}
              </div>
              <Reveal delay={0.1} className="lg:sticky lg:top-28">
                <AnaPanou
                  intro="Nu ai găsit răspunsul în listă? Întreabă-mă orice: ce chestionar ți se potrivește, ce primești sau cum se plătește."
                  sugestii={["Ce chestionar mi se potrivește?", "Ce primesc pentru 59 de lei?", "Ne-am despărțit deja. Mă ajută?"]}
                />
              </Reveal>
            </div>
          </div>
        </section>

        <Val culoare="var(--color-ink)" />

        {/* ---------- Final ---------- */}
        <section className="grain relative overflow-hidden bg-ink py-20 lg:py-28">
          <Lumina varianta="noapte" din="dreapta" />
          <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-10">
            <Reveal>
              <p className="font-sans text-[0.85rem] text-periwinkle-light">Primul pas</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-cream sm:text-5xl">
                Nu trebuie să știi încă ce vrei. <em className="not-italic text-periwinkle-light">Doar să vezi clar.</em>
              </h2>
              <p className="mx-auto mt-6 max-w-xl font-sans text-[0.98rem] leading-[1.85] text-cream/70">
                Cinci minute de întrebări, gratuit. Apoi decizi tu dacă vrei raportul personal și partea din ghid care ți se
                potrivește.
              </p>
              <a
                href="#parti"
                className="group mt-9 inline-flex items-center justify-center gap-3 bg-periwinkle-light px-9 py-4 font-sans text-[0.97rem] text-ink transition-colors hover:bg-cream"
              >
                Alege situația ta
                <IconArrow className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </Reveal>

            <div className="mt-16 grid gap-4 text-left md:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  titlu: "Despre chestionare",
                  text: "Sunt create ca instrumente de reflecție, nu teste psihologice standardizate, și nu pun diagnostice.",
                },
                {
                  icon: FileText,
                  titlu: "Materiale digitale",
                  text: "Raportul și partea din ghid sunt în PDF. Le vezi imediat după plată, iar linkul îți vine pe email; verifică și folderul Spam.",
                },
                {
                  icon: MessageCircle,
                  titlu: "Dacă ești în pericol",
                  text: "Chestionarele nu sunt potrivite pentru situațiile de urgență. Sună la 112 sau la linia gratuită pentru victimele violenței domestice: 0800 500 333.",
                },
              ].map((n) => (
                <div key={n.titlu} className="border border-cream/12 p-5">
                  <p className="flex items-center gap-2 font-sans text-[0.85rem] text-cream">
                    <n.icon className="h-4 w-4 text-periwinkle-light" aria-hidden />
                    {n.titlu}
                  </p>
                  <p className="mt-2 font-sans text-[0.8rem] leading-relaxed text-cream/55">{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            ...PARTI.map((p) => ({
              "@context": "https://schema.org",
              "@type": "Product",
              name: `Partea ${p.nr}: ${p.titlu} · ${NUME_GHID}`,
              description: `${p.pentruCine} Cu raport personal, pe baza unui chestionar gratuit.`,
              image: `${SITE.url}/kit/opengraph-image`,
              brand: { "@type": "Brand", name: "Liliana Jgheban" },
              offers: {
                "@type": "Offer",
                price: String(PRET_PARTE_LEI),
                priceCurrency: "RON",
                availability: "https://schema.org/InStock",
                url: `${SITE.url}/kit/${p.slug}`,
              },
            })),
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: INTREBARI_FRECVENTE.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]),
        }}
      />
    </>
  );
}
