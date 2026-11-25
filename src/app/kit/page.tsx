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
import { Carte3D, clasaInteractiv } from "@/components/ghid/Carte3D";
import { Telefon3D } from "@/components/ghid/Telefon3D";

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
        {/* ---------- Hero: telefonul cu chestionarul și cărțile în evantai ---------- */}
        <section className="relative overflow-hidden bg-cream pb-20 pt-28 lg:pb-28 lg:pt-40">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -right-40 -top-40 h-[42rem] w-[42rem] rounded-full bg-periwinkle-pale/70 blur-3xl" />
            <div className="absolute -bottom-52 right-[20%] h-[30rem] w-[30rem] rounded-full bg-clay-pale/70 blur-3xl" />
            <div className="absolute -left-40 top-1/3 h-[26rem] w-[26rem] rounded-full bg-sage-pale/80 blur-3xl" />
          </div>
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:px-10">
            <Reveal>
              <span className="inline-flex items-center gap-2 border border-periwinkle/25 bg-cream-warm/80 px-4 py-2 font-sans text-[0.8rem] text-periwinkle backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-periwinkle" />
                6 chestionare gratuite · rezultat în 5 minute
              </span>
              <h1 className="mt-6 font-display text-[2.7rem] leading-[1.04] text-ink sm:text-[3.6rem] lg:text-[4.2rem]">
                Cum stai, de fapt, în <em className="not-italic text-periwinkle">relația ta</em>?
              </h1>
              <p className="mt-6 max-w-xl font-sans text-[1.04rem] leading-[1.85] text-ink-soft">
                Un chestionar scurt, ales după situația ta: o criză de cuplu, o despărțire, un divorț cu sau fără copii,
                viața după el sau o familie nouă. Afli unde ești și ce parte din ghidul Lilianei Jgheban, psihoterapeut, te
                poate ajuta acum.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                <a
                  href="#parti"
                  className="group inline-flex items-center justify-center gap-3 bg-periwinkle px-8 py-4 font-sans text-[0.97rem] text-cream shadow-[0_18px_40px_-18px_rgba(110,133,103,0.9)] transition-colors hover:bg-ink"
                >
                  Alege situația ta
                  <IconArrow className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
                <span className="font-sans text-[0.86rem] text-ink-muted">
                  Gratuit, fără cont. Partea ta din ghid: {PRET_PARTE_LEI} lei.
                </span>
              </div>
              <ul className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-ink/10 pt-6">
                {[
                  { cifra: "6", text: "părți din ghid" },
                  { cifra: "5 min", text: "un chestionar" },
                  { cifra: "1 PDF", text: "raport + partea ta" },
                ].map((x) => (
                  <li key={x.text}>
                    <p className="font-display text-[1.7rem] leading-none text-ink">{x.cifra}</p>
                    <p className="mt-1.5 font-sans text-[0.8rem] text-ink-muted">{x.text}</p>
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* Compoziția 3D: pe telefon stă deasupra titlului, mai compactă */}
            <Reveal delay={0.15} className="order-first lg:order-none">
              <div className="relative mx-auto h-[23rem] w-full max-w-[36rem] sm:h-[38rem]">
                <Carte3D
                  parte={PARTI[3]}
                  rotatieY={30}
                  rotatieX={4}
                  grosime={20}
                  className="absolute left-[0%] top-[8%] w-[34%] -rotate-[7deg]"
                />
                <Carte3D
                  parte={PARTI[5]}
                  rotatieY={-32}
                  rotatieX={4}
                  grosime={20}
                  className="absolute right-[2%] top-[4%] w-[31%] rotate-[6deg]"
                />
                <Carte3D
                  parte={PARTI[1]}
                  rotatieY={-18}
                  rotatieX={8}
                  grosime={22}
                  className="absolute bottom-[0%] left-[10%] w-[30%] -rotate-[2deg]"
                />
                <Telefon3D className="absolute left-[54%] top-[0%] w-[38%] -translate-x-1/2 sm:top-[4%] sm:w-[38%]" />
                <div className="glass-strong absolute bottom-[8%] right-[0%] hidden p-4 sm:block">
                  <p className="font-sans text-[0.75rem] text-ink-muted">Partea ta, cu raport personal</p>
                  <p className="font-display text-[1.9rem] leading-none text-ink">
                    {PRET_PARTE_LEI} <span className="text-[1rem] text-ink-soft">lei</span>
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <Val culoare="var(--color-cream-deep)" />

        {/* ---------- Raftul: cele 6 părți ---------- */}
        <section id="parti" className="relative scroll-mt-24 overflow-hidden bg-cream-deep py-20 lg:py-28">
          <Lumina din="stanga" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="font-sans text-[0.85rem] text-periwinkle">Unde te afli acum?</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
                Șase părți. Alege-o pe <em className="not-italic text-periwinkle">a ta</em>.
              </h2>
              <p className="mt-5 font-sans text-[0.98rem] leading-[1.85] text-ink-soft">
                Fiecare parte are chestionarul ei, gratuit. Dacă nu știi de unde să pornești, începe cu prima: primele
                întrebări arată oricum ce parte ți se potrivește.
              </p>
            </Reveal>
            <div className="mt-16 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {PARTI.map((p, i) => {
                const c = CHESTIONARE.find((x) => x.parte === p.nr)!;
                return (
                  <Reveal key={p.nr} delay={Math.min((i % 3) * 0.08, 0.24)}>
                    <Link href={`/kit/${p.slug}`} className={`group flex h-full flex-col ${clasaInteractiv}`}>
                      <div className="relative mx-auto w-[62%] max-w-[15rem] pb-6 pt-2">
                        <Carte3D parte={p} rotatieY={-24} rotatieX={5} grosime={18} />
                      </div>
                      <div className="glass mt-4 flex flex-1 flex-col p-7 transition-colors duration-500 group-hover:bg-white/75">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-sans text-[0.75rem] tracking-[0.06em] text-periwinkle">PARTEA {p.nr}</p>
                          <span className="font-sans text-[0.75rem] text-ink-muted">
                            {p.pagini} pagini · {PRET_PARTE_LEI} lei
                          </span>
                        </div>
                        <h3 className="mt-2 font-display text-[1.45rem] leading-snug text-ink">{c.carlig}</h3>
                        <p className="mt-3 flex-1 font-sans text-[0.9rem] leading-[1.75] text-ink-soft">{p.pentruCine}</p>
                        <p className="mt-6 inline-flex items-center gap-2 font-sans text-[0.92rem] text-periwinkle">
                          Fă chestionarul gratuit
                          <IconArrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </p>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <Val culoare="var(--color-cream)" varianta={2} />

        {/* ---------- Ce primești ---------- */}
        <section className="relative overflow-hidden bg-cream py-20 lg:py-28">
          <Lumina din="dreapta" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1fr_1fr] lg:px-10">
            <Reveal>
              <div className="relative mx-auto h-[26rem] w-full max-w-[30rem] sm:h-[30rem]">
                <Carte3D
                  parte={PARTI[3]}
                  rotatieY={-30}
                  rotatieX={6}
                  grosime={26}
                  className="absolute right-[4%] top-[4%] w-[52%]"
                />
                <Carte3D
                  parte={PARTI[3]}
                  eticheta="Raport personal · Partea 4"
                  titlu="Raportul tău"
                  motto="Scris pe răspunsurile tale, cu plan pe 30 de zile"
                  deschisa
                  rotatieY={-22}
                  rotatieX={6}
                  grosime={8}
                  className="absolute bottom-[2%] left-[4%] w-[46%] -rotate-[4deg]"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="font-sans text-[0.85rem] text-periwinkle">Ce primești pentru {PRET_PARTE_LEI} de lei</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
                Raportul tău și partea ta din ghid, <em className="not-italic text-periwinkle">într-un singur PDF</em>
              </h2>
              <ul className="mt-8 space-y-4">
                {[
                  { titlu: "Raport personal", text: "Scris pe răspunsurile tale: ce arată, ce contează acum, fiecare zonă explicată." },
                  { titlu: "Plan pe 30 de zile", text: "Pași mici și concreți, săptămână cu săptămână, plus întrebări de reflecție." },
                  { titlu: "Partea din ghid", text: "Capitolele care te privesc, cu ordinea în care merită citite în cazul tău." },
                  { titlu: "Al tău, oricând", text: "Pe ecran imediat după plată, în PDF și cu linkul pe email." },
                ].map((x) => (
                  <li key={x.titlu} className="flex gap-4">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center bg-periwinkle text-cream">
                      <IconCheck className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="font-display text-[1.15rem] text-ink">{x.titlu}</p>
                      <p className="mt-0.5 font-sans text-[0.9rem] leading-[1.75] text-ink-soft">{x.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <a
                href="#parti"
                className="group mt-9 inline-flex items-center justify-center gap-3 bg-ink px-8 py-4 font-sans text-[0.95rem] text-cream transition-colors hover:bg-periwinkle"
              >
                Începe cu chestionarul gratuit
                <IconArrow className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </Reveal>
          </div>
        </section>

        <Val culoare="var(--color-cream-deep)" />

        {/* ---------- Cum funcționează ---------- */}
        <section className="relative overflow-hidden bg-cream-deep py-20 lg:py-28">
          <Lumina din="stanga" />
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
                  <div className="glass relative h-full overflow-hidden p-7">
                    <span aria-hidden className="absolute -right-2 -top-4 font-display text-[5.5rem] leading-none text-periwinkle/10">
                      {p.nr}
                    </span>
                    <span className="relative flex h-11 w-11 items-center justify-center bg-periwinkle-pale text-periwinkle">
                      <p.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="relative mt-5 font-display text-[1.25rem] text-ink">{p.titlu}</h3>
                    <p className="relative mt-2 font-sans text-[0.88rem] leading-[1.8] text-ink-soft">{p.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-10">
              <div className="flex flex-col gap-4 border-l-2 border-periwinkle bg-cream/70 px-6 py-5 sm:flex-row sm:items-center">
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
