import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { metaPagina } from "@/lib/seo";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Lumina } from "@/components/ui/Lumina";
import { Reveal } from "@/components/ui/Reveal";
import { ChestionarParte } from "@/components/ghid/ChestionarParte";
import { Carte3D } from "@/components/ghid/Carte3D";
import { chestionar } from "@/lib/ghid/chestionare";
import { NUME_GHID, PARTI, PRET_PARTE_LEI, parteDupaSlug } from "@/lib/ghid/parti";

/* Chestionarul gratuit al unei părți din ghid: /kit/<slug>. */

export function generateStaticParams() {
  return PARTI.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = parteDupaSlug(slug);
  const c = chestionar(p?.nr);
  if (!p || !c) return {};
  return metaPagina({
    titlu: `${c.carlig} Chestionar gratuit`,
    descriere: `${c.promisiune} Apoi, dacă vrei, „Partea ${p.nr}: ${p.titlu}” din ghidul Lilianei Jgheban, cu raport personal, ${PRET_PARTE_LEI} lei.`,
    cale: `/kit/${p.slug}`,
  });
}

export default async function PaginaChestionar({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = parteDupaSlug(slug);
  const c = chestionar(p?.nr);
  if (!p || !c) notFound();

  return (
    <>
      <Nav />
      <main className="relative overflow-hidden bg-cream">
        <Lumina din="dreapta" />
        <div className="relative mx-auto max-w-3xl px-6 pb-24 pt-36 lg:px-10 lg:pt-44">
          <Reveal className="text-center">
            <p className="font-sans text-[0.85rem] text-periwinkle">
              Partea {p.nr} din ghid · {p.titlu}
            </p>
            <h1 className="mt-4 font-display text-[2.3rem] leading-[1.1] text-ink sm:text-[3rem]">{c.carlig}</h1>
            <p className="mx-auto mt-5 max-w-xl font-sans text-[0.98rem] leading-[1.85] text-ink-soft">{c.promisiune}</p>
          </Reveal>

          <div className="mt-10">
            <ChestionarParte nr={p.nr} />
          </div>

          <div className="mt-12 grid items-center gap-8 sm:grid-cols-[9.5rem_1fr]">
            <Carte3D parte={p} rotatieY={-24} rotatieX={5} grosime={16} className="mx-auto w-[9.5rem]" />
            <div>
              <p className="font-sans text-[0.9rem] text-ink">
                Ce cuprinde „Partea {p.nr}: {p.titlu}” din „{NUME_GHID}”:
              </p>
              <ul className="mt-2 space-y-1">
                {p.capitole.map((t) => (
                  <li key={t} className="font-sans text-[0.88rem] text-ink-soft">
                    · {t}
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-sans text-[0.82rem] leading-relaxed text-ink-muted">
                Situația ta e alta?{" "}
                <Link href="/kit#parti" className="text-periwinkle underline underline-offset-4 hover:text-ink">
                  Vezi toate cele 6 chestionare
                </Link>
                .
              </p>
            </div>
          </div>

          <p className="mt-10 text-center font-sans text-[0.78rem] leading-relaxed text-ink-muted">
            Chestionarul e un instrument de reflecție, nu un diagnostic, și nu înlocuiește o ședință de terapie. Răspunsurile
            tale rămân confidențiale.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
