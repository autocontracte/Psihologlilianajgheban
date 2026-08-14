import type { Metadata, Viewport } from "next";
import { Fraunces, Ibarra_Real_Nova, Montserrat } from "next/font/google";
import "./globals.css";
import { SITE } from "@/content/site";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
});

const ibarra = Ibarra_Real_Nova({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-ibarra",
});

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Psiholog & Psihoterapeut ${SITE.city}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "psiholog",
    "psihoterapeut",
    "psihoterapie integrativă",
    "consiliere parentală",
    "evaluare psihologică",
    "terapie copii",
    "terapie adolescenți",
    "Sandtray",
    "anxietate",
    "depresie",
    SITE.city,
  ],
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — Psiholog & Psihoterapeut`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Psiholog & Psihoterapeut`,
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
      className={`${fraunces.variable} ${ibarra.variable} ${montserrat.variable}`}
    >
      <body className="antialiased">
        {children}
        <WhatsAppButton />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Psychologist",
              name: SITE.name,
              description: SITE.description,
              url: SITE.url,
              telephone: SITE.phone,
              email: SITE.email,
              address: {
                "@type": "PostalAddress",
                addressLocality: SITE.city,
                addressCountry: "RO",
              },
              availableService: [
                "Psihoterapie integrativă individuală",
                "Consiliere parentală",
                "Evaluare clinică psihologică",
                "Workshopuri și intervenții de grup",
                "Intervenții experiențiale Sandtray",
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
