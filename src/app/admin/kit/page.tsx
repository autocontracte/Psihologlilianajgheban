import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/tz";
import { interpretareaActiva, PRET_KIT_LEI, raspunsuriComanda } from "@/lib/kit";
import { citesteInterpretarea, paragrafe } from "@/lib/kit/raport";
import { NIVELURI, calculeaza, raspunsuriTest, raspunsuriText } from "@/lib/kit/test";
import { platileSuntActive } from "@/lib/stripe";
import { InterpretareButton } from "@/components/admin/InterpretareButton";

export const metadata = { title: "Kit relație" };
export const dynamic = "force-dynamic";

const STARE: Record<string, { text: string; stil: string }> = {
  PAID: { text: "Plătit", stil: "bg-periwinkle-pale text-periwinkle" },
  STARTED: { text: "Neterminat", stil: "bg-clay-pale text-clay" },
};

export default async function AdminKitPage() {
  const comenzi = await db.guideOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const platite = comenzi.filter((c) => c.status === "PAID");
  const incasat = platite.reduce((s, c) => s + c.amount, 0) / 100;

  return (
    <div>
      <h1 className="font-display text-3xl text-ink lg:text-4xl">Kit „Cum stai, de fapt, cu relația ta?”</h1>
      <p className="mt-3 max-w-2xl font-sans text-[0.92rem] leading-relaxed text-ink-soft">
        Comenzile kitului ({PRET_KIT_LEI} lei): răspunsurile la test, scorul, interpretarea AI și plata. Linkul
        „Deschide raportul” arată exact ce vede clientul.
      </p>

      <div className="mt-7 grid gap-3 sm:grid-cols-4">
        <div className="bg-cream p-5">
          <p className="font-sans text-[0.8rem] text-ink-muted">Comenzi începute</p>
          <p className="mt-2 font-display text-3xl text-ink">{comenzi.length}</p>
        </div>
        <div className="bg-cream p-5">
          <p className="font-sans text-[0.8rem] text-ink-muted">Plătite</p>
          <p className="mt-2 font-display text-3xl text-ink">{platite.length}</p>
        </div>
        <div className="bg-cream p-5">
          <p className="font-sans text-[0.8rem] text-ink-muted">Încasat</p>
          <p className="mt-2 font-display text-3xl text-ink">{incasat.toLocaleString("ro-RO")} lei</p>
        </div>
        <div className="bg-cream p-5">
          <p className="font-sans text-[0.8rem] text-ink-muted">Interpretare AI</p>
          <p className={`mt-2 font-display text-xl ${interpretareaActiva ? "text-periwinkle" : "text-clay"}`}>
            {interpretareaActiva ? "Activă" : "Neconfigurată"}
          </p>
        </div>
      </div>

      {(!platileSuntActive || !interpretareaActiva) && (
        <div className="mt-5 border-l-2 border-clay bg-cream px-6 py-5">
          <p className="font-sans text-[0.95rem] text-ink">Ce mai lipsește</p>
          <ul className="mt-3 space-y-2 font-sans text-[0.88rem] leading-relaxed text-ink-soft">
            {!platileSuntActive && (
              <li>
                <span className="text-ink">Plata:</span> completează cheile Stripe în{" "}
                <code className="text-[0.85em]">.env</code>. Până atunci, kitul se primește gratuit, pentru testare.
              </li>
            )}
            {!interpretareaActiva && (
              <li>
                <span className="text-ink">Interpretarea AI:</span> completează{" "}
                <code className="bg-cream-deep px-1.5 py-0.5 text-[0.85em]">OPENAI_API_KEY</code>.
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="mt-8 space-y-3">
        {comenzi.length === 0 ? (
          <p className="bg-cream px-6 py-10 text-center font-sans text-[0.9rem] text-ink-soft">Nicio comandă încă.</p>
        ) : (
          comenzi.map((c) => {
            const stare = STARE[c.status] ?? STARE.STARTED;
            const r = raspunsuriComanda(c);
            const rez = calculeaza(r);
            const facute = raspunsuriTest(r);
            const text = raspunsuriText(r);
            const interpretare = citesteInterpretarea(c.interpretation);
            return (
              <article key={c.id} className="bg-cream p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`px-3 py-1.5 font-sans text-[0.78rem] ${stare.stil}`}>{stare.text}</span>
                      <span className="font-sans text-[0.8rem] text-ink-muted">
                        {c.email ?? "fără email"} · {formatDateTime(c.createdAt)}
                      </span>
                    </div>

                    {rez ? (
                      <div className="mt-4">
                        <p className="font-sans text-[0.9rem] text-ink">
                          <span className="font-display text-[1.4rem] text-periwinkle">{rez.indice}</span>
                          <span className="text-ink-muted">/100</span> · {rez.profil.nume}
                        </p>
                        <div className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
                          {rez.dimensiuni.map((d) => (
                            <div key={d.cheie} className="flex items-center gap-2 font-sans text-[0.8rem] text-ink-soft">
                              <span className="w-28 shrink-0">{d.nume}</span>
                              <span className="h-1.5 flex-1 bg-cream-deep">
                                <span
                                  className="block h-full"
                                  style={{ width: `${d.pct}%`, background: NIVELURI[d.nivel].culoare }}
                                />
                              </span>
                              <span className="w-7 text-right">{d.pct}</span>
                            </div>
                          ))}
                        </div>
                        {rez.semnale.length > 0 && (
                          <p className="mt-3 font-sans text-[0.8rem] text-clay">
                            Semnale: {rez.semnale.map((s) => s.titlu).join(" · ")}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-3 font-sans text-[0.82rem] text-ink-muted">
                        {facute > 0 ? `Test în lucru: ${facute} din 30 de afirmații.` : "Fără răspunsuri la testul nou."}
                      </p>
                    )}

                    {text && (
                      <details className="mt-3">
                        <summary className="cursor-pointer font-sans text-[0.85rem] text-periwinkle">
                          Vezi răspunsurile
                        </summary>
                        <pre className="mt-2 whitespace-pre-wrap font-sans text-[0.83rem] leading-relaxed text-ink-soft">
                          {text}
                        </pre>
                      </details>
                    )}

                    {interpretare && (
                      <details className="mt-2">
                        <summary className="cursor-pointer font-sans text-[0.85rem] text-sage">
                          Vezi interpretarea
                        </summary>
                        <div className="mt-2 space-y-2 border-l-2 border-sage bg-sage-pale/40 px-4 py-3 font-sans text-[0.85rem] leading-relaxed text-ink-soft">
                          {interpretare.tip === "raport" ? (
                            <>
                              <p className="font-display text-[1rem] italic text-ink">{interpretare.raport.titlu}</p>
                              {paragrafe(interpretare.raport.rezumat).map((p, i) => (
                                <p key={i}>{p}</p>
                              ))}
                              <p className="text-ink">Tipar: {interpretare.raport.tipar.titlu}</p>
                            </>
                          ) : (
                            <p className="whitespace-pre-wrap">{interpretare.text}</p>
                          )}
                        </div>
                      </details>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {c.status === "PAID" && (
                      <a
                        href={`/kit/rezultat/${c.token}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-sans text-[0.8rem] text-periwinkle underline underline-offset-4"
                      >
                        Deschide raportul
                      </a>
                    )}
                    {rez && <InterpretareButton id={c.id} token={c.token} are={Boolean(c.interpretation)} />}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
