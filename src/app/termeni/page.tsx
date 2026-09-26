import type { Metadata } from "next";
import { metaPagina } from "@/lib/seo";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { SITE } from "@/content/site";

export const metadata: Metadata = metaPagina({
  titlu: "Termeni și condiții",
  descriere:
    "Termenii și condițiile de utilizare a site-ului și de furnizare a serviciilor psihologice.",
  cale: "/termeni",
  robots: { index: false, follow: true },
});

/* Regulile de aici sunt cele pe care le aplică site-ul (anulare cu 24 de ore
   înainte, programare cu cel puțin 4 ore înainte, ora ținută 30 de minute
   pentru plata online). Dacă se schimbă în cod, se schimbă și aici.
   ⚠️ Recomandat: o verificare finală făcută de un jurist. */
const F = SITE.firma;

const sections: LegalSection[] = [
  {
    heading: "1. Cine suntem",
    paragraphs: [
      `Site-ul ${SITE.url.replace("https://", "")} aparține ${F.denumire} (${F.scurt}), CIF ${F.cif}, cu sediul în ${F.sediu}, prin care ${SITE.name}, psiholog clinician și psihoterapeut, oferă servicii psihologice.`,
      `Ședințele au loc la cabinetul din ${SITE.address} sau online. Prin folosirea site-ului confirmi că ai citit și accepți acești termeni.`,
    ],
  },
  {
    heading: "2. Informațiile de pe site nu înlocuiesc consultul",
    paragraphs: [
      "Conținutul publicat pe acest site, articolele, răspunsurile asistentei virtuale Ana și raportul din kit au caracter informativ. Nu constituie diagnostic, recomandare terapeutică sau consult psihologic și nu înlocuiesc o întâlnire profesională.",
      "Dacă te afli într-o situație de criză sau ai gânduri de a-ți face rău, sună imediat la 112.",
    ],
  },
  {
    heading: "3. Programări",
    bullets: [
      "Te poți programa online cu cel puțin 4 ore înainte de ședință.",
      "Dacă alegi plata la cabinet, cererea ta devine programare fermă după ce o confirmăm; primești confirmarea pe email.",
      "Dacă plătești online, ora e ținută pentru tine 30 de minute, cât durează plata. După plată, programarea e confirmată automat.",
      "Înainte de prima ședință semnezi online contractul de prestări servicii psihologice.",
    ],
  },
  {
    heading: "4. Anulări și reprogramări",
    bullets: [
      "Poți anula o ședință din contul tău cu cel puțin 24 de ore înainte. Mai târziu de atât, ne anunți telefonic.",
      "Pentru o ședință plătită online și anulată cu cel puțin 24 de ore înainte, alegi între reprogramare și returnarea integrală a banilor.",
      "Ședințele anulate cu mai puțin de 24 de ore înainte sau la care nu te prezinți pot fi tarifate integral.",
      "Dacă, rar, cabinetul trebuie să mute o ședință, te anunțăm cât mai din timp și găsim împreună altă oră; dacă nu îți convine niciuna, îți returnăm banii.",
    ],
  },
  {
    heading: "5. Tarife și plată",
    paragraphs: [
      "Tarifele sunt cele afișate pe site la momentul programării, în lei, și sunt finale. Poți plăti online, cu cardul, prin Stripe, sau la cabinet.",
    ],
  },
  {
    heading: "6. Kitul „Cum stai, de fapt, cu relația ta?”",
    paragraphs: [
      "Kitul este un produs digital: testul, raportul personal și ghidul practic, în format PDF. Îl plătești după ce termini testul și îl primești imediat, pe ecran și pe email.",
      "Conform legii (OUG nr. 34/2014), te poți răzgândi în 14 zile de la cumpărare: scrie-ne și îți returnăm banii în cel mult 14 zile, pe același card.",
      "Materialele din kit sunt pentru uzul tău personal și nu pot fi redistribuite.",
    ],
  },
  {
    heading: "7. Ședințele online",
    paragraphs: [
      "Ședințele online se desfășoară pe o platformă video securizată; linkul îl primești pe email înainte de ședință. Îți revine responsabilitatea de a asigura un spațiu privat și o conexiune stabilă la internet.",
    ],
  },
  {
    heading: "8. Confidențialitate",
    paragraphs: [
      "Toate informațiile discutate în cadrul ședințelor sunt confidențiale, în limitele prevăzute de lege și de Codul deontologic al profesiei de psiholog. Detalii complete găsești în Politica de confidențialitate.",
    ],
  },
  {
    heading: "9. Proprietate intelectuală",
    paragraphs: [
      "Textele, imaginile, ghidul și elementele grafice de pe acest site sunt protejate de drepturile de autor și nu pot fi reproduse fără acord scris.",
    ],
  },
  {
    heading: "10. Reclamații și soluționarea litigiilor",
    paragraphs: [
      `Dacă ceva nu a fost în regulă, scrie-ne la ${SITE.email}; căutăm întâi o soluție împreună.`,
      "Poți apela și la soluționarea alternativă a litigiilor, prin Autoritatea Națională pentru Protecția Consumatorilor (ANPC, anpc.ro/ce-este-sal). Litigiile nerezolvate pe cale amiabilă se soluționează de instanțele competente din România.",
    ],
  },
  {
    heading: "11. Contact",
    paragraphs: [
      `Pentru orice întrebare legată de acești termeni, ne poți scrie la ${SITE.email} sau ne poți suna la ${SITE.phone}.`,
    ],
  },
];

export default function TermeniPage() {
  return (
    <LegalPage
      title="Termeni și condiții"
      updated="septembrie 2026"
      intro="Condițiile în care poate fi folosit acest site și în care sunt oferite serviciile psihologice și kitul digital."
      sections={sections}
    />
  );
}
