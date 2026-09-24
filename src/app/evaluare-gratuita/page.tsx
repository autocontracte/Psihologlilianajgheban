import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { Lumina } from "@/components/ui/Lumina";
import { Val } from "@/components/ui/Val";
import { IconArrow, IconCheck } from "@/components/ui/Icons";
import { ChestionarConsiliere } from "@/components/consiliere/ChestionarConsiliere";
import { SITE } from "@/content/site";

/* ----------------------------------------------------------------------------
   Evaluare psihologică gratuită — landing page, după modelul kit.emthrive.ro:
   promisiunea clară sus, pentru cine e, ce primești, cum funcționează, testul
   chiar în pagină, ghidul ca pas următor, întrebări frecvente și, la final,
   precizările oneste despre ce este și ce nu este evaluarea.
   -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: "Evaluare psihologică gratuită pentru criza de cuplu și divorț",
  description:
    "Răspunzi la câteva întrebări despre relația ta și primești gratuit o interpretare personală, cu pași concreți, de la cabinetul psihologului Liliana Jgheban din București.",
  alternates: { canonical: `${SITE.url}/evaluare-gratuita` },
};

const PENTRU_CINE = [
  "vă certați aproape zilnic și nu mai știți cum să vorbiți",
  "te gândești dacă e cazul să vă despărțiți",
  "sunteți deja în separare sau în divorț",
  "îți faci griji pentru cum trăiesc copiii situația",
  "divorțul e în urmă, dar încă nu ți-ai revenit",
];

const CE_PRIMESTI = [
  {
    nr: "01",
    titlu: "Un chestionar scurt",
    text: "Câteva întrebări despre situația ta: în ce moment ești, ce te apasă, ce ți-ai dori. Îl completezi acasă, în ritmul tău.",
  },
  {
    nr: "02",
    titlu: "O interpretare personală, gratuită",
    text: "O reflecție caldă și clară, scrisă pornind de la răspunsurile tale și de la principiile din ghidul Lilianei. Nu un scor, ci o perspectivă.",
  },
  {
    nr: "03",
    titlu: "Pași concreți",
    text: "Câteva lucruri pe care le poți face de mâine: pentru tine, pentru relație și, dacă există, pentru copii.",
  },
  {
    nr: "04",
    titlu: "Dacă simți nevoia, o discuție",
    text: "Interpretarea e un punct de plecare. Dacă vrei să mergi mai departe, te poți programa la o ședință cu Liliana, în cabinet sau online.",
  },
];

const PASI = [
  { nr: "01", titlu: "Răspunzi", text: "Câteva minute, cu răspunsurile salvate pe măsură ce le dai." },
  { nr: "02", titlu: "Primești interpretarea", text: "Apare imediat, pe ecran. Fără card și fără cont." },
  { nr: "03", titlu: "O citești în liniște", text: "Păstrezi linkul și revii la ea oricând." },
  { nr: "04", titlu: "Alegi pasul următor", text: "Ghidul complet, o ședință sau, pur și simplu, timp de gândit." },
];

const INTREBARI_FRECVENTE = [
  {
    q: "Evaluarea este cu adevărat gratuită?",
    a: "Da. Chestionarul și interpretarea personală sunt gratuite, fără card și fără cont. Ghidul complet în PDF e opțional și se cumpără separat, doar dacă îl vrei.",
  },
  {
    q: "Este un test psihologic acreditat?",
    a: "Nu. Este un chestionar de reflecție, creat de Liliana pe baza ghidului ei despre divorț, nu un test psihologic standardizat. Te ajută să vezi mai clar unde ești, dar nu pune diagnostice. Pentru o evaluare clinică psihologică, te poți programa la o ședință.",
  },
  {
    q: "Cine scrie interpretarea?",
    a: "Interpretarea e generată automat, pe baza răspunsurilor tale și a principiilor din ghidul Lilianei, cu reguli stricte: fără diagnostice, fără sfaturi juridice sau medicale. Dacă vrei o părere de specialist, o ședință cu Liliana e pasul potrivit.",
  },
  {
    q: "Ce se întâmplă cu răspunsurile mele?",
    a: "Sunt folosite doar pentru interpretarea ta și rămân confidențiale. Adresa de e-mail e opțională; dacă o lași, Liliana îți poate scrie.",
  },
  {
    q: "Pot face evaluarea împreună cu partenerul?",
    a: "Chestionarul e gândit pentru o singură persoană, pentru că fiecare trăiește situația altfel. Dacă vreți amândoi, fiecare îl poate completa separat.",
  },
  {
    q: "Înlocuiește o ședință de terapie?",
    a: "Nu. E o reflecție de psihoeducație, utilă ca punct de plecare. O ședință îți oferă ce nu poate oferi un text: cineva care te ascultă și lucrează cu tine, pe situația ta.",
  },
];

export default function EvaluareGratuitaPage() {
  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-cream pb-20 pt-36 lg:pb-28 lg:pt-44">
          <Lumina din="dreapta" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
            <Reveal>
              <span className="inline-flex items-center gap-2 bg-periwinkle-pale px-4 py-2 font-sans text-[0.8rem] text-periwinkle">
                Gratuit, fără card, în câteva minute
              </span>
              <h1 className="mt-6 font-display text-[2.6rem] leading-[1.08] text-ink sm:text-[3.4rem] lg:text-[3.9rem]">
                Evaluare psihologică gratuită pentru{" "}
                <em className="not-italic text-periwinkle">relația ta</em>
              </h1>
              <p className="mt-6 max-w-xl font-sans text-[1.02rem] leading-[1.85] text-ink-soft">
                Pentru momentele în care relația doare: certuri, gânduri de despărțire, un divorț în
                curs sau unul care încă apasă. Răspunzi la câteva întrebări și primești, pe loc, o
                interpretare personală și pași concreți.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#evaluare"
                  className="group inline-flex items-center justify-center gap-2.5 bg-periwinkle px-8 py-4 font-sans text-[0.97rem] text-cream shadow-[0_18px_40px_-18px_rgba(110,133,103,0.9)] transition-colors hover:bg-ink"
                >
                  Începe evaluarea gratuită
                  <IconArrow className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {["Interpretare personală", "Creat de un psiholog clinician", "Confidențial"].map((t) => (
                  <li key={t} className="flex items-center gap-2 font-sans text-[0.88rem] text-ink">
                    <IconCheck className="h-4 w-4 text-periwinkle" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* O întrebare reală din chestionar, ca să vezi ce te așteaptă */}
            <Reveal delay={0.2} className="relative mx-auto w-full max-w-md">
              <div className="glass-strong p-7 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="h-1 flex-1 bg-cream-deep">
                    <div className="h-full w-1/3 bg-periwinkle" />
                  </div>
                  <span className="font-sans text-[0.75rem] text-ink-muted">2 / 7</span>
                </div>
                <p className="mt-6 font-display text-[1.35rem] leading-snug text-ink">
                  Ce te apasă cel mai mult acum?
                </p>
                <p className="mt-1 font-sans text-[0.8rem] text-ink-muted">Poți alege mai multe.</p>
                <div className="mt-5 space-y-2">
                  {[
                    ["Lipsa comunicării", true],
                    ["Cum îi afectează pe copii", true],
                    ["Singurătatea și teama de viitor", false],
                    ["Gestionarea propriilor emoții", false],
                  ].map(([t, ales]) => (
                    <div
                      key={t as string}
                      className={[
                        "flex items-center gap-3 px-4 py-3 font-sans text-[0.88rem]",
                        ales ? "bg-periwinkle text-cream" : "bg-white/60 text-ink",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex h-4 w-4 shrink-0 items-center justify-center border",
                          ales ? "border-cream bg-cream text-periwinkle" : "border-ink/25",
                        ].join(" ")}
                      >
                        {ales && <IconCheck className="h-3 w-3" />}
                      </span>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-strong absolute -bottom-8 -left-6 hidden max-w-[16rem] p-4 sm:block">
                <p className="font-sans text-[0.78rem] text-periwinkle">Exemplu de interpretare</p>
                <p className="mt-1 font-display text-[0.98rem] italic leading-snug text-ink">
                  „E firesc ca tăcerea dintre voi să doară mai mult decât certurile…”
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <Val culoare="var(--color-cream-deep)" />

        {/* Pentru cine */}
        <section className="relative overflow-hidden bg-cream-deep py-20 lg:py-28">
          <Lumina din="stanga" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center lg:px-10">
            <Reveal>
              <p className="font-sans text-[0.85rem] text-periwinkle">Pentru cine e</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
                Pentru tine, dacă <em className="not-italic text-periwinkle">relația doare</em>
              </h2>
              <p className="mt-6 font-sans text-[0.98rem] leading-[1.85] text-ink-soft">
                Nu trebuie să știi dinainte ce vrei să faci. Evaluarea te ajută tocmai să vezi mai clar
                unde ești și ce ai putea face mai departe.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <ul className="space-y-3">
                {PENTRU_CINE.map((t) => (
                  <li key={t} className="glass flex items-start gap-4 p-5 font-sans text-[0.95rem] text-ink">
                    <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-periwinkle" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        <Val culoare="var(--color-cream)" varianta={2} />

        {/* Ce primești */}
        <section className="relative overflow-hidden bg-cream py-20 lg:py-28">
          <Lumina din="dreapta" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal className="max-w-2xl">
              <p className="font-sans text-[0.85rem] text-periwinkle">Ce primești</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
                O perspectivă, nu o <em className="not-italic text-periwinkle">etichetă</em>
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {CE_PRIMESTI.map((c, i) => (
                <Reveal key={c.nr} delay={Math.min(i * 0.08, 0.3)}>
                  <article className="glass h-full p-8">
                    <span className="font-display text-[2.2rem] leading-none text-periwinkle/70">{c.nr}</span>
                    <h3 className="mt-4 font-display text-[1.4rem] text-ink">{c.titlu}</h3>
                    <p className="mt-3 font-sans text-[0.92rem] leading-[1.85] text-ink-soft">{c.text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Val culoare="var(--color-ink)" />

        {/* Cum funcționează */}
        <section className="grain relative overflow-hidden bg-ink py-20 lg:py-28">
          <Lumina varianta="noapte" din="stanga" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal className="max-w-2xl">
              <p className="font-sans text-[0.85rem] text-periwinkle-light">Cum funcționează</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-cream sm:text-5xl">
                Patru pași, <em className="not-italic text-periwinkle-light">fără grabă</em>
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PASI.map((p, i) => (
                <Reveal key={p.nr} delay={Math.min(i * 0.08, 0.3)}>
                  <div className="glass-dark h-full p-7">
                    <span className="font-display text-[2rem] leading-none text-periwinkle-light/80">{p.nr}</span>
                    <h3 className="mt-4 font-display text-[1.25rem] text-cream">{p.titlu}</h3>
                    <p className="mt-2 font-sans text-[0.88rem] leading-[1.8] text-cream/65">{p.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Val culoare="var(--color-cream)" varianta={2} />

        {/* Evaluarea propriu-zisă */}
        <section id="evaluare" className="relative scroll-mt-28 overflow-hidden bg-cream py-20 lg:py-28">
          <Lumina din="dreapta" />
          <div className="relative mx-auto max-w-3xl px-6 lg:px-10">
            <ChestionarConsiliere mod="evaluare" />
            <p className="mt-6 text-center font-sans text-[0.78rem] leading-relaxed text-ink-muted">
              Interpretarea e o reflecție de psihoeducație, nu un diagnostic, și nu înlocuiește o
              ședință de terapie. Răspunsurile tale rămân confidențiale.
            </p>
          </div>
        </section>

        <Val culoare="var(--color-cream-deep)" />

        {/* Ghidul, ca pas următor */}
        <section className="relative overflow-hidden bg-cream-deep py-20 lg:py-24">
          <Lumina din="stanga" />
          <div className="relative mx-auto max-w-5xl px-6 lg:px-10">
            <Reveal>
              <div className="glass-strong grid gap-8 p-8 sm:p-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
                <div>
                  <p className="font-sans text-[0.85rem] text-periwinkle">Pentru cine vrea să meargă mai departe</p>
                  <h2 className="mt-3 font-display text-[2rem] leading-tight text-ink sm:text-[2.4rem]">
                    Ghidul practic despre <em className="not-italic text-periwinkle">divorț</em>
                  </h2>
                  <p className="mt-4 font-sans text-[0.95rem] leading-[1.85] text-ink-soft">
                    63 de pagini de psihoeducație, scrise de Liliana: cum previi ruptura, cum treci prin
                    separare, cum îi protejezi pe copii și cum îți reconstruiești viața. Îl poți cumpăra
                    direct din pagina interpretării tale.
                  </p>
                </div>
                <div className="lg:text-right">
                  <Link
                    href="/consiliere"
                    className="inline-flex items-center justify-center gap-2 bg-ink px-7 py-4 font-sans text-[0.93rem] text-cream transition-colors hover:bg-periwinkle"
                  >
                    Află mai multe despre ghid
                    <IconArrow className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <Val culoare="var(--color-cream)" varianta={2} />

        {/* Întrebări frecvente */}
        <section className="relative overflow-hidden bg-cream py-20 lg:py-28">
          <Lumina din="dreapta" />
          <div className="relative mx-auto max-w-3xl px-6 lg:px-10">
            <Reveal>
              <p className="font-sans text-[0.85rem] text-periwinkle">Întrebări frecvente</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
                Ce e bine să <em className="not-italic text-periwinkle">știi</em>
              </h2>
            </Reveal>
            <div className="mt-10 space-y-3">
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

            <Reveal className="mt-14 text-center">
              <a
                href="#evaluare"
                className="group inline-flex items-center justify-center gap-2.5 bg-periwinkle px-8 py-4 font-sans text-[0.97rem] text-cream transition-colors hover:bg-ink"
              >
                Începe evaluarea gratuită
                <IconArrow className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: INTREBARI_FRECVENTE.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </>
  );
}
