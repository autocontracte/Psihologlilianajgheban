"use client";

import { useState } from "react";

/* ----------------------------------------------------------------------------
   Abonarea la calendarul ședințelor. Odată adăugat, calendarul clientului
   (Google, Apple, Outlook) aduce singur ședințele noi, mutate sau anulate.
   -------------------------------------------------------------------------- */

export function AbonamentCalendar({ url }: { url: string }) {
  const [copiat, setCopiat] = useState(false);
  const webcal = url.replace(/^https?:/, "webcal:");
  const google = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`;

  async function copiaza() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiat(true);
      setTimeout(() => setCopiat(false), 2500);
    } catch {
      window.prompt("Copiază linkul:", url);
    }
  }

  const buton =
    "inline-flex items-center justify-center rounded-none border border-ink/20 px-4 py-2 font-sans text-[0.8rem] tracking-[0.02em] text-ink transition-all duration-400 hover:border-periwinkle hover:text-periwinkle";

  return (
    <div className="rounded-none bg-cream p-6 shadow-[0_18px_44px_-32px_rgba(56,62,82,0.5)]">
      <h3 className="font-display text-[1.15rem] text-ink">Ședințele, direct în calendarul tău</h3>
      <p className="mt-2 font-sans text-[0.85rem] leading-relaxed text-ink-soft">
        Te abonezi o singură dată, iar ședințele apar singure în calendar. Dacă
        una se mută sau se anulează, se actualizează și acolo.
      </p>

      <div className="mt-4 flex flex-wrap gap-2.5">
        <a href={google} target="_blank" rel="noreferrer" className={buton}>
          Google Calendar
        </a>
        <a href={webcal} className={buton}>
          Apple / Outlook
        </a>
        <button type="button" onClick={copiaza} className={buton}>
          {copiat ? "Link copiat" : "Copiază linkul"}
        </button>
      </div>

      <p className="mt-3 font-sans text-[0.76rem] leading-relaxed text-ink-muted">
        Google Calendar reîmprospătează abonamentele de câteva ori pe zi, deci o
        ședință nouă poate apărea acolo cu o mică întârziere. Linkul e personal
        — nu îl da mai departe.
      </p>
    </div>
  );
}
