import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { ABOUT, DIPLOME, SITE } from "@/content/site";

/* Cine a scris articolul: pentru cititor (încredere) și pentru Google, care
   cere la conținutul despre sănătate să se vadă cine e autorul și ce
   pregătire are. Atestatele vin din DIPLOME, deci sunt cele documentate. */

export const PORTRET_AUTOR = "/foto/liliana-portret-4.jpg";

/** Atestatele de liberă practică (Colegiul Psihologilor), cele mai importante. */
export function atestateAutor() {
  return DIPLOME.documente.filter((d) => d.titlu.startsWith("Atestat"));
}

export function AutorArticol() {
  const atestate = atestateAutor();
  return (
    <aside
      aria-label="Despre autoare"
      className="flex flex-col gap-5 border border-ink/10 bg-cream-warm p-6 sm:flex-row sm:items-start lg:p-8"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PORTRET_AUTOR}
        alt={`${SITE.name}, ${SITE.role.toLowerCase()}`}
        className="h-24 w-24 shrink-0 rounded-full border border-ink/10 object-cover"
      />
      <div className="min-w-0">
        <p className="font-sans text-[0.75rem] tracking-[0.04em] text-ink-muted">Articol scris de</p>
        <p className="mt-1 font-display text-[1.35rem] leading-tight text-ink">{SITE.name}</p>
        <p className="mt-0.5 font-sans text-[0.88rem] text-sage">{SITE.role}</p>
        <p className="mt-3 font-sans text-[0.9rem] leading-relaxed text-ink-soft">{ABOUT.paragraphs[0]}</p>
        {atestate.length > 0 && (
          <ul className="mt-3 space-y-1 font-sans text-[0.84rem] text-ink-soft">
            {atestate.map((a) => (
              <li key={a.titlu} className="flex items-start gap-2">
                <BadgeCheck className="mt-[0.2rem] h-4 w-4 shrink-0 text-sage" aria-hidden="true" />
                <span>
                  {a.titlu} · {a.emitent}, {a.an}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/#despre"
          className="mt-4 inline-flex items-center gap-1 font-sans text-[0.86rem] text-periwinkle underline underline-offset-[3px] hover:text-ink"
        >
          Despre mine, formare și diplome
        </Link>
      </div>
    </aside>
  );
}
