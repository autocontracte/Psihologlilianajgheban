import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="grain relative flex min-h-[80vh] items-center overflow-hidden bg-cream pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-periwinkle-pale/60 blur-3xl"
        />
        <div className="relative mx-auto max-w-2xl px-6 text-center lg:px-10">
          <p className="font-display text-7xl text-periwinkle/40 sm:text-8xl">
            404
          </p>
          <h1 className="mt-6 font-display text-3xl leading-tight text-ink sm:text-5xl">
            Pagina nu a fost găsită
          </h1>
          <p className="mx-auto mt-6 max-w-md font-sans text-[0.93rem] leading-[1.9] text-ink-soft">
            Se pare că adresa căutată nu mai există sau a fost mutată. Te poți
            întoarce la pagina principală.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button href="/">Înapoi acasă</Button>
            <Button href="/programari" variant="secondary" withArrow={false}>
              Programează o ședință
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
