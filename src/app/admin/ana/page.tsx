import Link from "next/link";

import { db } from "@/lib/db";
import { ANA_PASTREAZA_ZILE } from "@/lib/anaIstoric";
import { TZ } from "@/lib/tz";
import { sursa } from "@/lib/vizite";

export const metadata = { title: "Conversații cu Ana" };

const ziOra = new Intl.DateTimeFormat("ro-RO", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const ora = new Intl.DateTimeFormat("ro-RO", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AdminAnaPage() {
  const chats = await db.anaChat.findMany({
    orderBy: { lastAt: "desc" },
    take: 200,
    include: { mesaje: { orderBy: { at: "asc" } } },
  });

  /* Vizita din care s-a scris: de unde a venit omul și de pe ce. */
  const idVizite = chats.map((c) => c.visitId).filter(Boolean) as string[];
  const vizite = idVizite.length
    ? await db.visit.findMany({
        where: { id: { in: idVizite } },
        select: {
          id: true,
          source: true,
          medium: true,
          referrer: true,
          device: true,
          city: true,
          booked: true,
          landing: true,
        },
      })
    : [];
  const dupaId = new Map(vizite.map((v) => [v.id, v]));

  const cuIntrebari = chats.filter((c) => c.intrebari > 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink lg:text-4xl">
            Conversații cu Ana
          </h1>
          <p className="mt-2.5 max-w-2xl font-sans text-[0.88rem] text-ink-soft">
            Ce au întrebat oamenii și ce le-a răspuns Ana. Conversațiile pot conține
            lucruri personale — se văd doar aici și se șterg singure după{" "}
            {ANA_PASTREAZA_ZILE} de zile.
          </p>
        </div>
        <Link
          href="/admin/vizite"
          className="bg-cream px-4 py-2 font-sans text-[0.75rem] text-ink-soft transition-colors hover:text-ink"
        >
          Vezi vizitele
        </Link>
      </div>

      <div className="mt-9 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="bg-cream p-5">
          <p className="font-sans text-[0.74rem] tracking-[0.02em] text-ink-muted">
            Conversații
          </p>
          <p className="mt-2 font-display text-3xl text-ink">{cuIntrebari.length}</p>
        </div>
        <div className="bg-cream p-5">
          <p className="font-sans text-[0.74rem] tracking-[0.02em] text-ink-muted">
            Întrebări puse
          </p>
          <p className="mt-2 font-display text-3xl text-ink">
            {cuIntrebari.reduce((a, c) => a + c.intrebari, 0)}
          </p>
        </div>
        <div className="bg-cream p-5">
          <p className="font-sans text-[0.74rem] tracking-[0.02em] text-ink-muted">
            Întrebări pe conversație
          </p>
          <p className="mt-2 font-display text-3xl text-ink">
            {cuIntrebari.length
              ? (
                  cuIntrebari.reduce((a, c) => a + c.intrebari, 0) / cuIntrebari.length
                ).toFixed(1)
              : "0"}
          </p>
        </div>
        <div className="bg-cream p-5">
          <p className="font-sans text-[0.74rem] tracking-[0.02em] text-ink-muted">
            Au ajuns la programare
          </p>
          <p className="mt-2 font-display text-3xl text-periwinkle">
            {
              cuIntrebari.filter((c) => c.visitId && dupaId.get(c.visitId)?.booked)
                .length
            }
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {cuIntrebari.length === 0 ? (
          <p className="bg-cream px-6 py-10 text-center font-sans text-[0.88rem] text-ink-soft">
            Nicio conversație încă. Aici ajung cele de la deschiderea paginii încoace —
            ce a fost înainte nu s-a păstrat nicăieri.
          </p>
        ) : (
          cuIntrebari.map((c) => {
            const v = c.visitId ? dupaId.get(c.visitId) : null;
            const prima = c.mesaje.find((m) => m.rol === "om");

            return (
              <details key={c.id} className="group bg-cream">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1.5 px-5 py-4 font-sans text-[0.8rem]">
                  <span className="w-[7.5rem] shrink-0 text-ink-muted">
                    {ziOra.format(c.startedAt)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-ink">
                    {prima ? `„${prima.text}"` : "—"}
                  </span>
                  <span className="shrink-0 text-ink-muted">
                    {c.intrebari} {c.intrebari === 1 ? "întrebare" : "întrebări"}
                  </span>
                  {v && (
                    <span className="shrink-0 text-ink-muted">
                      {sursa(v)} · {v.device}
                      {v.city ? ` · ${v.city}` : ""}
                    </span>
                  )}
                  {v?.booked && (
                    <span className="shrink-0 bg-periwinkle px-2 py-0.5 text-[0.68rem] text-cream">
                      Programare
                    </span>
                  )}
                </summary>

                <div className="space-y-3 border-t border-ink/10 px-5 py-5">
                  {c.mesaje.map((m) => (
                    <div
                      key={m.id}
                      className={m.rol === "om" ? "" : "border-l-2 border-periwinkle/30 pl-4"}
                    >
                      <p className="font-sans text-[0.68rem] tracking-[0.02em] text-ink-muted">
                        {m.rol === "om" ? "Omul" : "Ana"} · {ora.format(m.at)}
                      </p>
                      <p
                        className={`mt-1 whitespace-pre-wrap font-sans text-[0.86rem] leading-[1.7] ${
                          m.rol === "om" ? "text-ink" : "text-ink-soft"
                        }`}
                      >
                        {m.text}
                      </p>
                    </div>
                  ))}

                  {v && (
                    <p className="border-t border-ink/10 pt-3 font-sans text-[0.72rem] text-ink-muted">
                      A intrat pe {v.landing} · {sursa(v)} · {v.device}
                      {v.city ? ` · ${v.city}` : ""} ·{" "}
                      <Link href="/admin/vizite" className="underline">
                        vezi traseul vizitei
                      </Link>
                    </p>
                  )}
                </div>
              </details>
            );
          })
        )}
      </div>
    </div>
  );
}
