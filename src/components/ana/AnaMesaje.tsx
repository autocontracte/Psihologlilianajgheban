"use client";

import { SITE } from "@/content/site";
import { IconCalendar, IconPhone, IconWhatsApp } from "../ui/Icons";
import { AnaText } from "./AnaText";
import { SUGESTII, useAna } from "./useAna";

const waHref = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(SITE.whatsappMessage)}`;

/**
 * Mesajele conversației, sugestiile de început și — după ultima întrebare —
 * cele trei moduri de a lua legătura cu Liliana. Folosit în hero și în
 * fereastra plutitoare.
 */
export function AnaMesaje({
  onGo,
  faraSalut = false,
}: {
  onGo: (href: string) => void;
  /** În hero, salutul e de prisos: omul tocmai a început să scrie. */
  faraSalut?: boolean;
}) {
  const { turns, busy, error, gata, intrebari, trimite } = useAna();
  const vizibile = faraSalut && intrebari > 0 ? turns.slice(1) : faraSalut ? [] : turns;

  return (
    <div className="space-y-3">
      {vizibile.map((t, i) =>
        t.role === "assistant" && !t.content ? null : (
          <div
            key={i}
            className={
              t.role === "user"
                ? "ml-auto w-fit max-w-[85%] bg-periwinkle px-4 py-2.5 font-sans text-[0.9rem] leading-relaxed text-cream"
                : "glass w-fit max-w-[92%] px-4 py-3 font-sans text-[0.9rem] leading-[1.7] text-ink"
            }
          >
            {t.role === "assistant" ? <AnaText text={t.content} onGo={onGo} /> : t.content}
          </div>
        ),
      )}

      {busy && !turns[turns.length - 1]?.content && (
        <div className="glass inline-flex items-center gap-1.5 px-4 py-3.5" aria-label="Ana scrie">
          <i className="ana-punct" />
          <i className="ana-punct" />
          <i className="ana-punct" />
        </div>
      )}

      {error && <p className="bg-clay-pale px-4 py-2.5 font-sans text-[0.82rem] text-clay">{error}</p>}

      {intrebari === 0 && !busy && (
        <div className="flex flex-wrap gap-2 pt-1">
          {SUGESTII.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => trimite(s)}
              className="glass-btn px-3.5 py-2 font-sans text-[0.8rem] text-ink transition-colors hover:bg-periwinkle hover:text-cream"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {gata && (
        <div className="glass p-5">
          <p className="font-display text-[1.05rem] leading-snug text-ink">
            Restul se lămurește cel mai bine direct cu Liliana.
          </p>
          <p className="mt-2 font-sans text-[0.84rem] leading-relaxed text-ink-soft">
            Am ajuns la capătul întrebărilor pe care le pot primi aici. O ședință sau un telefon scurt
            îți răspund la tot, pe măsura situației tale.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => onGo("/programari")}
              className="inline-flex items-center justify-center gap-2 bg-periwinkle px-4 py-3 font-sans text-[0.88rem] text-cream transition-colors hover:bg-ink"
            >
              <IconCalendar className="h-4.5 w-4.5" />
              Programează o ședință
            </button>
            <a
              href={`tel:${SITE.phoneHref}`}
              className="glass-btn inline-flex items-center justify-center gap-2 px-4 py-3 font-sans text-[0.88rem] text-ink transition-colors hover:bg-ink hover:text-cream"
            >
              <IconPhone className="h-4.5 w-4.5" />
              Sună la {SITE.phone}
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="glass-btn inline-flex items-center justify-center gap-2 px-4 py-3 font-sans text-[0.88rem] text-ink transition-colors hover:bg-ink hover:text-cream"
            >
              <IconWhatsApp className="h-4.5 w-4.5" />
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
