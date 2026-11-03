import type { Metadata } from "next";
import { metaPagina } from "@/lib/seo";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { SITE } from "@/content/site";

export const metadata: Metadata = metaPagina({
  titlu: "Politica de confidențialitate",
  descriere:
    "Cum sunt colectate, folosite și protejate datele cu caracter personal transmise prin site.",
  cale: "/confidentialitate",
  robots: { index: false, follow: true },
});

/* Textul descrie ce face site-ul în realitate: ce date cere, unde ajung
   (furnizorii de mai jos) și cât stau. Dacă se adaugă un serviciu nou care
   primește date (facturare, statistici etc.), trebuie trecut și aici.
   ⚠️ Recomandat: o verificare finală făcută de un jurist. */
const F = SITE.firma;

const sections: LegalSection[] = [
  {
    heading: "1. Cine este operatorul datelor",
    paragraphs: [
      `Operatorul datelor cu caracter personal este ${F.denumire} (${F.scurt}), CIF ${F.cif}, cu sediul în ${F.sediu}. Ședințele au loc la cabinetul din ${SITE.address} sau online.`,
      `Pentru orice întrebare despre datele tale ne poți scrie la ${SITE.email} sau ne poți suna la ${SITE.phone}.`,
    ],
  },
  {
    heading: "2. Ce date colectăm",
    paragraphs: ["Colectăm doar datele de care avem nevoie pentru serviciul pe care îl ceri:"],
    bullets: [
      "Programări și contul de client: nume, email, telefon, programările tale (serviciul, data, formatul) și mesajul pe care îl lași la programare. Parola nu o cunoaștem: se păstrează doar sub formă criptată, ireversibil.",
      "Plata online: plata cu cardul se face prin Stripe. Datele cardului nu ajung la noi; păstrăm doar suma, data și referința plății.",
      "Contractul de prestări servicii: datele completate în contract (pentru un minor, și datele părinților), semnătura și, ca dovadă a semnării, data, adresa IP și browserul folosit.",
      "Trusa de ajutor „Cum stai, de fapt, în relația ta?”: răspunsurile la test, adresa de email, plata și raportul generat pentru tine.",
      "Ana, asistenta virtuală: întrebările pe care i le scrii. Te rugăm să nu îi scrii date despre sănătate sau alte informații sensibile.",
      "Formularul de contact: numele, emailul, telefonul și mesajul tău.",
      "Date tehnice: jurnalele serverului (adresa IP, pagina accesată, ora), folosite doar pentru securitate și pentru remedierea erorilor.",
    ],
  },
  {
    heading: "3. De ce folosim datele și pe ce temei",
    bullets: [
      "Ca să îți oferim serviciile cerute (programări, ședințe, contract, trusa de ajutor, răspunsuri la mesaje): executarea contractului sau demersurile de dinaintea lui (art. 6 alin. 1 lit. b GDPR).",
      "Ca să respectăm obligațiile legale, de exemplu cele financiar-contabile (art. 6 alin. 1 lit. c GDPR).",
      "Pentru securitatea site-ului și prevenirea abuzurilor: interesul nostru legitim (art. 6 alin. 1 lit. f GDPR).",
      "Ca să aflăm dacă reclamele Google Ads aduc vizite și programări: doar cu acordul tău, dat din bannerul de cookie-uri (art. 6 alin. 1 lit. a GDPR). Îl poți retrage oricând.",
      "Informațiile despre sănătatea psihică discutate în ședințe sunt prelucrate pentru furnizarea serviciilor psihologice, sub obligația de secret profesional (art. 9 alin. 2 lit. h GDPR).",
    ],
    paragraphs: [
      "Folosim datele doar în scopurile de mai jos. Nu le folosim pentru reclame personalizate, nu le vindem și nu facem profilare automată cu efecte asupra ta.",
    ],
  },
  {
    heading: "4. Cui transmitem datele",
    paragraphs: [
      "Datele ajung doar la furnizorii care ne ajută să facem site-ul să funcționeze, fiecare numai cu ce îi este necesar și numai în baza unui contract de prelucrare:",
    ],
    bullets: [
      "Hostinger: serverul pe care rulează site-ul și baza de date.",
      "Stripe: procesarea plăților cu cardul.",
      "Resend: trimiterea emailurilor automate (confirmări de programare, linkul către trusă).",
      "Google (Google Calendar): programările apar în calendarul Lilianei, cu numele, telefonul, emailul tău și serviciul ales.",
      "Google (Google Ads), doar dacă accepți cookie-urile: află că ai ajuns pe site dintr-o reclamă și dacă ai făcut o programare, cu un cod al programării și prețul ședinței. Nu primește numele, emailul, telefonul sau serviciul ales.",
      "OpenAI: generează răspunsurile Anei și interpretarea din raportul trusei. Primește textul întrebărilor, respectiv răspunsurile la test, fără numele sau datele tale de contact.",
      "Cloudflare: redirecționarea emailurilor trimise la adresa cabinetului.",
    ],
  },
  {
    heading: "5. Transferuri în afara Uniunii Europene",
    paragraphs: [
      "Unii dintre acești furnizori (Stripe, Resend, Google, OpenAI, Cloudflare) sunt companii din Statele Unite. Transferul se face în baza Cadrului UE-SUA privind confidențialitatea datelor sau a clauzelor contractuale standard aprobate de Comisia Europeană.",
    ],
  },
  {
    heading: "6. Cât timp păstrăm datele",
    bullets: [
      "Mesajele din formularul de contact: cât e nevoie ca să îți răspundem, apoi cel mult 12 luni.",
      "Contul de client: până când ceri ștergerea lui.",
      "Programările, plățile, contractele și documentele contabile: pe durata colaborării și apoi cât cer legislația financiar-contabilă și normele profesiei de psiholog.",
      "Trusa de ajutor: cât timp ai nevoie de acces la raport. Poți cere oricând ștergerea lui.",
      "Conversația cu Ana nu o păstrăm: stă doar în browserul tău, cât timp e deschisă fila.",
      "Jurnalele tehnice ale serverului: cel mult câteva luni.",
    ],
  },
  {
    heading: "7. Confidențialitatea actului psihologic",
    paragraphs: [
      "Informațiile discutate în cadrul ședințelor de psihoterapie sau evaluare sunt confidențiale și protejate de secretul profesional, conform Codului deontologic al profesiei de psiholog din România.",
      "Excepțiile sunt strict cele prevăzute de lege, în special situațiile în care există un risc real și iminent pentru siguranța ta sau a altei persoane.",
    ],
  },
  {
    heading: "8. Drepturile tale",
    paragraphs: ["Conform Regulamentului General privind Protecția Datelor (GDPR), ai dreptul:"],
    bullets: [
      "să afli ce date avem despre tine și să primești o copie a lor",
      "să ceri corectarea datelor greșite",
      "să ceri ștergerea datelor, în limitele obligațiilor legale de păstrare",
      "să ceri restricționarea prelucrării",
      "să primești datele într-un format pe care îl poți duce în altă parte (portabilitate)",
      "să te opui prelucrării bazate pe interesul legitim",
      "să depui plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP, www.dataprotection.ro)",
    ],
  },
  {
    heading: "9. Cum îți exerciți drepturile",
    paragraphs: [
      `Scrie-ne la ${SITE.email}. Îți răspundem în cel mult o lună de la primirea cererii. Ca să îți protejăm datele, s-ar putea să te rugăm să confirmi că ești tu.`,
    ],
  },
  {
    heading: "10. Cookie-uri",
    id: "cookie-uri",
    paragraphs: [
      "Fără acordul tău, site-ul folosește doar un cookie strict necesar, care te ține autentificat în cont. Conversația cu Ana e păstrată în memoria browserului tău (sessionStorage) și dispare când închizi fila.",
      "Dacă accepți din banner, se încarcă eticheta Google Ads (gtag.js), care pune cookie-uri Google ca să măsoare dacă vizita și programarea au venit dintr-o reclamă. Nu o folosim pentru reclame personalizate sau pentru liste de remarketing. Dacă refuzi, eticheta nu se încarcă deloc.",
      "Îți poți schimba alegerea oricând, din linkul „Cookie-uri” din subsolul site-ului.",
    ],
  },
  {
    heading: "11. Securitatea datelor",
    paragraphs: [
      "Site-ul folosește conexiune criptată (HTTPS). Parolele sunt păstrate criptat, ireversibil. Raportul trusei și contractele se deschid doar prin linkuri personale, imposibil de ghicit. Accesul la panoul de administrare e limitat la cabinet.",
    ],
  },
];

export default function ConfidentialitatePage() {
  return (
    <LegalPage
      title="Politica de confidențialitate"
      updated="noiembrie 2026"
      intro="Această pagină explică ce date cu caracter personal sunt colectate prin acest site, în ce scop sunt folosite, cui ajung și care sunt drepturile tale."
      sections={sections}
    />
  );
}
