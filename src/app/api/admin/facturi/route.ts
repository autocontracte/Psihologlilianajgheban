import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { issueInvoiceForPayment, invoiceProvider } from "@/lib/invoicing";

/** POST — emite (sau reîncearcă) factura pentru o plată. Doar administratorul. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const paymentId = String(body.paymentId ?? "");
  if (!paymentId) {
    return NextResponse.json({ error: "Lipsește plata." }, { status: 400 });
  }

  const provider = invoiceProvider();
  if (!provider.configured || provider.name === "NONE") {
    return NextResponse.json(
      {
        error:
          "Nu e configurat niciun program de facturare. Completează INVOICE_PROVIDER și datele de acces în .env.",
      },
      { status: 503 },
    );
  }

  const result = await issueInvoiceForPayment(paymentId);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
