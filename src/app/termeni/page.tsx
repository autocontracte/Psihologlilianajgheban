import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Termeni și condiții",
  description:
    "Termenii și condițiile de utilizare a site-ului și de furnizare a serviciilor psihologice.",
  robots: { index: false, follow: true },
};

/* ⚠️ ȘABLON — de verificat de un jurist și de completat cu politica reală
   privind tarifele, anulările și modalitățile de plată. */
const sections: LegalSection[] = [
  {
    heading: "1. Despre acest site",
    paragraphs: [
      `Site-ul ${SITE.url.replace("https://", "")} prezintă serviciile psihologice oferite de ${SITE.name}, psiholog clinician și psihoterapeut.`,
      "Prin utilizarea site-ului confirmi că ai citit și accepți acești termeni.",
    ],
  },
  {
    heading: "2. Informațiile de pe site nu înlocuiesc consultul",
    paragraphs: [
      "Conținutul publicat pe acest site are caracter informativ. Nu constituie diagnostic, recomandare terapeutică sau consult psihologic și nu înlocuiește o întâlnire profesională.",
      "Dacă te afli într-o situație de criză sau ai gânduri de a-ți face rău, sună imediat la 112.",
    ],
  },
  {
    heading: "3. Programări",
    paragraphs: [
      "Trimiterea formularului de programare reprezintă o cerere, nu o rezervare confirmată. Programarea devine fermă doar după confirmarea transmisă de cabinet, telefonic sau prin email.",
    ],
  },
  {
    heading: "4. Anulări și reprogramări",
    paragraphs: [
      "Anularea sau reprogramarea unei ședințe se anunță cu cel puțin 24 de ore înainte. Ședințele anulate cu mai puțin de 24 de ore înainte sau la care nu te prezinți pot fi tarifate integral.",
      "⚠️ De completat cu politica exactă de anulare aplicată de cabinet.",
    ],
  },
  {
    heading: "5. Tarife și plată",
    paragraphs: [
      "Tarifele sunt comunicate înainte de prima ședință și pot fi actualizate periodic. Plata se face conform înțelegerii stabilite la începutul colaborării.",
      "⚠️ De completat cu tarifele și modalitățile de plată acceptate.",
    ],
  },
  {
    heading: "6. Ședințele online",
    paragraphs: [
      "Ședințele online se desfășoară pe o platformă video securizată. Îți revine responsabilitatea de a asigura un spațiu privat și o conexiune stabilă la internet pe durata ședinței.",
    ],
  },
  {
    heading: "7. Confidențialitate",
    paragraphs: [
      "Toate informațiile discutate în cadrul ședințelor sunt confidențiale, în limitele prevăzute de lege și de Codul deontologic al profesiei de psiholog. Detalii complete găsești în Politica de confidențialitate.",
    ],
  },
  {
    heading: "8. Proprietate intelectuală",
    paragraphs: [
      "Textele, imaginile și elementele grafice de pe acest site sunt protejate de drepturile de autor și nu pot fi reproduse fără acord scris.",
    ],
  },
  {
    heading: "9. Contact",
    paragraphs: [
      `Pentru orice întrebare legată de acești termeni, ne poți scrie la ${SITE.email} sau ne poți suna la ${SITE.phone}.`,
    ],
  },
];

export default function TermeniPage() {
  return (
    <LegalPage
      title="Termeni și condiții"
      updated="august 2026"
      intro="Condițiile în care poate fi folosit acest site și în care sunt oferite serviciile psihologice."
      sections={sections}
    />
  );
}
