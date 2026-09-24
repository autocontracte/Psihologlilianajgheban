import type { Metadata, Viewport } from "next";
import { Lora, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { PRICE, SITE } from "@/content/site";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Ana } from "@/components/ana/Ana";

/* Perechea aleasă de Liliana: Lora pentru titluri, Source Sans 3 pentru text. */
const lora = Lora({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-lora",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-source-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `Psiholog și psihoterapeut în ${SITE.city} | ${SITE.name}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "psiholog București",
    "psihoterapeut București",
    "psiholog clinician",
    "psihoterapie integrativă",
    "terapie online",
    "psiholog copii București",
    "terapie adolescenți",
    "consiliere parentală",
    "evaluare psihologică copii",
    "evaluare ADHD",
    "evaluare relație părinte-copil m&M",
    "anxietate",
    "atacuri de panică",
    "depresie",
    "burnout",
    "traumă",
    "NLP",
    "Sandtray",
  ],
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: SITE.url,
    siteName: SITE.name,
    title: `Psiholog și psihoterapeut în ${SITE.city} | ${SITE.name}`,
    description: SITE.description,
    images: [{ url: "/foto/liliana-portret-4.jpg", alt: `${SITE.name}, psiholog și psihoterapeut` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Psiholog și psihoterapeut în ${SITE.city} | ${SITE.name}`,
    description: SITE.description,
  },
  /* Cât timp SITE.indexable este false, fiecare pagină cere explicit să nu fie
     indexată. Doar robots.txt nu e de ajuns: dacă cineva pune un link către
     site, Google îl poate afișa oricum în rezultate. */
  robots: SITE.indexable
    ? { index: true, follow: true }
    : {
        index: false,
        follow: false,
        nocache: true,
        googleBot: { index: false, follow: false, noimageindex: true },
      },
  alternates: {
    canonical: SITE.url,
  },
};

export const viewport: Viewport = {
  themeColor: "#F2F3EC",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ro"
      className={`${lora.variable} ${sourceSans.variable}`}
    >
      <body className="antialiased">
        {children}
        <WhatsAppButton />
        <Ana />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Psychologist",
                "@id": `${SITE.url}/#cabinet`,
                name: SITE.name,
                description: SITE.description,
                url: SITE.url,
                image: `${SITE.url}/foto/liliana-portret-4.jpg`,
                telephone: SITE.phone,
                email: SITE.email,
                priceRange: `${PRICE.standard} ${PRICE.currency}`,
                address: {
                  "@type": "PostalAddress",
                  addressLocality: SITE.city,
                  addressCountry: "RO",
                },
                areaServed: [SITE.city, "România (online)"],
                openingHoursSpecification: [
                  { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "10:00", closes: "20:00" },
                  { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "10:00", closes: "14:00" },
                ],
                knowsAbout: [
                  "Psihoterapie integrativă",
                  "Psihoterapia copilului și adolescentului",
                  "Consiliere parentală",
                  "Evaluare clinică psihologică",
                  "Evaluare ADHD",
                  "Evaluarea relației părinte-copil m&M",
                  "Programare neuro-lingvistică (NLP)",
                  "Terapie Sandtray",
                  "Anxietate și atacuri de panică",
                  "Depresie",
                  "Burnout",
                  "Traumă",
                ],
                availableService: [
                  "Psihoterapie individuală pentru adulți",
                  "Psihoterapie pentru copii și adolescenți",
                  "Consiliere parentală",
                  "Evaluare clinică psihologică",
                  "Dezvoltare personală și NLP",
                  "Grupuri, ateliere și terapie Sandtray",
                ].map((name) => ({ "@type": "MedicalTherapy", name })),
              },
            ]),
          }}
        />
      </body>
    </html>
  );
}
