import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/tz";
import { clientOf } from "@/lib/appointments";
import { platileSuntActive } from "@/lib/stripe";
import { invoiceProvider, vatRate } from "@/lib/invoicing";
import { InvoiceButton } from "@/components/admin/InvoiceButton";

export const metadata = { title: "Plăți și facturi" };

const STARE_PLATA: Record<string, { text: string; stil: string }> = {
  PENDING: { text: "În așteptare", stil: "bg-clay-pale text-clay" },
  PAID: { text: "Plătită", stil: "bg-periwinkle-pale text-periwinkle" },
  FAILED: { text: "Eșuată", stil: "bg-ink/8 text-ink-muted" },
  REFUNDED: { text: "Returnată", stil: "bg-ink/8 text-ink-muted" },
};

const STARE_FACTURA: Record<string, { text: string; stil: string }> = {
  DRAFT: { text: "În așteptare", stil: "bg-clay-pale text-clay" },
  ISSUED: { text: "Emisă", stil: "bg-periwinkle-pale text-periwinkle" },
  FAILED: { text: "Eșuată", stil: "bg-clay-pale text-clay" },
};

const lei = (bani: number) => (bani / 100).toFixed(0);

export default async function AdminPlatiPage() {
  const [payments, provider] = await Promise.all([
    db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        invoice: true,
        appointment: { include: { service: true, user: true } },
      },
    }),
    Promise.resolve(invoiceProvider()),
  ]);

  const incasat = payments
    .filter((p) => p.status === "PAID")
    .reduce((s, p) => s + p.amount, 0);

  const facturiInAsteptare = payments.filter(
    (p) => p.status === "PAID" && p.invoice?.status !== "ISSUED",
  ).length;

  const facturareActiva = provider.name !== "NONE" && provider.configured;

  return (
    <div>
      <h1 className="font-display text-3xl text-ink lg:text-4xl">
        Plăți și facturi
      </h1>

      {/* Starea configurării — prima întrebare la care vrei răspuns aici */}
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-cream p-5">
          <p className="font-sans text-[0.8rem] text-ink-muted">Încasat</p>
          <p className="mt-2 font-display text-3xl text-ink">{lei(incasat)} lei</p>
        </div>
        <div className="bg-cream p-5">
          <p className="font-sans text-[0.8rem] text-ink-muted">Plăți</p>
          <p className="mt-2 font-display text-3xl text-ink">{payments.length}</p>
        </div>
        <div className="bg-cream p-5">
          <p className="font-sans text-[0.8rem] text-ink-muted">Plata online</p>
          <p
            className={`mt-2 font-display text-xl ${platileSuntActive ? "text-periwinkle" : "text-clay"}`}
          >
            {platileSuntActive ? "Activă" : "Neconfigurată"}
          </p>
        </div>
        <div className="bg-cream p-5">
          <p className="font-sans text-[0.8rem] text-ink-muted">Facturare</p>
          <p
            className={`mt-2 font-display text-xl ${facturareActiva ? "text-periwinkle" : "text-clay"}`}
          >
            {facturareActiva ? provider.name : "Neconfigurată"}
          </p>
        </div>
      </div>

      {/* Ce mai e de făcut ca să funcționeze */}
      {(!platileSuntActive || !facturareActiva) && (
        <div className="mt-5 border-l-2 border-clay bg-cream px-6 py-5">
          <p className="font-sans text-[0.95rem] text-ink">Ce mai lipsește</p>
          <ul className="mt-3 space-y-2 font-sans text-[0.88rem] leading-relaxed text-ink-soft">
            {!platileSuntActive && (
              <li>
                <span className="text-ink">Plata online:</span> completează{" "}
                <code className="bg-cream-deep px-1.5 py-0.5 text-[0.85em]">
                  STRIPE_SECRET_KEY
                </code>{" "}
                și{" "}
                <code className="bg-cream-deep px-1.5 py-0.5 text-[0.85em]">
                  STRIPE_WEBHOOK_SECRET
                </code>{" "}
                în <code className="text-[0.85em]">.env</code>, pe server. Până
                atunci butonul de plată nu apare deloc pe site.
              </li>
            )}
            {!facturareActiva && (
              <li>
                <span className="text-ink">Facturarea:</span> alege programul din{" "}
                <code className="bg-cream-deep px-1.5 py-0.5 text-[0.85em]">
                  INVOICE_PROVIDER
                </code>{" "}
                (SMARTBILL sau FGO) și completează datele de acces. Până atunci
                fiecare plată își păstrează datele de facturare, iar facturile
                pot fi emise retroactiv de aici.
              </li>
            )}
            <li className="text-ink-muted">
              Cota de TVA folosită acum: {vatRate()}%. Confirm-o cu contabilul
              înainte de prima factură reală.
            </li>
          </ul>
        </div>
      )}

      {facturiInAsteptare > 0 && facturareActiva && (
        <p className="mt-5 border-l-2 border-clay bg-cream px-6 py-4 font-sans text-[0.9rem] text-ink-soft">
          {facturiInAsteptare} plăți încasate așteaptă factură.
        </p>
      )}

      {/* Lista */}
      <div className="mt-8 space-y-3">
        {payments.length === 0 ? (
          <p className="bg-cream px-6 py-10 text-center font-sans text-[0.9rem] text-ink-soft">
            Nicio plată încă.
          </p>
        ) : (
          payments.map((p) => {
            const client = clientOf(p.appointment);
            const plata = STARE_PLATA[p.status] ?? STARE_PLATA.PENDING;
            const factura = p.invoice
              ? (STARE_FACTURA[p.invoice.status] ?? STARE_FACTURA.DRAFT)
              : null;

            return (
              <article key={p.id} className="bg-cream p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={`px-3 py-1.5 font-sans text-[0.78rem] ${plata.stil}`}
                      >
                        {plata.text}
                      </span>
                      {factura && (
                        <span
                          className={`px-3 py-1.5 font-sans text-[0.78rem] ${factura.stil}`}
                        >
                          Factură: {factura.text}
                        </span>
                      )}
                    </div>

                    <p className="mt-3 font-display text-[1.2rem] text-ink">
                      {lei(p.amount)} {p.currency} · {p.appointment.service.name}
                    </p>

                    <p className="mt-1.5 font-sans text-[0.87rem] text-ink-soft">
                      {client.name} · {client.email}
                    </p>

                    <p className="mt-1 font-sans text-[0.8rem] text-ink-muted">
                      Ședința din {formatDateTime(p.appointment.startsAt)}
                      {p.paidAt && ` · plătită ${formatDateTime(p.paidAt)}`}
                    </p>

                    {p.invoice?.number && (
                      <p className="mt-2 font-sans text-[0.87rem] text-ink">
                        Factura {p.invoice.series} {p.invoice.number}
                        {p.invoice.url && (
                          <>
                            {" · "}
                            <a
                              href={p.invoice.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-periwinkle underline underline-offset-4 hover:text-ink"
                            >
                              deschide
                            </a>
                          </>
                        )}
                      </p>
                    )}

                    {p.invoice?.error && (
                      <p className="mt-2 bg-clay-pale px-4 py-2.5 font-sans text-[0.82rem] text-clay">
                        {p.invoice.error}
                      </p>
                    )}
                  </div>

                  {p.status === "PAID" && p.invoice?.status !== "ISSUED" && (
                    <InvoiceButton
                      paymentId={p.id}
                      disabled={!facturareActiva}
                    />
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
