import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { Welcome } from "@/components/sections/Welcome";
import { Audiences } from "@/components/sections/Audiences";
import { Services } from "@/components/sections/Services";
import { About } from "@/components/sections/About";
import { Approach } from "@/components/sections/Approach";
import { Formats } from "@/components/sections/Formats";
import { TestsTeaser } from "@/components/sections/TestsTeaser";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";
import { Gallery } from "@/components/sections/Gallery";
import { Reviews } from "@/components/sections/Reviews";
import { Val } from "@/components/ui/Val";
import { FAQ } from "@/content/site";

/* Între două secțiuni cu fundaluri diferite stă un val în culoarea celei de
   dedesubt. Unde fundalul rămâne același, nu e nevoie de el. */
const INK = "var(--color-ink)";
const CREAM = "var(--color-cream)";
const DEEP = "var(--color-cream-deep)";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Val culoare={INK} />
        <Welcome />
        <Val culoare={CREAM} varianta={2} />
        <Audiences />
        <Val culoare={DEEP} />
        <Services />
        <Val culoare={CREAM} varianta={2} />
        <Gallery />
        <About />
        <Val culoare={INK} />
        <Approach />
        <Val culoare={CREAM} varianta={2} />
        <Formats />
        <Val culoare={DEEP} />
        <Reviews />
        <Val culoare={CREAM} varianta={2} />
        <TestsTeaser />
        <Val culoare={DEEP} />
        <Faq />
        <Contact />
      </main>
      <Footer />
      {/* Întrebările frecvente, în formatul pe care Google îl poate afișa direct în rezultate */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.items.map((f) => ({
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
