import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SABLOANE, esteTip, numeDescarcare } from "@/lib/contracts";
import { FormularContract } from "@/components/contracte/FormularContract";
import { SITE } from "@/content/site";

/* Un contract nu are ce căuta în Google, oricât de ascuns ar fi linkul. */
export const metadata = {
  title: "Contract de prestări servicii psihologice",
  robots: { index: false, follow: false },
};

export default async function PaginaContract({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const contract = await db.contract.findUnique({ where: { token } });

  if (!contract || !esteTip(contract.type)) notFound();

  const sablon = SABLOANE[contract.type];
  const pretLei = Math.round(contract.price / 100);

  return (
    <main className="bg-cream-warm py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <header>
          <p className="font-sans text-[0.85rem] text-ink-muted">
            Contract nr. {contract.number}
          </p>
          <h1 className="mt-3 font-display text-[2.1rem] leading-[1.15] text-ink lg:text-[2.6rem]">
            {sablon.titlu}
          </h1>
          <p className="mt-4 font-sans text-[0.97rem] leading-relaxed text-ink-soft">
            {contract.status === "SIGNED"
              ? "Contractul e semnat. Îl poți descărca oricând de aici."
              : "Completează datele, citește contractul și semnează. Durează câteva minute."}
          </p>
        </header>

        {contract.status === "CANCELLED" ? (
          <div className="mt-10 border-l-2 border-clay bg-cream px-7 py-6">
            <p className="font-sans text-[0.95rem] text-ink">
              Contractul a fost anulat.
            </p>
            <p className="mt-2 font-sans text-[0.88rem] leading-relaxed text-ink-soft">
              Dacă e o greșeală, sună la{" "}
              <a
                href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                className="text-periwinkle underline underline-offset-4"
              >
                {SITE.phone}
              </a>
              .
            </p>
          </div>
        ) : contract.status === "SIGNED" ? (
          <div className="mt-10 border border-ink/10 bg-cream p-10 text-center sm:p-14">
            <h2 className="font-display text-2xl text-ink">
              Semnat pe{" "}
              {contract.signedAt
                ? new Intl.DateTimeFormat("ro-RO", {
                    dateStyle: "long",
                    timeZone: "Europe/Bucharest",
                  }).format(contract.signedAt)
                : ""}
            </h2>
            <a
              href={`/api/contracte/${token}/pdf`}
              className="mt-7 inline-flex items-center justify-center gap-2 bg-periwinkle px-8 py-4 font-sans text-[0.9rem] text-cream transition-colors hover:bg-ink"
            >
              <span className="mi" style={{ fontSize: "1.2rem" }} aria-hidden="true">
                download
              </span>
              Descarcă {numeDescarcare(contract.number, contract.type)}
            </a>
          </div>
        ) : (
          <>
            {/* Nimeni nu semnează ceva ce nu poate citi întâi. */}
            <a
              href={`/api/contracte/${token}/sablon`}
              target="_blank"
              rel="noreferrer"
              className="mt-9 flex items-center gap-4 border border-ink/15 bg-cream px-6 py-5 transition-colors hover:border-periwinkle"
            >
              <span
                className="mi text-periwinkle"
                style={{ fontSize: "1.6rem" }}
                aria-hidden="true"
              >
                description
              </span>
              <span>
                <span className="block font-sans text-[0.93rem] text-ink">
                  Citește contractul întreg
                </span>
                <span className="mt-0.5 block font-sans text-[0.83rem] text-ink-soft">
                  Se deschide într-o filă nouă, ca să-l poți parcurge înainte de a
                  semna.
                </span>
              </span>
            </a>

            <div className="mt-8">
              <FormularContract
                token={token}
                tip={contract.type}
                numar={contract.number}
                pretLei={pretLei}
                numeDestinatar={contract.sentToName}
                emailDestinatar={contract.sentToEmail}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
