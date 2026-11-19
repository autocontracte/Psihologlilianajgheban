import Link from "next/link";
import { BookOpen, CalendarDays, Download, FileText } from "lucide-react";
import { StareInterpretare } from "@/components/kit/StareInterpretare";
import { CumparaParte } from "@/components/ghid/CumparaParte";
import { paragrafe } from "@/lib/kit/raport";
import { NIVELURI, type Rezultat } from "@/lib/ghid/chestionare";
import { numeParte, type Parte } from "@/lib/ghid/parti";
import type { RaportParte } from "@/lib/ghid/raport";

/* ----------------------------------------------------------------------------
   Pagina rezultatului pentru ghidul pe părți.

   Înainte de plată: interpretarea generală (gratuită), partea recomandată și
   alegerea ei. După plată: descărcarea (raport + partea din ghid, un PDF) și
   raportul personal pe ecran.
   -------------------------------------------------------------------------- */

export function RezultatParte({
  token,
  platit,
  rezultat: rez,
  parte,
  ai,
  interpretareaActiva,
  platesteActiv,
  email,
}: {
  token: string;
  platit: boolean;
  rezultat: Rezultat;
  parte: Parte;
  ai: RaportParte | null;
  interpretareaActiva: boolean;
  platesteActiv: boolean;
  email: string;
}) {
  return (
    <>
      <header className="text-center">
        <p className="font-sans text-[0.85rem] text-periwinkle">
          {platit ? numeParte(parte) : `Rezultatul chestionarului · Partea ${rez.chestionar.parte}`}
        </p>
        <h1 className="mt-4 font-display text-[2.3rem] leading-tight text-ink lg:text-[3rem]">
          {platit ? (
            <>
              Raportul tău <em className="not-italic text-periwinkle">personal</em>
            </>
          ) : (
            rez.titlu
          )}
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-sans text-[0.92rem] leading-relaxed text-ink-soft">
          {platit
            ? "Citește-l în liniște, pe bucăți, și revino la el. Linkul acestei pagini e doar al tău."
            : "Mai jos vezi ce arată răspunsurile tale pe cele trei zone și ce parte a ghidului ți se potrivește acum."}
        </p>
      </header>

      {platit && (
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {ai || !interpretareaActiva ? (
            <Descarcare
              href={`/api/kit/${token}/raport`}
              icon={FileText}
              titlu="Raportul tău și partea din ghid"
              detaliu={`Un singur PDF: raportul, apoi ${parte.pagini} de pagini din ghid`}
            />
          ) : (
            <div className="glass flex items-center gap-4 p-5 opacity-70">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-cream-deep text-ink-muted">
                <FileText className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="font-display text-[1.1rem] text-ink">Raportul tău și partea din ghid</p>
                <p className="font-sans text-[0.8rem] text-ink-muted">PDF-ul e gata imediat după ce se scrie raportul</p>
              </div>
            </div>
          )}
          <Descarcare
            href={`/api/kit/${token}/ghid`}
            icon={BookOpen}
            titlu={`Doar partea ${parte.nr} din ghid`}
            detaliu={`PDF, ${parte.pagini} de pagini`}
          />
        </div>
      )}

      {rez.siguranta && (
        <div className="mt-8 border-l-2 border-clay bg-clay-pale px-6 py-5">
          <p className="font-display text-[1.15rem] text-clay">Siguranța ta vine întâi</p>
          <p className="mt-1 font-sans text-[0.92rem] leading-relaxed text-ink">
            Ai spus că ți-a fost frică de partener sau de fostul partener. Nu e vina ta și nu trebuie să treci prin asta fără
            ajutor. Dacă ești în pericol, sună la <strong>112</strong>. Linia gratuită pentru victimele violenței domestice
            este <strong>0800 500 333</strong>.
          </p>
        </div>
      )}

      {/* Rezultatul calculat: gratuit, pentru toată lumea */}
      <section className="glass-strong mt-8 p-7 sm:p-10">
        <div className="grid gap-8 sm:grid-cols-[auto_1fr] sm:items-center">
          <div>
            <p className="font-display text-[4.5rem] leading-none" style={{ color: NIVELURI[rez.nivel].culoare }}>
              {rez.indice}
              <span className="ml-1 font-sans text-[1.1rem] text-ink-muted">/ 100</span>
            </p>
            <p className="mt-2 font-sans text-[0.75rem] tracking-[0.06em] text-ink-muted">CÂT DE GREU E ACUM</p>
          </div>
          <div>
            <h2 className="font-display text-[1.6rem] leading-tight text-ink">{platit ? rez.titlu : NIVELURI[rez.nivel].nume}</h2>
            <p className="mt-2 font-sans text-[0.93rem] leading-relaxed text-ink-soft">{rez.text}</p>
          </div>
        </div>

        <div className="mt-9 space-y-7">
          {rez.zone.map((z) => {
            const niv = NIVELURI[z.nivel];
            return (
              <div key={z.cheie}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-display text-[1.15rem] text-ink">{z.nume}</p>
                  <p className="font-sans text-[0.85rem]" style={{ color: niv.culoare }}>
                    {niv.nume} · <span className="font-semibold">{z.pct}/100</span>
                  </p>
                </div>
                <div className="mt-2 h-2 bg-cream-deep">
                  <div className="h-full" style={{ width: `${Math.max(2, z.pct)}%`, background: niv.culoare }} />
                </div>
                <p className="mt-2 font-sans text-[0.87rem] leading-relaxed text-ink-soft">{z.text}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-8 font-sans text-[0.78rem] leading-relaxed text-ink-muted">
          0 înseamnă liniște, 100 înseamnă că e foarte greu. Scorurile arată cum vezi tu lucrurile acum, nu sunt o etichetă.
        </p>
      </section>

      {platit ? (
        ai ? (
          <RaportPeEcran ai={ai} rez={rez} parte={parte} />
        ) : (
          <div className="mt-6">
            <StareInterpretare token={token} activa={interpretareaActiva} />
          </div>
        )
      ) : (
        <section className="glass-strong mt-6 p-7 sm:p-10">
          <p className="font-sans text-[0.8rem] tracking-[0.04em] text-sage">PASUL URMĂTOR</p>
          <h2 className="mt-2 font-display text-[1.8rem] leading-tight text-ink sm:text-[2.1rem]">
            Partea din ghid care ți se potrivește
          </h2>
          <p className="mt-3 font-sans text-[0.93rem] leading-relaxed text-ink-soft">
            Din ce ne-ai spus despre situația ta, cea mai potrivită acum este{" "}
            <strong className="font-semibold text-ink">„{numeParte(rez.recomandata)}”</strong>.
            {rez.aChestionarului &&
              ` Ai pornit de la partea ${rez.aChestionarului.nr}; o poți alege și pe ea.`}{" "}
            Cu ea primești raportul tău personal, scris pe răspunsurile de mai sus.
          </p>
          <div className="mt-7">
            <CumparaParte
              token={token}
              recomandata={rez.recomandata.nr}
              aChestionarului={rez.aChestionarului?.nr ?? null}
              platesteActiv={platesteActiv}
              emailInitial={email}
            />
          </div>
        </section>
      )}

      <div className="mt-10 bg-ink p-8 text-center sm:p-10">
        <h2 className="font-display text-[1.6rem] text-cream">Dacă vrei să vorbim</h2>
        <p className="mx-auto mt-2 max-w-lg font-sans text-[0.9rem] leading-relaxed text-cream/70">
          Rezultatul e un punct de plecare. Într-o ședință putem transforma ce ai citit într-un plan lucrat pe situația ta.
        </p>
        <Link
          href="/programari"
          className="mt-6 inline-flex items-center justify-center gap-2 bg-periwinkle-light px-7 py-4 font-sans text-[0.93rem] text-ink transition-colors hover:bg-cream"
        >
          <CalendarDays className="h-5 w-5" aria-hidden />
          Programează o ședință
        </Link>
      </div>

      <p className="mt-8 text-center font-sans text-[0.8rem] leading-relaxed text-ink-muted">
        Rezultatul e psihoeducație, nu un diagnostic, și nu înlocuiește o ședință de terapie. Dacă ești în pericol, sună la 112
        sau la 0800 500 333 (linia gratuită pentru victimele violenței domestice).
      </p>
    </>
  );
}

function Descarcare({ href, icon: Icon, titlu, detaliu }: { href: string; icon: typeof FileText; titlu: string; detaliu: string }) {
  return (
    <a href={href} className="glass group flex items-center gap-4 p-5 transition-colors hover:bg-white/70">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-periwinkle text-cream">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-[1.1rem] text-ink">{titlu}</p>
        <p className="font-sans text-[0.8rem] text-ink-muted">{detaliu}</p>
      </div>
      <Download className="h-5 w-5 text-periwinkle transition-transform group-hover:translate-y-0.5" aria-hidden />
    </a>
  );
}

function Titlu({ kicker, children }: { kicker: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-sans text-[0.8rem] tracking-[0.04em] text-sage">{kicker.toUpperCase()}</p>
      <h2 className="mt-2 font-display text-[1.8rem] leading-tight text-ink sm:text-[2.1rem]">{children}</h2>
    </div>
  );
}

function Paragrafe({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {paragrafe(text).map((p, i) => (
        <p key={i} className="font-sans text-[0.97rem] leading-[1.9] text-ink-soft">
          {p}
        </p>
      ))}
    </div>
  );
}

function Lista({ titlu, elemente, culoare }: { titlu: string; elemente: string[]; culoare: string }) {
  if (!elemente.length) return null;
  return (
    <div className="glass h-full p-7">
      <h2 className="font-display text-[1.35rem] text-ink">{titlu}</h2>
      <ol className="mt-5 space-y-4">
        {elemente.map((e, i) => (
          <li key={i} className="flex gap-3.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center font-sans text-[0.78rem] text-cream" style={{ background: culoare }}>
              {i + 1}
            </span>
            <p className="font-sans text-[0.92rem] leading-relaxed text-ink-soft">{e}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function RaportPeEcran({ ai, rez, parte }: { ai: RaportParte; rez: Rezultat; parte: Parte }) {
  return (
    <div className="mt-6 space-y-6">
      <section className="glass-strong p-7 sm:p-10">
        <Titlu kicker="Interpretarea ta">Ce spun, de fapt, răspunsurile tale</Titlu>
        {ai.titlu && (
          <p className="mt-6 bg-periwinkle-pale px-6 py-5 font-display text-[1.25rem] italic leading-snug text-ink">{ai.titlu}</p>
        )}
        <Paragrafe text={ai.rezumat} className="mt-6" />
      </section>

      <section className="glass p-7 sm:p-10">
        <Titlu kicker="Analiză">Zonă cu zonă</Titlu>
        <div className="mt-8 divide-y divide-ink/10">
          {rez.zone.map((z, i) => {
            const text = ai.zone.find((x) => x.cheie === z.cheie);
            const niv = NIVELURI[z.nivel];
            return (
              <article key={z.cheie} className="py-7 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="font-display text-[1.6rem]" style={{ color: niv.culoare }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-[1.35rem] text-ink">{z.nume}</h3>
                  <span className="font-sans text-[0.82rem]" style={{ color: niv.culoare }}>
                    {z.pct}/100 · {niv.nume}
                  </span>
                </div>
                <Paragrafe text={text?.text || z.text} className="mt-4" />
                {text?.deRetinut && (
                  <p className="mt-5 border-l-2 border-periwinkle bg-periwinkle-pale/60 px-5 py-4 font-display text-[1.08rem] italic leading-snug text-ink">
                    {text.deRetinut}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {(ai.puncteForte.length > 0 || ai.atentie.length > 0) && (
        <section className="grid gap-6 md:grid-cols-2">
          <Lista titlu="Pe ce te poți sprijini" elemente={ai.puncteForte} culoare={NIVELURI.liniste.culoare} />
          <Lista titlu="La ce să ai grijă" elemente={ai.atentie} culoare={NIVELURI.critic.culoare} />
        </section>
      )}

      {ai.copii && (
        <section className="glass p-7 sm:p-10">
          <Titlu kicker="Copiii">Ce trăiesc copiii</Titlu>
          <Paragrafe text={ai.copii} className="mt-6" />
        </section>
      )}

      {ai.plan.length > 0 && (
        <section className="glass-strong p-7 sm:p-10">
          <Titlu kicker="Direcție">Planul tău pentru următoarele 30 de zile</Titlu>
          <p className="mt-3 font-sans text-[0.9rem] leading-relaxed text-ink-soft">
            Pași mici, în ordinea în care merită parcurși. E o hartă, nu o obligație.
          </p>
          <ol className="mt-8">
            {ai.plan.map((s, i) => (
              <li key={i} className="relative pb-8 pl-10 last:pb-0">
                {i < ai.plan.length - 1 && <span aria-hidden className="absolute left-[7px] top-5 h-full w-px bg-periwinkle-pale" />}
                <span aria-hidden className="absolute left-0 top-1.5 h-[15px] w-[15px] bg-periwinkle" />
                <p className="font-sans text-[0.75rem] tracking-[0.06em] text-periwinkle">SĂPTĂMÂNA {i + 1}</p>
                <h3 className="mt-1 font-display text-[1.2rem] text-ink">{s.titlu.replace(/^Săptămâna\s*\d+\s*[:.]\s*/i, "")}</h3>
                <ul className="mt-3 space-y-2">
                  {s.pasi.map((p, j) => (
                    <li key={j} className="flex gap-3 font-sans text-[0.93rem] leading-relaxed text-ink-soft">
                      <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-sage" />
                      {p}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>
      )}

      {ai.reflectie.length > 0 && (
        <section className="glass p-7 sm:p-10">
          <Titlu kicker="Pentru tine">Întrebări pentru reflecție</Titlu>
          <ul className="mt-6 space-y-3">
            {ai.reflectie.map((q, i) => (
              <li key={i} className="border-l-2 border-periwinkle bg-cream-warm px-5 py-4 font-display text-[1.08rem] italic leading-snug text-ink">
                {q}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="glass p-7 sm:p-10">
        <Titlu kicker="Partea ta din ghid">Ce să citești mai întâi</Titlu>
        <ol className="mt-6 space-y-3">
          {(ai.capitole.length ? ai.capitole : parte.capitole.map((t) => ({ titlu: t, deCe: "" }))).map((c) => (
            <li key={c.titlu} className="flex items-start gap-3">
              <BookOpen className="mt-1 h-4 w-4 shrink-0 text-sage" aria-hidden />
              <p className="font-sans text-[0.95rem] leading-relaxed text-ink">
                {c.titlu}
                {c.deCe && <span className="text-ink-soft">. {c.deCe}</span>}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {ai.incheiere && (
        <section className="px-2 text-center">
          <Paragrafe text={ai.incheiere} className="mx-auto max-w-2xl" />
          <p className="mt-4 font-display text-[1.1rem] italic text-periwinkle">Liliana Jgheban</p>
        </section>
      )}
    </div>
  );
}
