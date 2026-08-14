import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Politica de confidențialitate",
  description:
    "Cum sunt colectate, folosite și protejate datele cu caracter personal transmise prin site.",
  robots: { index: false, follow: true },
};

/* ⚠️ ȘABLON — de verificat de un jurist înainte de lansare și de completat cu
   datele reale ale operatorului (nume complet, CUI/CIF, adresă, telefon). */
const sections: LegalSection[] = [
  {
    heading: "1. Cine este operatorul datelor",
    paragraphs: [
      `Operatorul datelor cu caracter personal colectate prin acest site este ${SITE.name}, cabinet individual de psihologie, cu sediul în ${SITE.city}.`,
      `Pentru orice întrebare legată de prelucrarea datelor tale, ne poți scrie la ${SITE.email}.`,
    ],
  },
  {
    heading: "2. Ce date colectăm",
    paragraphs: [
      "Colectăm doar datele pe care ni le transmiți voluntar prin formularele de pe site:",
    ],
    bullets: [
      "Nume și prenume",
      "Adresă de email",
      "Număr de telefon",
      "Serviciul pentru care ne contactezi și formatul preferat al ședinței",
      "Conținutul mesajului scris de tine",
    ],
  },
  {
    heading: "3. În ce scop folosim datele",
    paragraphs: [
      "Datele sunt folosite exclusiv pentru a-ți răspunde la mesaj și pentru a stabili o programare. Nu le folosim pentru marketing, nu le vindem și nu le transmitem către terți în scopuri comerciale.",
      "Temeiul legal al prelucrării este consimțământul tău, exprimat la trimiterea formularului, precum și interesul legitim de a răspunde solicitărilor primite.",
    ],
  },
  {
    heading: "4. Cât timp păstrăm datele",
    paragraphs: [
      "Mesajele primite prin formularele site-ului sunt păstrate atât timp cât este necesar pentru a răspunde solicitării, apoi cel mult 12 luni.",
      "Dacă devii client al cabinetului, datele legate de serviciile psihologice sunt păstrate separat, conform obligațiilor legale și deontologice ale profesiei de psiholog.",
    ],
  },
  {
    heading: "5. Confidențialitatea actului psihologic",
    paragraphs: [
      "Informațiile discutate în cadrul ședințelor de psihoterapie sau evaluare sunt confidențiale și protejate de secretul profesional, conform Codului deontologic al profesiei de psiholog din România.",
      "Excepțiile sunt strict cele prevăzute de lege — în special situațiile în care există un risc real și iminent pentru siguranța ta sau a altei persoane.",
    ],
  },
  {
    heading: "6. Drepturile tale",
    paragraphs: [
      "Conform Regulamentului General privind Protecția Datelor (GDPR), ai următoarele drepturi:",
    ],
    bullets: [
      "Dreptul de acces la datele tale",
      "Dreptul la rectificarea datelor inexacte",
      "Dreptul la ștergerea datelor",
      "Dreptul la restricționarea prelucrării",
      "Dreptul la portabilitatea datelor",
      "Dreptul de opoziție",
      "Dreptul de a depune plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)",
    ],
  },
  {
    heading: "7. Cookie-uri",
    paragraphs: [
      "Site-ul nu folosește cookie-uri de urmărire sau de publicitate. Sunt utilizate doar cookie-urile strict necesare pentru funcționarea corectă a paginilor.",
    ],
  },
  {
    heading: "8. Securitatea datelor",
    paragraphs: [
      "Site-ul folosește conexiune criptată (HTTPS). Aplicăm măsuri tehnice și organizatorice rezonabile pentru a proteja datele împotriva accesului neautorizat, pierderii sau divulgării.",
    ],
  },
];

export default function ConfidentialitatePage() {
  return (
    <LegalPage
      title="Politica de confidențialitate"
      updated="august 2026"
      intro="Această pagină explică ce date cu caracter personal sunt colectate prin acest site, în ce scop sunt folosite și care sunt drepturile tale."
      sections={sections}
    />
  );
}
