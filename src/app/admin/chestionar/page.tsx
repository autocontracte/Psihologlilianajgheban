import { db } from "@/lib/db";
import { PALETTES, FONT_PAIRS } from "@/content/themes";
import { formatDateTime } from "@/lib/tz";

export const metadata = { title: "Chestionar" };

/* Eticheta omenească pentru fiecare variantă aleasă. */
const LABELS: Record<string, Record<string, string>> = {
  calendar: {
    google: "Google Calendar",
    calendly: "Calendly",
    outlook: "Outlook",
    altul: "Altul",
    niciunul: "Nu folosește niciunul",
  },
  contract: {
    da: "Da, folosește contract",
    nu: "Nu folosește",
    nu_stiu: "Nu e sigură",
  },
  contabilitate: {
    fgo: "FGO",
    smartbill: "SmartBill",
    contabil: "Se ocupă contabilul",
    altul: "Altceva",
    niciunul: "Nimic deocamdată",
  },
  stripe: {
    am: "Are cont Stripe",
    nu_am: "Nu are — îl deschidem noi",
    fara_plati: "Nu vrea plăți online",
  },
  seo_varianta: {
    "1": "Varianta 1 — textele le scriem noi",
    "2": "Varianta 2 — textele le scrie ea",
  },
};

const QUESTIONS: { key: string; n: number | null; title: string; extra?: string }[] = [
  { key: "respondent", n: null, title: "Cine a completat" },
  { key: "paleta", n: 1, title: "Paleta de culori", extra: "paleta_comentariu" },
  { key: "font", n: 2, title: "Fontul" },
  { key: "calendar", n: 3, title: "Calendar", extra: "calendar_altul" },
  { key: "contract", n: 4, title: "Contract", extra: "contract_detalii" },
  { key: "contabilitate", n: 5, title: "Facturare", extra: "contabilitate_altul" },
  { key: "stripe", n: 6, title: "Plăți online", extra: "stripe_email" },
  { key: "seo_varianta", n: 7, title: "Textele site-ului", extra: "seo_comentariu" },
  { key: "intrebari_geo", n: 8, title: "Întrebări de la oameni" },
  { key: "automatizari", n: 9, title: "Alte automatizări dorite" },
  { key: "observatii", n: 10, title: "Observații" },
];

export default async function AdminBriefPage() {
  const [rows, files] = await Promise.all([
    db.briefAnswer.findMany(),
    db.briefFile.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const a = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const when = Object.fromEntries(rows.map((r) => [r.key, r.updatedAt]));

  const answered = QUESTIONS.filter((q) => a[q.key]?.trim()).length;
  const lastUpdate = rows.length
    ? rows.reduce((m, r) => (r.updatedAt > m ? r.updatedAt : m), rows[0].updatedAt)
    : null;

  const palette = PALETTES.find((p) => String(p.n) === a.paleta);
  const font = FONT_PAIRS.find((f) => String(f.n) === a.font);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink lg:text-4xl">Chestionar</h1>
          <p className="mt-2.5 font-sans text-[0.88rem] text-ink-soft">
            {answered} din {QUESTIONS.length} completate
            {lastUpdate && ` · ultima modificare ${formatDateTime(lastUpdate)}`}
          </p>
        </div>
        <a
          href="/chestionar"
          target="_blank"
          rel="noreferrer"
          className="rounded-pill border border-ink/20 px-5 py-2.5 font-sans text-[0.8rem] text-ink-soft transition-colors hover:border-ink/50 hover:text-ink"
        >
          Deschide chestionarul ↗
        </a>
      </div>

      {rows.length === 0 && (
        <p className="mt-9 rounded-[1.5rem] bg-cream px-6 py-10 text-center font-sans text-[0.9rem] text-ink-soft">
          Nu a fost completat nimic încă. Trimiteți linkul{" "}
          <span className="text-ink">psihologlilianajgheban.ro/chestionar</span>.
        </p>
      )}

      {/* Alegerile vizuale, arătate ca atare */}
      {(palette || font) && (
        <div className="mt-9 grid gap-4 lg:grid-cols-2">
          {palette && (
            <div className="rounded-[1.75rem] bg-cream p-6">
              <p className="font-sans text-[0.75rem] text-ink-muted">
                Paleta aleasă
              </p>
              <p className="mt-2 font-display text-xl text-ink">
                {palette.n}. {palette.name}
              </p>
              <div className="mt-4 flex gap-1.5">
                {[palette.bg, palette.ink, palette.accent, palette.second, palette.line].map(
                  (c) => (
                    <div key={c} className="flex-1">
                      <div
                        className="h-12 rounded-[0.4rem]"
                        style={{ background: c, border: "1px solid rgba(0,0,0,.08)" }}
                      />
                      <p className="mt-1.5 text-center font-mono text-[0.62rem] text-ink-muted">
                        {c.toUpperCase()}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {font && (
            <div className="rounded-[1.75rem] bg-cream p-6">
              <p className="font-sans text-[0.75rem] text-ink-muted">Fontul ales</p>
              <p className="mt-2 font-display text-xl text-ink">
                {font.n}. {font.display} + {font.body}
              </p>
              <p className="mt-4 font-sans text-[0.85rem] leading-relaxed text-ink-soft">
                {font.note}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Răspunsurile */}
      <div className="mt-4 space-y-3">
        {QUESTIONS.map((q) => {
          const raw = a[q.key]?.trim();
          const extra = q.extra ? a[q.extra]?.trim() : undefined;
          if (!raw && !extra) return null;

          const pretty = raw ? (LABELS[q.key]?.[raw] ?? raw) : undefined;
          const multiline = raw?.includes("\n");

          return (
            <section key={q.key} className="rounded-[1.5rem] bg-cream p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="font-sans text-[0.75rem] text-ink-muted">
                  {q.n !== null && `${q.n}. `}
                  {q.title}
                </p>
                {when[q.key] && (
                  <span className="font-sans text-[0.72rem] text-ink-muted">
                    {formatDateTime(when[q.key])}
                  </span>
                )}
              </div>

              {pretty && (
                <p
                  className={[
                    "mt-2.5 font-sans text-[0.95rem] text-ink",
                    multiline ? "whitespace-pre-line leading-[1.8]" : "",
                  ].join(" ")}
                >
                  {pretty}
                </p>
              )}

              {extra && (
                <p className="mt-3 rounded-[1rem] bg-cream-warm px-4 py-3 font-sans text-[0.87rem] leading-[1.75] whitespace-pre-line text-ink-soft">
                  {extra}
                </p>
              )}
            </section>
          );
        })}
      </div>

      {/* Documente încărcate */}
      {files.length > 0 && (
        <section className="mt-4 rounded-[1.5rem] bg-cream p-6">
          <p className="font-sans text-[0.75rem] text-ink-muted">
            Documente încărcate
          </p>
          <ul className="mt-3 space-y-2">
            {files.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center gap-3">
                <a
                  href={`/api/chestionar/fisier/${f.id}`}
                  className="font-sans text-[0.92rem] text-periwinkle underline decoration-periwinkle/30 underline-offset-4 transition-colors hover:text-ink"
                >
                  {f.fileName}
                </a>
                <span className="font-sans text-[0.78rem] text-ink-muted">
                  {Math.round(f.size / 1024)} KB · {formatDateTime(f.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
