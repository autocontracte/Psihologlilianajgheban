import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Lumina } from "@/components/ui/Lumina";
import { IconArrow, IconCalendar } from "@/components/ui/Icons";
import { CumparaGhidul } from "@/components/consiliere/CumparaGhidul";
import { eEvaluareGratuita, getComanda, PRET_GHID_BANI } from "@/lib/consiliere";
import { platileSuntActive } from "@/lib/stripe";

export const metadata = {
  title: "Interpretarea ta",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function RezultatEvaluare({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const comanda = await getComanda(token);
  if (!comanda) notFound();
  // Evaluarea a devenit între timp comandă de ghid: rezultatul e pe pagina ghidului
  if (!eEvaluareGratuita(comanda)) redirect(`/consiliere/rezultat/${token}`);

  const interpretare = comanda.interpretation;

  return (
    <>
      <Nav />
      <main className="relative overflow-hidden bg-cream-warm">
        <Lumina din="dreapta" />
        <div className="relative mx-auto max-w-3xl px-6 pb-24 pt-36 lg:px-10 lg:pt-44">
          <header className="text-center">
            <p className="font-sans text-[0.85rem] text-periwinkle">Evaluare psihologică gratuită</p>
            <h1 className="mt-4 font-display text-[2.2rem] leading-tight text-ink lg:text-[2.8rem]">
              Interpretarea <em className="not-italic text-periwinkle">ta</em>
            </h1>
          </header>

          <div className="glass-strong mt-10 p-8 sm:p-11">
            {interpretare ? (
              <div className="space-y-4">
                {interpretare.split(/\n\s*\n/).map((p, i) => (
                  <p key={i} className="font-sans text-[0.98rem] leading-[1.9] text-ink-soft">
                    {p}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-center font-sans text-[0.92rem] text-ink-soft">
                Interpretarea ta nu e gata încă. Reîncarcă pagina peste câteva momente.
              </p>
            )}
          </div>

          {/* Pasul firesc de după: o discuție */}
          <div className="glass mt-6 p-8 text-center">
            <h2 className="font-display text-[1.4rem] text-ink">Dacă vrei să vorbim</h2>
            <p className="mx-auto mt-2 max-w-md font-sans text-[0.9rem] leading-relaxed text-ink-soft">
              Interpretarea e un punct de plecare. Într-o ședință putem privi împreună, pe îndelete,
              ce se întâmplă în viața ta.
            </p>
            <Link
              href="/programari"
              className="mt-6 inline-flex items-center justify-center gap-2 bg-ink px-7 py-4 font-sans text-[0.93rem] text-cream transition-colors hover:bg-periwinkle"
            >
              <IconCalendar className="h-5 w-5" />
              Programează o ședință
            </Link>
          </div>

          {/* Ghidul complet */}
          <div className="glass mt-6 p-8">
            <p className="font-sans text-[0.82rem] text-periwinkle">Mergi mai departe</p>
            <h2 className="mt-1 font-display text-[1.5rem] text-ink">Ghidul practic despre divorț</h2>
            <p className="mt-3 font-sans text-[0.92rem] leading-[1.85] text-ink-soft">
              63 de pagini de psihoeducație: cum previi ruptura, cum treci prin separare, cum îi
              protejezi pe copii și cum îți reconstruiești viața de după. Interpretarea ta rămâne în
              comandă, iar ghidul îl primești în PDF, să îl ai mereu la îndemână.
            </p>
            <CumparaGhidul
              token={token}
              emailSalvat={comanda.email}
              pretLei={PRET_GHID_BANI / 100}
              platesteActiv={platileSuntActive}
            />
            <Link
              href="/consiliere"
              className="mt-4 inline-flex items-center gap-1.5 font-sans text-[0.85rem] text-periwinkle transition-colors hover:text-ink"
            >
              Află mai multe despre ghid
              <IconArrow className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-8 text-center font-sans text-[0.8rem] leading-relaxed text-ink-muted">
            Această interpretare e o reflecție de psihoeducație, nu un diagnostic, și nu înlocuiește o
            ședință de terapie. Păstrează linkul acestei pagini dacă vrei să o recitești.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
