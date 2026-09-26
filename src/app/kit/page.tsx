import type { Metadata } from "next";
import { metaPagina } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  ChartColumn,
  ClipboardList,
  Download,
  FileText,
  HeartHandshake,
  Mail,
  Map,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { Lumina } from "@/components/ui/Lumina";
import { Val } from "@/components/ui/Val";
import { IconArrow, IconCheck } from "@/components/ui/Icons";
import { TestKit } from "@/components/kit/TestKit";
import { CalculatorTensiune } from "@/components/kit/CalculatorTensiune";
import { NUME_KIT, PRET_KIT_LEI } from "@/lib/kit";
import { INTREBARI_FRECVENTE } from "@/lib/kit/faq";
import { AnaPanou } from "@/components/ana/AnaPanou";
import { platileSuntActive } from "@/lib/stripe";
import { SITE } from "@/content/site";

/* ----------------------------------------------------------------------------
   Kitul „Cum stai, de fapt, cu relația ta?" — pagina de prezentare și testul.

   Structura urmează kit.emthrive.ro: promisiunea și prețul sus, ce spun
   cercetările, un calculator, ce primești, cum funcționează, testul chiar în
   pagină, autoarea, întrebări frecvente și precizările oneste de la final.
   -------------------------------------------------------------------------- */

export const metadata: Metadata = metaPagina({
  titlu: `Kit „${NUME_KIT}”: test, raport personal și ghid`,
  descriere: `Test de 30 de întrebări despre relația ta, raport personal detaliat în PDF și ghidul practic de 63 de pagini despre cuplu, divorț și familie, creat de psihologul Liliana Jgheban. ${PRET_KIT_LEI} lei.`,
  cale: "/kit",
});

const PE_SCURT = [
  { icon: ClipboardList, titlu: "Testul", text: "30 de afirmații despre relația ta, pe 6 dimensiuni. Acasă, în 10 minute." },
  { icon: FileText, titlu: "Raportul personal", text: "Interpretare detaliată și plan pe 30 de zile, pe ecran și în PDF." },
  { icon: BookOpen, titlu: "Ghidul practic", text: "63 de pagini despre cuplu, divorț și familie, scrise de Liliana." },
];

const STATISTICI = [
  {
    cifra: "6 ani",
    text: "atât așteaptă, în medie, un cuplu nefericit până să ceară ajutor. Între timp, tiparele se adâncesc.",
  },
  {
    cifra: "70%",
    text: "dintre conflictele unui cuplu sunt perpetue: nu se rezolvă definitiv, se gestionează. Contează cum vă certați, nu dacă.",
  },
  {
    cifra: "5 la 1",
    text: "e raportul dintre momentele bune și cele tensionate la cuplurile care rămân stabile în timp.",
  },
];

const CE_PRIMESTI = [
  {
    icon: ClipboardList,
    eticheta: "01 · Testul central",
    titlu: "„Cum stai, de fapt, cu relația ta?”",
    text: "30 de afirmații, grupate pe șase dimensiuni: comunicarea, conflictul, apropierea, încrederea, respectul și sentimentul de echipă. Îl completezi acasă, în ritmul tău.",
    mare: true,
  },
  {
    icon: ChartColumn,
    eticheta: "02 · Vizual",
    titlu: "Indicele relației",
    text: "Un scor de la 0 la 100 și profilul pe cele 6 dimensiuni: unde aveți resurse și unde e nevoie de grijă.",
  },
  {
    icon: Sparkles,
    eticheta: "03 · Personal",
    titlu: "Interpretare detaliată",
    text: "Scrisă pe baza răspunsurilor tale și a ghidului Lilianei: rezumat, tiparul relației, analiza fiecărei dimensiuni, puncte forte, zone de atenție.",
  },
  {
    icon: Map,
    eticheta: "04 · Direcție",
    titlu: "Plan pe 30 de zile",
    text: "Pași mici și concreți, săptămână cu săptămână. Plus întrebări pentru o discuție în doi.",
  },
  {
    icon: Download,
    eticheta: "05 · Al tău",
    titlu: "Raportul în PDF",
    text: "Tot raportul, într-un document îngrijit, pe care îl descarci, îl printezi și îl păstrezi.",
  },
  {
    icon: BookOpen,
    eticheta: "06 · Ghid practic",
    titlu: "Ghidul de 63 de pagini",
    text: "Prevenția crizei, separarea, copiii, co-parentajul și familia recompusă. Cu capitolele recomandate pentru tine.",
  },
  {
    icon: HeartHandshake,
    eticheta: "07 · Părinți",
    titlu: "Dacă aveți copii",
    text: "O secțiune dedicată în raport: ce trăiesc copiii, în funcție de vârstă, și ce îi protejează.",
  },
  {
    icon: Mail,
    eticheta: "08 · Oricând",
    titlu: "Acces pe email",
    text: "Primești linkul către raport și ghid pe email și revii la ele oricând vrei.",
  },
];

