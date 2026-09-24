"use client";

import { SITE } from "@/content/site";
import { IconArrow } from "../ui/Icons";

/* Rutele pe care Ana are voie să le dea. Orice alt link rămâne text simplu. */
const RUTE = ["/programari", "/#", "/consiliere", "/blog"];
const waHref = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(SITE.whatsappMessage)}`;

const buton =
  "mx-0.5 my-0.5 inline-flex items-center gap-1 bg-periwinkle/12 px-2 py-0.5 align-baseline font-sans text-[0.84rem] text-periwinkle transition-colors hover:bg-periwinkle hover:text-cream";

/**
 * Textul Anei, cu linkurile scrise ca [text](/rută) transformate în butoane.
 * Parantezele de markdown nu rămân niciodată la vedere; nici steluțele de
 * îngroșare, pe care modelul le mai scapă.
 */
export function AnaText({ text, onGo }: { text: string; onGo: (href: string) => void }) {
  // fără îngroșări markdown și fără linii de pauză, chiar dacă modelul le mai scapă
  const curat = text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\s*[—–]\s*/g, ", ");
  const parti: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(\s*([^)\s]+)\s*\)/g;
  let ultim = 0;
  let m: RegExpExecArray | null;
  let k = 0;

  while ((m = re.exec(curat)) !== null) {
    if (m.index > ultim) parti.push(curat.slice(ultim, m.index));
    const [, eticheta, href] = m;

    if (href === "whatsapp" || href.includes("wa.me")) {
      parti.push(
        <a key={k++} href={waHref} target="_blank" rel="noreferrer" className={buton}>
          {eticheta} <IconArrow className="h-3 w-3" />
        </a>,
      );
    } else if (href.startsWith("tel:")) {
      parti.push(
        <a key={k++} href={`tel:${SITE.phoneHref}`} className={buton}>
          {eticheta} <IconArrow className="h-3 w-3" />
        </a>,
      );
    } else if (RUTE.some((r) => href === r || href.startsWith(r))) {
      parti.push(
        <button key={k++} type="button" onClick={() => onGo(href)} className={buton}>
          {eticheta} <IconArrow className="h-3 w-3" />
        </button>,
      );
    } else {
      parti.push(eticheta);
    }
    ultim = m.index + m[0].length;
  }
  if (ultim < curat.length) parti.push(curat.slice(ultim));

  return <span className="whitespace-pre-line">{parti}</span>;
}
