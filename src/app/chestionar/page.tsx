import type { Metadata } from "next";
import {
  Castoro,
  Cormorant_Garamond,
  Fraunces,
  Lexend,
  Lora,
  Montserrat,
  Newsreader,
  Public_Sans,
  Source_Sans_3,
  Work_Sans,
} from "next/font/google";
import { db } from "@/lib/db";
import { BriefForm } from "@/components/brief/BriefForm";
import { OrbitRing } from "@/components/ui/OrbitFrame";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Câteva întrebări despre platformă",
  description:
    "Chestionar pentru stabilirea identității vizuale și a automatizărilor platformei.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/* Fonturile propuse, încărcate local ca specimenele să arate exact cum vor
   arăta pe site. Fiecare pereche primește variabilele ei. */
const f1d = Fraunces({ subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-spec-1-display" });
const f1b = Montserrat({ subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-spec-1-body" });
const f2d = Castoro({ subsets: ["latin", "latin-ext"], display: "swap", weight: "400", variable: "--font-spec-2-display" });
const f2b = Lexend({ subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-spec-2-body" });
const f3d = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "600"],
  variable: "--font-spec-3-display",
});
const f3b = Work_Sans({ subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-spec-3-body" });
const f4d = Lora({ subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-spec-4-display" });
const f4b = Source_Sans_3({ subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-spec-4-body" });
const f5d = Newsreader({ subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-spec-5-display" });
const f5b = Public_Sans({ subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-spec-5-body" });

const fontVars = [f1d, f1b, f2d, f2b, f3d, f3b, f4d, f4b, f5d, f5b]
  .map((f) => f.variable)
  .join(" ");

export default async function ChestionarPage() {
  const [rows, files] = await Promise.all([
    db.briefAnswer.findMany(),
    db.briefFile.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const initial = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const initialFiles = files.map((f) => ({
    id: f.id,
    fileName: f.fileName,
    size: f.size,
  }));

  return (
    <div className={fontVars}>
      <main className="grain relative min-h-screen overflow-hidden bg-cream-deep py-16 lg:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-0 h-[32rem] w-[32rem] rounded-full bg-periwinkle-pale/50 blur-3xl"
        />
        <OrbitRing
          className="-left-32 top-56 hidden lg:block"
          size="26rem"
          accent="sage"
          duration={70}
          dashed
        />

        <div className="relative mx-auto max-w-3xl px-5 sm:px-6">
          {/* Antet */}
          <header className="mb-10 text-center">
            <p className="font-sans text-[0.85rem] text-periwinkle">
              Platforma {SITE.name}
            </p>
            <h1 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-[2.75rem]">
              Bună ziua, revin cu câteva întrebări
            </h1>
            <p className="mx-auto mt-6 max-w-xl font-sans text-[0.95rem] leading-[1.9] text-ink-soft">
              Zece întrebări, una câte una. La multe dintre ele răspunzi doar
              apăsând pe o variantă. <span className="text-ink">Nu trebuie
              completate toate odată</span> — fiecare răspuns se salvează
              singur, deci poți închide pagina și reveni când ai răgaz.
            </p>
          </header>

          <BriefForm initial={initial} initialFiles={initialFiles} />

        </div>
      </main>
    </div>
  );
}