const PASI = [
  { nr: "01", titlu: "Răspunzi", text: "30 de afirmații, în jur de 10 minute. Răspunsurile se salvează pe măsură ce le dai." },
  { nr: "02", titlu: "Obții kitul", text: `Abia la final plătești ${PRET_KIT_LEI} lei, sigur, prin Stripe. Fără cont.` },
  { nr: "03", titlu: "Citești raportul", text: "Pe ecran, imediat, și în PDF. Linkul îți vine și pe email." },
  { nr: "04", titlu: "Alegi pasul următor", text: "Ghidul, o discuție în doi sau, dacă simți nevoia, o ședință cu Liliana." },
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
                Kit pentru cupluri, părinți care se separă și familii
              </span>
              <h1 className="mt-6 font-display text-[2.6rem] leading-[1.06] text-ink sm:text-[3.4rem] lg:text-[3.9rem]">
                Cum stai, de fapt, cu <em className="not-italic text-periwinkle">relația ta</em>?
              </h1>
              <p className="mt-6 max-w-xl font-sans text-[1.02rem] leading-[1.85] text-ink-soft">
                Un kit complet, făcut acasă, în ritmul tău: un test de 30 de întrebări, un raport personal detaliat pe
                care îl descarci în PDF și ghidul practic de 63 de pagini scris de Liliana Jgheban, psiholog clinician.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <a
                  href="#test"
                  className="group inline-flex items-center justify-center gap-3 bg-periwinkle px-8 py-4 font-sans text-[0.97rem] text-cream shadow-[0_18px_40px_-18px_rgba(110,133,103,0.9)] transition-colors hover:bg-ink"
                >
                  Începe testul
                  <span className="h-4 w-px bg-cream/40" aria-hidden />
                  {PRET_KIT_LEI} lei
                  <IconArrow className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
                <span className="font-sans text-[0.84rem] text-ink-muted">Plătești abia după ce termini testul</span>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {["Raport personal în PDF", "Creat de un psiholog clinician", "Confidențial"].map((t) => (
                  <li key={t} className="flex items-center gap-2 font-sans text-[0.88rem] text-ink">
                    <IconCheck className="h-4 w-4 text-periwinkle" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.15} className="relative">
              {/* Mockup-ul (raportul și ghidul) e decupat strâns și are fundal
                  transparent; pe ecrane mari iese puțin din coloană, ca să
                  domine hero-ul. */}
              <Image
                src="/foto/kit-raport-ghid.webp"
                alt="Raportul personal și ghidul „Cum stai, de fapt, cu relația ta?” de Liliana Jgheban"
                width={1514}
                height={1154}
                priority
                sizes="(min-width: 1024px) 720px, 100vw"
                className="w-full lg:w-[118%] lg:max-w-none"
              />
              <div className="glass-strong absolute bottom-[8%] left-[4%] hidden p-4 sm:block">
                <p className="font-sans text-[0.75rem] text-ink-muted">Tot kitul</p>
                <p className="font-display text-[1.9rem] leading-none text-ink">
                  {PRET_KIT_LEI} <span className="text-[1rem] text-ink-soft">lei</span>
                </p>
              </div>
            </Reveal>
          </div>

          <div className="relative mx-auto mt-14 grid max-w-7xl gap-4 px-6 sm:grid-cols-3 lg:px-10">
            {PE_SCURT.map((c, i) => (
              <Reveal key={c.titlu} delay={Math.min(i * 0.08, 0.24)}>
                <div className="glass flex h-full gap-4 p-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-periwinkle-pale text-periwinkle">
                    <c.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h2 className="font-display text-[1.15rem] text-ink">{c.titlu}</h2>
                    <p className="mt-1 font-sans text-[0.86rem] leading-[1.7] text-ink-soft">{c.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <Val culoare="var(--color-ink)" />

        {/* ---------- Ce spun cercetările + calculator ---------- */}
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
                <footer className="mt-3 font-sans text-[0.85rem] text-cream/55">
                  Liliana Jgheban, din ghidul inclus în kit
                </footer>
              </blockquote>
            </Reveal>

            <div id="calculator" className="mt-20 scroll-mt-28">
              <Reveal className="max-w-2xl">
                <p className="font-sans text-[0.85rem] text-periwinkle-light">Calculator</p>
                <h2 className="mt-4 font-display text-3xl leading-tight text-cream sm:text-4xl">
                  Cât timp din viața voastră ia <em className="not-italic text-periwinkle-light">tensiunea</em>?
                </h2>
                <p className="mt-4 font-sans text-[0.95rem] leading-[1.8] text-cream/70">
                  Mută cursoarele. Cifrele sunt aproximative, dar pentru multe cupluri sunt dureros de reale.
                </p>
              </Reveal>
              <Reveal className="mt-10">
                <CalculatorTensiune pretLei={PRET_KIT_LEI} />
              </Reveal>
            </div>
          </div>
        </section>

        <Val culoare="var(--color-cream)" varianta={2} />

        {/* ---------- Ce primești ---------- */}
        <section className="relative overflow-hidden bg-cream py-20 lg:py-28">
          <Lumina din="dreapta" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal className="max-w-3xl">
              <p className="font-sans text-[0.85rem] text-periwinkle">Ce primești</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
                Tot ce-ți trebuie ca să vezi <em className="not-italic text-periwinkle">clar</em> unde sunteți
              </h2>
              <p className="mt-5 font-sans text-[0.98rem] leading-[1.85] text-ink-soft">
                Un kit gândit de Liliana Jgheban pornind de la anii de lucru cu cupluri, părinți și familii. Nu o
                etichetă, ci o perspectivă și câțiva pași concreți.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {CE_PRIMESTI.map((c, i) => (
                <Reveal
                  key={c.titlu}
                  delay={Math.min(i * 0.06, 0.3)}
                  className={c.mare ? "sm:col-span-2 lg:row-span-1" : ""}
                >
                  <article className={`h-full p-7 ${c.mare ? "bg-ink text-cream" : "glass"}`}>
                    <span
                      className={`flex h-11 w-11 items-center justify-center ${c.mare ? "bg-cream/10 text-periwinkle-light" : "bg-periwinkle-pale text-periwinkle"}`}
                    >
                      <c.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <p className={`mt-5 font-sans text-[0.75rem] tracking-[0.04em] ${c.mare ? "text-periwinkle-light" : "text-periwinkle"}`}>
                      {c.eticheta.toUpperCase()}
                    </p>
                    <h3 className={`mt-2 font-display ${c.mare ? "text-[1.6rem] text-cream" : "text-[1.25rem] text-ink"}`}>
                      {c.titlu}
                    </h3>
                    <p className={`mt-3 font-sans text-[0.9rem] leading-[1.8] ${c.mare ? "text-cream/70" : "text-ink-soft"}`}>
                      {c.text}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
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
                De la prima întrebare la primul <em className="not-italic text-periwinkle">„aha”</em>
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PASI.map((p, i) => (
                <Reveal key={p.nr} delay={Math.min(i * 0.08, 0.3)}>
                  <div className="glass h-full p-7">
                    <span className="font-display text-[2rem] leading-none text-periwinkle/70">{p.nr}</span>
                    <h3 className="mt-4 font-display text-[1.25rem] text-ink">{p.titlu}</h3>
                    <p className="mt-2 font-sans text-[0.88rem] leading-[1.8] text-ink-soft">{p.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Val culoare="var(--color-cream)" varianta={2} />

        {/* ---------- Testul ---------- */}
        <section id="test" className="relative scroll-mt-24 overflow-hidden bg-cream py-20 lg:py-28">
          <Lumina din="dreapta" />
          <div className="relative mx-auto max-w-3xl px-6 lg:px-10">
            <TestKit pretLei={PRET_KIT_LEI} platesteActiv={platileSuntActive} />
            <p className="mt-6 text-center font-sans text-[0.78rem] leading-relaxed text-ink-muted">
              Raportul e psihoeducație, nu un diagnostic, și nu înlocuiește o ședință de terapie. Răspunsurile tale
              rămân confidențiale.
            </p>
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
                alt="Liliana Jgheban, psiholog clinician"
                width={800}
                height={1000}
                sizes="(min-width: 768px) 360px, 100vw"
                className="aspect-[4/5] w-full object-cover"
              />
            </Reveal>
            <Reveal delay={0.12}>
              <p className="font-sans text-[0.85rem] text-periwinkle">Cine a creat kitul</p>
              <h2 className="mt-3 font-display text-[2.2rem] leading-tight text-ink sm:text-[2.6rem]">
                Liliana <em className="not-italic text-periwinkle">Jgheban</em>
              </h2>
              <p className="mt-5 font-sans text-[0.96rem] leading-[1.85] text-ink-soft">
                Psiholog clinician și psihoterapeut integrativ, cu cabinet în București. Lucrează cu adulți, cupluri,
                copii și părinți, și a scris ghidul inclus în kit pentru oamenii care trec printr-o criză de cuplu, o
                separare sau începutul unei familii noi.
              </p>
              <p className="mt-4 font-sans text-[0.96rem] leading-[1.85] text-ink-soft">
                Kitul nu ține locul unei ședințe, dar e un prim pas bun: te ajută să pui în cuvinte ce trăiești și să
                știi de unde să pornești.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#test"
                  className="inline-flex items-center justify-center gap-2 bg-periwinkle px-7 py-4 font-sans text-[0.93rem] text-cream transition-colors hover:bg-ink"
                >
                  Începe testul
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
            {/* Stânga: întrebările. Dreapta: Ana, care știe tot despre kit. */}
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
                  intro="Nu ai găsit răspunsul în listă? Întreabă-mă orice despre kit: ce conține, cum se plătește, când primești raportul sau dacă ți se potrivește."
                  sugestii={["Ce primesc, concret?", "Cât durează testul?", "Mi se potrivește dacă ne-am despărțit?"]}
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
                Un test, un raport scris pentru tine și un ghid de păstrat. {PRET_KIT_LEI} lei, și o șansă reală ca peste
                un an să nu spui „aș fi vrut să știu asta mai devreme”.
              </p>
              <a
                href="#test"
                className="group mt-9 inline-flex items-center justify-center gap-3 bg-periwinkle-light px-9 py-4 font-sans text-[0.97rem] text-ink transition-colors hover:bg-cream"
              >
                Obține kitul
                <IconArrow className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
                {["Plată sigură", "Acces imediat", "Link pe email"].map((t) => (
                  <li key={t} className="flex items-center gap-2 font-sans text-[0.85rem] text-cream/70">
                    <IconCheck className="h-4 w-4 text-periwinkle-light" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>

            <div className="mt-16 grid gap-4 text-left md:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  titlu: "Despre test",
                  text: "Testul e creat de Liliana Jgheban ca instrument de reflecție; nu e un test psihologic standardizat și nu pune diagnostice.",
                },
                {
                  icon: FileText,
                  titlu: "Materiale digitale",
                  text: "Raportul și ghidul sunt în format PDF. Le vezi imediat după plată, iar linkul îți vine pe email; verifică și folderul Spam.",
                },
                {
                  icon: MessageCircle,
                  titlu: "Dacă ești în pericol",
                  text: "Kitul nu e potrivit pentru situațiile de urgență. Sună la 112 sau la linia gratuită pentru victimele violenței domestice: 0800 500 333.",
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
            {
              "@context": "https://schema.org",
              "@type": "Product",
              name: `Kit „${NUME_KIT}”`,
              description:
                "Test de 30 de întrebări despre relația de cuplu, raport personal detaliat în PDF și ghid practic de 63 de pagini despre cuplu, divorț și familie.",
              image: `${SITE.url}/kit/opengraph-image`,
              brand: { "@type": "Brand", name: "Liliana Jgheban" },
              offers: {
                "@type": "Offer",
                price: String(PRET_KIT_LEI),
                priceCurrency: "RON",
                availability: "https://schema.org/InStock",
                url: `${SITE.url}/kit`,
              },
            },
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
