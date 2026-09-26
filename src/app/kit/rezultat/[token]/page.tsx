import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, CalendarDays, Download, FileText } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Lumina } from "@/components/ui/Lumina";
import { IconArrow } from "@/components/ui/Icons";
import { StareInterpretare } from "@/components/kit/StareInterpretare";
import { FinalizeazaPlata } from "@/components/kit/FinalizeazaPlata";
import {
  confirmaPlata,
  getComanda,
  interpretareaActiva,
  PRET_KIT_LEI,
  raspunsuriComanda,
} from "@/lib/kit";
import { citesteInterpretarea, paragrafe, type RaportAI } from "@/lib/kit/raport";
import {
  NIVELURI,
  areCopii,
  calculeaza,
  capitoleRecomandate,
  eSeparat,
  type Raspunsuri,
  type Rezultat,
} from "@/lib/kit/test";
import { platileSuntActive, stripe } from "@/lib/stripe";

export const metadata = {
  title: "Raportul tău",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Stripe ne poate întoarce omul înaintea notificării de plată: verificăm direct. */
async function comandaVerificata(token: string) {
  const comanda = await getComanda(token);
  if (!comanda || comanda.status === "PAID" || !comanda.paymentRef || !platileSuntActive) return comanda;
  try {
    const sesiune = await stripe().checkout.sessions.retrieve(comanda.paymentRef);
    if (sesiune.payment_status === "paid") {
      await confirmaPlata(comanda.id);
      return getComanda(token);
    }
  } catch (err) {
    console.error("[kit] verificare plata", err);
  }
  return comanda;
}

export default async function RezultatKit({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const comanda = await comandaVerificata(token);
  if (!comanda) notFound();

  const interpretare = citesteInterpretarea(comanda.interpretation);
  const platit = comanda.status === "PAID";
  // Evaluările gratuite de dinainte de kit își păstrează interpretarea.
  const evaluareVeche = !platit && comanda.amount === 0 && interpretare?.tip === "text";

  const raspunsuri = raspunsuriComanda(comanda);
  const rez = calculeaza(raspunsuri);
  const ai = interpretare?.tip === "raport" ? interpretare.raport : null;

  return (
    <>
      <Nav />
      <main className="relative overflow-hidden bg-cream-warm">
        <Lumina din="dreapta" />
        <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-36 lg:px-10 lg:pt-44">
          {!platit && !evaluareVeche ? (
            <div className="glass-strong p-10 text-center">
              <h1 className="font-display text-[1.9rem] text-ink">Kitul nu e încă plătit</h1>
              <p className="mx-auto mt-3 max-w-md font-sans text-[0.92rem] leading-relaxed text-ink-soft">
                Nu am înregistrat plata pentru această comandă. Dacă tocmai ai plătit, reîncarcă pagina peste câteva
                secunde.
              </p>
              {platileSuntActive && comanda.email && rez ? (
                <FinalizeazaPlata token={token} pretLei={PRET_KIT_LEI} />
              ) : (
                <Link
                  href="/kit#test"
                  className="mt-6 inline-flex bg-periwinkle px-7 py-3.5 font-sans text-[0.9rem] text-cream transition-colors hover:bg-ink"
                >
                  Înapoi la test
                </Link>
              )}
            </div>
          ) : (
            <>
              <header className="text-center">
                <p className="font-sans text-[0.85rem] text-periwinkle">Kit „Cum stai, de fapt, cu relația ta?”</p>
                <h1 className="mt-4 font-display text-[2.3rem] leading-tight text-ink lg:text-[3rem]">
                  Raportul tău <em className="not-italic text-periwinkle">personal</em>
                </h1>
                <p className="mx-auto mt-4 max-w-xl font-sans text-[0.92rem] leading-relaxed text-ink-soft">
                  Citește-l în liniște, pe bucăți, și revino la el. Linkul acestei pagini e doar al tău.
                </p>
              </header>

              {platit && (
                <div className="mt-10 grid gap-3 sm:grid-cols-2">
                  {rez && (ai || !interpretareaActiva) ? (
                    <Descarcare href={`/api/kit/${token}/raport`} icon={FileText} titlu="Raportul tău" detaliu="PDF personal, ~15 pagini" />
                  ) : rez ? (
                    <div className="glass flex items-center gap-4 p-5 opacity-70">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-cream-deep text-ink-muted">
                        <FileText className="h-5 w-5" aria-hidden />
                      </span>
                      <div>
                        <p className="font-display text-[1.1rem] text-ink">Raportul tău</p>
                        <p className="font-sans text-[0.8rem] text-ink-muted">PDF-ul e gata imediat după interpretare</p>
                      </div>
                    </div>
                  ) : null}
                  <Descarcare
                    href={`/api/kit/${token}/ghid`}
                    icon={BookOpen}
                    titlu="Ghidul practic"
                    detaliu="PDF, 63 de pagini"
                  />
                </div>
              )}

              {rez ? (
                <RaportPeEcran token={token} rez={rez} ai={ai} r={raspunsuri} />
              ) : interpretare?.tip === "text" ? (
                <div className="glass-strong mt-8 space-y-4 p-8 sm:p-11">
                  {paragrafe(interpretare.text).map((p, i) => (
                    <p key={i} className="font-sans text-[0.98rem] leading-[1.9] text-ink-soft">
                      {p}
                    </p>
                  ))}
                </div>
              ) : null}

              {evaluareVeche && (
                <div className="glass mt-6 p-8 text-center">
                  <h2 className="font-display text-[1.4rem] text-ink">Vrei un raport complet?</h2>
                  <p className="mx-auto mt-2 max-w-md font-sans text-[0.9rem] leading-relaxed text-ink-soft">
                    Kitul „Cum stai, de fapt, cu relația ta?” are un test de 30 de întrebări, un raport detaliat în PDF
                    și ghidul de 63 de pagini.
                  </p>
                  <Link
                    href="/kit"
                    className="mt-6 inline-flex items-center gap-2 bg-periwinkle px-7 py-4 font-sans text-[0.93rem] text-cream transition-colors hover:bg-ink"
                  >
                    Descoperă kitul <IconArrow className="h-5 w-5" />
                  </Link>
                </div>
              )}

              <div className="mt-10 bg-ink p-8 text-center sm:p-10">
                <h2 className="font-display text-[1.6rem] text-cream">Dacă vrei să vorbim</h2>
                <p className="mx-auto mt-2 max-w-lg font-sans text-[0.9rem] leading-relaxed text-cream/70">
                  Raportul e un punct de plecare. Într-o ședință, individuală sau de cuplu, putem transforma ce ai citit
                  într-un plan lucrat pe situația ta.
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
                Raportul e psihoeducație, nu un diagnostic, și nu înlocuiește o ședință de terapie. Dacă ești în
                pericol, sună la 112 sau la 0800 500 333 (linia gratuită pentru victimele violenței domestice).
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function Descarcare({
  href,
  icon: Icon,
  titlu,
  detaliu,
}: {
  href: string;
  icon: typeof FileText;
  titlu: string;
  detaliu: string;
}) {
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

const ZONE = [
  { de: 0, la: 35, culoare: NIVELURI.critic.culoare, nume: "Deconectare" },
  { de: 35, la: 55, culoare: NIVELURI.presiune.culoare, nume: "Criză" },
  { de: 55, la: 75, culoare: NIVELURI.ingrijit.culoare, nume: "Pusă la încercare" },
  { de: 75, la: 100, culoare: NIVELURI.resursa.culoare, nume: "Rădăcini solide" },
];

function RaportPeEcran({ token, rez, ai, r }: { token: string; rez: Rezultat; ai: RaportAI | null; r: Raspunsuri }) {
  return (
    <div className="mt-8 space-y-6">
      {/* Indicele și profilul */}
      <section className="glass-strong p-7 sm:p-10">
        <div className="grid gap-8 sm:grid-cols-[auto_1fr] sm:items-center">
          <div>
            <p className="font-display text-[4.5rem] leading-none text-periwinkle">
              {rez.indice}
              <span className="ml-1 font-sans text-[1.1rem] text-ink-muted">/ 100</span>
            </p>
            <p className="mt-2 font-sans text-[0.75rem] tracking-[0.06em] text-ink-muted">INDICELE RELAȚIEI</p>
          </div>
          <div>
            <h2 className="font-display text-[1.7rem] leading-tight text-ink">{rez.profil.nume}</h2>
            <p className="mt-2 font-sans text-[0.93rem] leading-relaxed text-ink-soft">{rez.profil.scurt}</p>
          </div>
        </div>

        <div className="relative mt-8">
          <div className="flex gap-0.5">
            {ZONE.map((z) => (
              <div key={z.nume} style={{ width: `${z.la - z.de}%` }}>
                <div className="h-2" style={{ background: z.culoare, opacity: 0.85 }} />
                <p className="mt-2 hidden font-sans text-[0.72rem] text-ink-muted sm:block">{z.nume}</p>
              </div>
            ))}
          </div>
          <span
            aria-hidden
            className="absolute -top-3 h-0 w-0 -translate-x-1/2 border-x-[7px] border-t-[9px] border-x-transparent border-t-ink"
            style={{ left: `${rez.indice}%` }}
          />
        </div>

        <p className="mt-8 font-sans text-[0.95rem] leading-[1.9] text-ink-soft">{rez.profil.descriere}</p>
        {eSeparat(r) && (
          <p className="mt-5 border-l-2 border-sage bg-sage-pale px-5 py-3 font-sans text-[0.86rem] leading-relaxed text-ink-soft">
            Pentru că relația voastră s-a încheiat sau e în curs de încheiere, scorurile descriu relația așa cum a fost
            în ultima perioadă.
          </p>
        )}
      </section>

      {/* Dimensiunile */}
      <section className="glass p-7 sm:p-10">
        <Titlu kicker="Profilul pe dimensiuni">Cele șase dimensiuni ale relației tale</Titlu>
        <div className="mt-8 space-y-7">
          {rez.dimensiuni.map((d) => {
            const niv = NIVELURI[d.nivel];
            return (
              <div key={d.cheie}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-display text-[1.15rem] text-ink">{d.nume}</p>
                  <p className="font-sans text-[0.85rem]" style={{ color: niv.culoare }}>
                    {niv.nume} · <span className="font-semibold">{d.pct}/100</span>
                  </p>
                </div>
                <div className="mt-2 h-2 bg-cream-deep">
                  <div className="h-full" style={{ width: `${Math.max(2, d.pct)}%`, background: niv.culoare }} />
                </div>
                <p className="mt-2 font-sans text-[0.87rem] leading-relaxed text-ink-soft">
                  {d.descriere} {d.niveluri[d.nivel]}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {rez.semnale.length > 0 && (
        <section className="space-y-3">
          {rez.semnale.map((s) => (
            <div key={s.cheie} className="border-l-2 border-clay bg-clay-pale px-6 py-5">
              <p className="font-display text-[1.1rem] text-clay">{s.titlu}</p>
              <p className="mt-1 font-sans text-[0.9rem] leading-relaxed text-ink">{s.text}</p>
            </div>
          ))}
        </section>
      )}

      {ai ? <Interpretare ai={ai} rez={rez} r={r} /> : <StareInterpretare token={token} activa={interpretareaActiva} />}
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

function Interpretare({ ai, rez, r }: { ai: RaportAI; rez: Rezultat; r: Raspunsuri }) {
  const separat = eSeparat(r);
  return (
    <>
      <section className="glass-strong p-7 sm:p-10">
        <Titlu kicker="Interpretarea ta">Ce spun, de fapt, răspunsurile tale</Titlu>
        {ai.titlu && (
          <p className="mt-6 bg-periwinkle-pale px-6 py-5 font-display text-[1.25rem] italic leading-snug text-ink">
            {ai.titlu}
          </p>
        )}
        <Paragrafe text={ai.rezumat} className="mt-6" />
      </section>

      {ai.tipar.titlu && (
        <section className="bg-ink p-7 sm:p-10">
          <p className="font-sans text-[0.8rem] tracking-[0.04em] text-periwinkle-light">TIPARUL RELAȚIEI VOASTRE</p>
          <h2 className="mt-2 font-display text-[1.8rem] leading-tight text-cream">{ai.tipar.titlu}</h2>
          <div className="mt-5 space-y-4">
            {paragrafe(ai.tipar.text).map((p, i) => (
              <p key={i} className="font-sans text-[0.95rem] leading-[1.9] text-cream/75">
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      <section className="glass p-7 sm:p-10">
        <Titlu kicker="Analiză">Relația ta, dimensiune cu dimensiune</Titlu>
        <div className="mt-8 divide-y divide-ink/10">
          {rez.dimensiuni.map((d, i) => {
            const text = ai.dimensiuni.find((x) => x.cheie === d.cheie);
            const niv = NIVELURI[d.nivel];
            return (
              <article key={d.cheie} className="py-7 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="font-display text-[1.6rem]" style={{ color: niv.culoare }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-[1.35rem] text-ink">{d.nume}</h3>
                  <span className="font-sans text-[0.82rem]" style={{ color: niv.culoare }}>
                    {d.pct}/100 · {niv.nume}
                  </span>
                </div>
                <Paragrafe text={text?.text || d.niveluri[d.nivel]} className="mt-4" />
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
          <ListaNumerotata titlu="Pe ce vă puteți sprijini" elemente={ai.puncteForte} culoare={NIVELURI.resursa.culoare} />
          <ListaNumerotata titlu="La ce să fii atent" elemente={ai.atentie} culoare={NIVELURI.critic.culoare} />
        </section>
      )}

      {ai.copii && areCopii(r) && (
        <section className="glass p-7 sm:p-10">
          <Titlu kicker="Copiii">Ce trăiesc copiii voștri</Titlu>
          <Paragrafe text={ai.copii} className="mt-6" />
        </section>
      )}

      {ai.plan.length > 0 && (
        <section className="glass-strong p-7 sm:p-10">
          <Titlu kicker="Direcție">Planul tău pentru următoarele 30 de zile</Titlu>
          <p className="mt-3 font-sans text-[0.9rem] leading-relaxed text-ink-soft">
            Pași mici, în ordinea în care merită parcurși. E o hartă, nu o obligație.
          </p>
          <ol className="mt-8 space-y-0">
            {ai.plan.map((s, i) => (
              <li key={i} className="relative pb-8 pl-10 last:pb-0">
                {i < ai.plan.length - 1 && <span aria-hidden className="absolute left-[7px] top-5 h-full w-px bg-periwinkle-pale" />}
                <span aria-hidden className="absolute left-0 top-1.5 h-[15px] w-[15px] bg-periwinkle" />
                <p className="font-sans text-[0.75rem] tracking-[0.06em] text-periwinkle">SĂPTĂMÂNA {i + 1}</p>
                <h3 className="mt-1 font-display text-[1.2rem] text-ink">
                  {s.titlu.replace(/^Săptămâna\s*\d+\s*[:.]\s*/i, "")}
                </h3>
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

      {ai.conversatie.length > 0 && (
        <section className="glass p-7 sm:p-10">
          <Titlu kicker="Pentru voi">{separat ? "Întrebări pentru reflecție" : "Întrebări pentru o discuție în doi"}</Titlu>
          <ul className="mt-6 space-y-3">
            {ai.conversatie.map((q, i) => (
              <li key={i} className="border-l-2 border-periwinkle bg-cream-warm px-5 py-4 font-display text-[1.08rem] italic leading-snug text-ink">
                {q}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="glass p-7 sm:p-10">
        <Titlu kicker="Ghidul din kit">Ce să citești mai întâi în ghid</Titlu>
        <ol className="mt-6 space-y-2">
          {capitoleRecomandate(r, rez).map((c) => (
            <li key={c} className="flex items-start gap-3 font-sans text-[0.95rem] text-ink">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-sage" aria-hidden />
              {c}
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
    </>
  );
}

function ListaNumerotata({ titlu, elemente, culoare }: { titlu: string; elemente: string[]; culoare: string }) {
  if (!elemente.length) return null;
  return (
    <div className="glass h-full p-7">
      <h2 className="font-display text-[1.35rem] text-ink">{titlu}</h2>
      <ol className="mt-5 space-y-4">
        {elemente.map((e, i) => (
          <li key={i} className="flex gap-3.5">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center font-sans text-[0.78rem] text-cream"
              style={{ background: culoare }}
            >
              {i + 1}
            </span>
            <p className="font-sans text-[0.92rem] leading-relaxed text-ink-soft">{e}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
