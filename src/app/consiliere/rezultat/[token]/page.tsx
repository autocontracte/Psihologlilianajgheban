import { notFound } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { getComanda } from "@/lib/consiliere";

export const metadata = {
  title: "Rezultatul tău",
  robots: { index: false, follow: false },
};

export default async function RezultatPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const comanda = await getComanda(token);
  if (!comanda) notFound();

  const platit = comanda.status === "PAID";
  const interpretare = comanda.interpretation;

  return (
    <>
      <Nav />
      <main className="bg-cream-warm">
        <div className="mx-auto max-w-3xl px-6 pt-36 pb-24 lg:px-10 lg:pt-44">
          {!platit ? (
            <div className="border border-ink/10 bg-cream p-10 text-center">
              <h1 className="font-display text-2xl text-ink">Comanda nu e finalizată</h1>
              <p className="mx-auto mt-3 max-w-md font-sans text-[0.92rem] leading-relaxed text-ink-soft">
                Nu am înregistrat încă plata pentru acest ghid. Dacă tocmai ai
                plătit, reîncarcă pagina peste câteva secunde.
              </p>
              <Link
                href="/consiliere"
                className="mt-6 inline-flex bg-periwinkle px-7 py-3.5 font-sans text-[0.9rem] text-cream transition-colors hover:bg-ink"
              >
                Înapoi la ghid
              </Link>
            </div>
          ) : (
            <>
              <header className="text-center">
                <span className="inline-flex bg-periwinkle-pale px-5 py-2 font-sans text-[0.74rem] tracking-[0.02em] text-periwinkle">
                  Mulțumim
                </span>
                <h1 className="mt-6 font-display text-[2.1rem] leading-tight text-ink lg:text-[2.7rem]">
                  Interpretarea ta
                </h1>
              </header>

              <div className="mt-10 border border-ink/10 bg-cream p-8 sm:p-11">
                {interpretare ? (
                  <div className="space-y-4">
                    {interpretare.split(/\n\s*\n/).map((p, i) => (
                      <p key={i} className="font-sans text-[0.97rem] leading-[1.9] text-ink-soft">
                        {p}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-center font-sans text-[0.92rem] text-ink-soft">
                    Interpretarea ta se pregătește. Reîncarcă pagina peste puțin timp.
                  </p>
                )}
              </div>

              <div className="mt-8 border border-ink/10 bg-cream p-8 text-center">
                <h2 className="font-display text-[1.3rem] text-ink">Ghidul complet</h2>
                <p className="mx-auto mt-2 max-w-md font-sans text-[0.88rem] leading-relaxed text-ink-soft">
                  Cele 63 de pagini de psihoeducație despre divorț, ale tale de
                  păstrat.
                </p>
                <a
                  href={`/api/consiliere/${token}/pdf`}
                  className="mt-6 inline-flex items-center justify-center gap-2 bg-periwinkle px-8 py-4 font-sans text-[0.9rem] text-cream transition-colors hover:bg-ink"
                >
                  <span className="mi" style={{ fontSize: "1.2rem" }} aria-hidden="true">download</span>
                  Descarcă ghidul (PDF)
                </a>
              </div>

              <p className="mt-8 text-center font-sans text-[0.8rem] leading-relaxed text-ink-muted">
                Această interpretare e o reflecție de psihoeducație și nu
                înlocuiește o ședință de terapie. Dacă simți nevoia să vorbești cu
                cineva,{" "}
                <Link href="/programari" className="text-periwinkle underline underline-offset-4">
                  poți programa o ședință
                </Link>
                .
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export const dynamic = "force-dynamic";
