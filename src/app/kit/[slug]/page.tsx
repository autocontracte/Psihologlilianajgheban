import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { metaPagina } from "@/lib/seo";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Lumina } from "@/components/ui/Lumina";
import { Reveal } from "@/components/ui/Reveal";
import { IconCheck } from "@/components/ui/Icons";
import { ChestionarParte } from "@/components/ghid/ChestionarParte";
import { Carte3D } from "@/components/ghid/Carte3D";
import { CHESTIONARE, chestionarDupaSlug } from "@/lib/ghid/chestionare";
import { NUME_GHID, PRET_PARTE_LEI, parte as gasesteParte } from "@/lib/ghid/parti";

/* ----------------------------------------------------------------------------
   Pagina unui chestionar (/kit/<slug>), ca pagina unui produs: cartea părții
   în stânga, iar în dreapta titlul, prețul și chestionarul gratuit.
   -------------------------------------------------------------------------- */

export function generateStaticParams() {
  return CHESTIONARE.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = chestionarDupaSlug(slug);
  const p = gasesteParte(c?.parte);
  if (!p || !c) return {};
  return metaPagina({
    titlu: `${c.carlig} Chestionar gratuit`,
    descriere: `${c.promisiune} Apoi, dacă vrei, „Partea ${p.nr}: ${p.titlu}” din ghidul Lilianei Jgheban, cu raport personal, ${PRET_PARTE_LEI} lei.`,
    cale: `/kit/${c.slug}`,
  });
}

export default async function PaginaChestionar({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = chestionarDupaSlug(slug);
  const p = gasesteParte(c?.parte);
  if (!p || !c) notFound();

  return (
    <>
      <Nav />
      <main className="relative overflow-clip bg-cream">
        <Lumina din="dreapta" />
        <div aria-hidden className="pointer-events-none absolute -left-40 top-24 h-[34rem] w-[34rem] rounded-full bg-periwinkle-pale/60 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 pb-24 pt-28 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-10 lg:pt-40">
          {/* Stânga: cartea, ca la un magazin */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative mx-auto max-w-[26rem]">
              <div aria-hidden className="absolute inset-x-[8%] bottom-[6%] top-[14%] rounded-full bg-white/60 blur-2xl" />
              <Carte3D parte={p} rotatieY={-26} rotatieX={6} grosime={26} className="relative mx-auto w-[58%] lg:w-[72%]" />
            </div>
            <div className="mx-auto mt-10 hidden max-w-[26rem] lg:block">
              <p className="font-sans text-[0.78rem] tracking-[0.06em] text-ink-muted">CE CUPRINDE PARTEA {p.nr}</p>
              <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10">
                {p.capitole.map((t) => (
                  <li key={t} className="py-2.5 font-sans text-[0.9rem] text-ink-soft">
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-sans text-[0.8rem] text-ink-muted">
                {p.pagini} de pagini din „{NUME_GHID}”, cu introducerea și concluziile ghidului.
              </p>
            </div>
          </aside>

          {/* Dreapta: titlul, prețul și chestionarul */}
          <div>
            <Reveal>
              <nav className="font-sans text-[0.82rem] text-ink-muted" aria-label="Unde ești">
                <Link href="/kit" className="hover:text-ink">
                  Ghiduri
                </Link>{" "}
                / <span className="text-periwinkle">Partea {p.nr} din 4 · {p.titlu}</span>
              </nav>
              <h1 className="mt-4 font-display text-[2.3rem] leading-[1.08] text-ink sm:text-[3rem]">{c.carlig}</h1>
              <p className="mt-5 max-w-xl font-sans text-[1rem] leading-[1.85] text-ink-soft">{c.promisiune}</p>

              <div className="mt-7 grid max-w-xl grid-cols-2 border border-ink/12 bg-cream-warm/80">
                <div className="border-r border-ink/12 p-5">
                  <p className="font-sans text-[0.78rem] text-ink-muted">Chestionarul și rezultatul</p>
                  <p className="mt-1 font-display text-[1.6rem] leading-none text-ink">Gratuit</p>
                </div>
                <div className="p-5">
                  <p className="font-sans text-[0.78rem] text-ink-muted">Partea {p.nr} + raportul tău</p>
                  <p className="mt-1 font-display text-[1.6rem] leading-none text-ink">
                    {PRET_PARTE_LEI} <span className="text-[1rem] text-ink-soft">lei</span>
                  </p>
                </div>
              </div>
            </Reveal>

            <div id="chestionar" className="mt-8 scroll-mt-28">
              <ChestionarParte nr={c.id} faraTitlu />
            </div>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Rezultatul pe trei zone, imediat și gratuit",
                "Afli ce parte a ghidului ți se potrivește",
                `Raport personal și ${p.pagini} de pagini din ghid, ${PRET_PARTE_LEI} lei`,
                "Fără cont, iar răspunsurile rămân confidențiale",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 font-sans text-[0.9rem] text-ink">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-periwinkle" />
                  {t}
                </li>
              ))}
            </ul>

            {/* Pe telefon, cuprinsul vine după chestionar */}
            <div className="mt-10 lg:hidden">
              <p className="font-sans text-[0.78rem] tracking-[0.06em] text-ink-muted">CE CUPRINDE PARTEA {p.nr}</p>
              <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10">
                {p.capitole.map((t) => (
                  <li key={t} className="py-2.5 font-sans text-[0.9rem] text-ink-soft">
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-8 font-sans text-[0.86rem] leading-relaxed text-ink-soft">
              Nu știi sigur dacă asta e situația ta?{" "}
              <Link href="/kit#chestionar" className="text-periwinkle underline underline-offset-4 hover:text-ink">
                Fă chestionarul general
              </Link>{" "}
              sau{" "}
              <Link href="/kit#parti" className="text-periwinkle underline underline-offset-4 hover:text-ink">
                vezi toate părțile
              </Link>
              .
            </p>
            <p className="mt-6 font-sans text-[0.78rem] leading-relaxed text-ink-muted">
              Chestionarul e un instrument de reflecție, nu un diagnostic, și nu înlocuiește o ședință de terapie.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/** Doar cele 6 chestionare; orice altă adresă e 404. */
export const dynamicParams = false;
