import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/tz";
import { raspunsuriText, type Raspunsuri } from "@/lib/consiliere/intrebari";
import { interpretareaActiva } from "@/lib/consiliere";
import { platileSuntActive } from "@/lib/stripe";
import { InterpretareButton } from "@/components/admin/InterpretareButton";

export const metadata = { title: "Consiliere — ghid" };

const STARE: Record<string, { text: string; stil: string }> = {
  PAID: { text: "Plătit", stil: "bg-periwinkle-pale text-periwinkle" },
  STARTED: { text: "Neterminat", stil: "bg-clay-pale text-clay" },
};

export default async function AdminConsilierePage() {
  const comenzi = await db.guideOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const platite = comenzi.filter((c) => c.status === "PAID").length;

  return (
    <div>
      <h1 className="font-display text-3xl text-ink lg:text-4xl">Consiliere — ghid</h1>
      <p className="mt-3 max-w-2xl font-sans text-[0.92rem] leading-relaxed text-ink-soft">
        Comenzile pentru ghidul despre divorț: răspunsurile, interpretarea AI și plata.
      </p>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <div className="bg-cream p-5">
          <p className="font-sans text-[0.8rem] text-ink-muted">Comenzi</p>
          <p className="mt-2 font-display text-3xl text-ink">{comenzi.length}</p>
        </div>
        <div className="bg-cream p-5">
          <p className="font-sans text-[0.8rem] text-ink-muted">Plătite</p>
          <p className="mt-2 font-display text-3xl text-ink">{platite}</p>
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
                <code className="text-[0.85em]">.env</code>. Până atunci, poți genera
                interpretarea manual, de aici, ca s-o vezi.
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
          <p className="bg-cream px-6 py-10 text-center font-sans text-[0.9rem] text-ink-soft">
            Nicio comandă încă.
          </p>
        ) : (
          comenzi.map((c) => {
            const stare = STARE[c.status] ?? STARE.STARTED;
            let raspunsuri: Raspunsuri = {};
            try {
              raspunsuri = JSON.parse(c.answers);
            } catch {
              /* rămâne gol */
            }
            const text = raspunsuriText(raspunsuri);
            return (
              <article key={c.id} className="bg-cream p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`px-3 py-1.5 font-sans text-[0.78rem] ${stare.stil}`}>
                        {stare.text}
                      </span>
                      <span className="font-sans text-[0.8rem] text-ink-muted">
                        {c.email ?? "fără email"} · {formatDateTime(c.createdAt)}
                      </span>
                    </div>

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

                    {c.interpretation && (
                      <details className="mt-2">
                        <summary className="cursor-pointer font-sans text-[0.85rem] text-sage">
                          Vezi interpretarea
                        </summary>
                        <div className="mt-2 whitespace-pre-wrap border-l-2 border-sage bg-sage-pale/40 px-4 py-3 font-sans text-[0.85rem] leading-relaxed text-ink-soft">
                          {c.interpretation}
                        </div>
                      </details>
                    )}
                  </div>

                  <div className="shrink-0">
                    <InterpretareButton id={c.id} are={Boolean(c.interpretation)} />
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
