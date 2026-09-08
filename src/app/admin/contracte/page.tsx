import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/tz";
import { PRICE } from "@/content/site";
import { TrimiteContract } from "@/components/admin/TrimiteContract";
import { AnuleazaContract } from "@/components/admin/AnuleazaContract";

export const metadata = { title: "Contracte" };

const STARE: Record<string, { text: string; stil: string }> = {
  SENT: { text: "Trimis, în așteptare", stil: "bg-clay-pale text-clay" },
  SIGNED: { text: "Semnat", stil: "bg-periwinkle-pale text-periwinkle" },
  CANCELLED: { text: "Anulat", stil: "bg-ink/8 text-ink-muted" },
};

export default async function AdminContractePage() {
  const contracte = await db.contract.findMany({
    orderBy: { number: "desc" },
    take: 200,
  });

  const semnate = contracte.filter((c) => c.status === "SIGNED").length;
  const inAsteptare = contracte.filter((c) => c.status === "SENT").length;

  return (
    <div>
      <h1 className="font-display text-3xl text-ink lg:text-4xl">Contracte</h1>
      <p className="mt-3 max-w-2xl font-sans text-[0.92rem] leading-relaxed text-ink-soft">
        Trimiți un link, clientul completează și semnează, iar contractul ajunge
        aici semnat și arhivat.
      </p>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <div className="bg-cream p-5">
          <p className="font-sans text-[0.8rem] text-ink-muted">Semnate</p>
          <p className="mt-2 font-display text-3xl text-ink">{semnate}</p>
        </div>
        <div className="bg-cream p-5">
          <p className="font-sans text-[0.8rem] text-ink-muted">În așteptare</p>
          <p className="mt-2 font-display text-3xl text-ink">{inAsteptare}</p>
        </div>
        <div className="bg-cream p-5">
          <p className="font-sans text-[0.8rem] text-ink-muted">În total</p>
          <p className="mt-2 font-display text-3xl text-ink">{contracte.length}</p>
        </div>
      </div>

      <div className="mt-8">
        <TrimiteContract pretImplicit={PRICE.standard} />
      </div>

      <div className="mt-10 space-y-3">
        {contracte.length === 0 ? (
          <p className="bg-cream px-6 py-10 text-center font-sans text-[0.9rem] text-ink-soft">
            Niciun contract încă.
          </p>
        ) : (
          contracte.map((c) => {
            const stare = STARE[c.status] ?? STARE.SENT;
            const campuri: Record<string, string> = c.data
              ? JSON.parse(c.data)
              : {};

            return (
              <article key={c.id} className="bg-cream p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={`px-3 py-1.5 font-sans text-[0.78rem] ${stare.stil}`}
                      >
                        {stare.text}
                      </span>
                      <span className="px-3 py-1.5 font-sans text-[0.78rem] text-ink-muted">
                        {c.type === "MINOR" ? "Minor" : "Adult"}
                      </span>
                    </div>

                    <p className="mt-3 font-display text-[1.2rem] text-ink">
                      Nr. {c.number} · {c.sentToName}
                    </p>

                    <p className="mt-1.5 font-sans text-[0.87rem] text-ink-soft">
                      {c.sentToEmail} · {Math.round(c.price / 100)} lei pe ședință
                    </p>

                    {c.type === "MINOR" && campuri.minor_nume && (
                      <p className="mt-1 font-sans text-[0.85rem] text-ink-soft">
                        Copil: {campuri.minor_nume}
                        {campuri.minor_varsta && `, ${campuri.minor_varsta} ani`}
                      </p>
                    )}

                    <p className="mt-1 font-sans text-[0.8rem] text-ink-muted">
                      Trimis {formatDateTime(c.sentAt)}
                      {c.signedAt && ` · semnat ${formatDateTime(c.signedAt)}`}
                    </p>

                    {c.status === "SIGNED" && c.pdfHash && (
                      <p className="mt-2 font-sans text-[0.75rem] text-ink-muted">
                        Amprenta fișierului arhivat {c.pdfHash.slice(0, 20)}…
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {c.status === "SIGNED" ? (
                      <a
                        href={`/api/admin/contracte/${c.id}/pdf`}
                        className="bg-periwinkle px-5 py-2.5 font-sans text-[0.82rem] text-cream transition-colors hover:bg-ink"
                      >
                        Descarcă
                      </a>
                    ) : c.status === "SENT" ? (
                      <AnuleazaContract id={c.id} token={c.token} />
                    ) : null}
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
