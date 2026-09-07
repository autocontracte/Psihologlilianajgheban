import "server-only";

import { db } from "../db";
import type { InvoiceProvider, InvoiceRequest } from "./types";
import { noneProvider } from "./providers/none";
import { smartbillProvider } from "./providers/smartbill";
import { fgoProvider } from "./providers/fgo";

export type { InvoiceRequest, InvoiceLine, InvoiceResult } from "./types";

/* ----------------------------------------------------------------------------
   Alegerea furnizorului se face dintr-o singură variabilă de mediu.

   INVOICE_PROVIDER=SMARTBILL   (sau FGO, sau nimic)

   Cât timp nu e setată, facturile se salvează în așteptare și pot fi emise
   retroactiv din panou, după ce se conectează programul de facturare.
   -------------------------------------------------------------------------- */

const PROVIDERS: Record<string, InvoiceProvider> = {
  NONE: noneProvider,
  SMARTBILL: smartbillProvider,
  FGO: fgoProvider,
};

export function invoiceProvider(): InvoiceProvider {
  const ales = (process.env.INVOICE_PROVIDER ?? "NONE").toUpperCase();
  return PROVIDERS[ales] ?? noneProvider;
}

/** Cota de TVA folosită. Vezi avertismentul din types.ts. */
export function vatRate(): number {
  const v = Number(process.env.INVOICE_VAT_RATE);
  return Number.isFinite(v) ? v : 0;
}

/**
 * Emite factura pentru o plată și salvează rezultatul.
 *
 * Se apelează după confirmarea plății. Dacă emiterea eșuează — sau dacă încă
 * nu e ales niciun program — factura rămâne în baza de date cu status DRAFT
 * sau FAILED, cu datele complete, ca să poată fi reîncercată.
 */
export async function issueInvoiceForPayment(paymentId: string) {
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: {
      invoice: true,
      appointment: { include: { service: true, user: true } },
    },
  });

  if (!payment) return { ok: false as const, error: "Plata nu există." };
  if (payment.invoice?.status === "ISSUED") {
    return { ok: true as const, alreadyIssued: true };
  }

  const a = payment.appointment;
  const client = a.user
    ? { name: a.user.name, email: a.user.email, phone: a.user.phone }
    : {
        name: a.guestName ?? "Client",
        email: a.guestEmail ?? "",
        phone: a.guestPhone ?? undefined,
      };

  const request: InvoiceRequest = {
    client: { ...client, country: "Romania" },
    currency: payment.currency,
    issueDate: payment.paidAt ?? new Date(),
    paymentId: payment.id,
    lines: [
      {
        name: a.service.name,
        quantity: 1,
        unitPrice: payment.amount,
        vatRate: vatRate(),
      },
    ],
    note: `Ședință din ${payment.appointment.startsAt.toISOString().slice(0, 10)}`,
  };

  const provider = invoiceProvider();
  const result = provider.configured
    ? await provider.issue(request)
    : ({ ok: false, error: `Furnizorul ${provider.name} nu e configurat.` } as const);

  const date = {
    provider: provider.name,
    payload: JSON.stringify(request),
    ...(result.ok
      ? {
          status: "ISSUED",
          series: result.series ?? null,
          number: result.number ?? null,
          url: result.url ?? null,
          issuedAt: new Date(),
          error: null,
        }
      : {
          status: provider.name === "NONE" ? "DRAFT" : "FAILED",
          error: result.error,
        }),
  };

  await db.invoice.upsert({
    where: { paymentId: payment.id },
    update: date,
    create: { paymentId: payment.id, ...date },
  });

  return result;
}
