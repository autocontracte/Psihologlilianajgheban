import type { InvoiceProvider, InvoiceRequest, InvoiceResult } from "../types";

/* ----------------------------------------------------------------------------
   SmartBill

   Autentificare: Basic, cu emailul contului și tokenul din Setări → Integrări.
   Documentație: https://api.smartbill.ro

   ⚠️ Înainte de prima emitere reală, verifică cu contabilul seria facturii și
   regimul de TVA. Nu ghici — o factură greșită se stornează, nu se șterge.
   -------------------------------------------------------------------------- */

const EMAIL = process.env.SMARTBILL_EMAIL ?? "";
const TOKEN = process.env.SMARTBILL_TOKEN ?? "";
const CIF = process.env.SMARTBILL_CIF ?? "";
const SERIES = process.env.SMARTBILL_SERIES ?? "";

export const smartbillProvider: InvoiceProvider = {
  name: "SMARTBILL",
  configured: Boolean(EMAIL && TOKEN && CIF && SERIES),

  async issue(request: InvoiceRequest): Promise<InvoiceResult> {
    if (!this.configured) {
      return { ok: false, error: "Datele de acces SmartBill lipsesc din .env." };
    }

    const body = {
      companyVatCode: CIF,
      client: {
        name: request.client.name,
        vatCode: request.client.cui ?? "",
        address: request.client.address ?? "",
        city: request.client.city ?? "",
        country: request.client.country ?? "Romania",
        email: request.client.email,
        isTaxPayer: Boolean(request.client.cui),
        saveToDb: false,
      },
      issueDate: request.issueDate.toISOString().slice(0, 10),
      seriesName: SERIES,
      isDraft: false,
      currency: request.currency,
      observations: request.note ?? "",
      products: request.lines.map((l) => ({
        name: l.name,
        measuringUnitName: "buc",
        currency: request.currency,
        quantity: l.quantity,
        // SmartBill lucrează în lei, nu în bani
        price: l.unitPrice / 100,
        isTaxIncluded: true,
        taxPercentage: l.vatRate,
        saveToDb: false,
        isService: true,
      })),
    };

    try {
      const res = await fetch("https://ws.smartbill.ro/SBORO/api/invoice", {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${EMAIL}:${TOKEN}`).toString("base64")}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || json.errorText) {
        return {
          ok: false,
          error: json.errorText || `SmartBill a răspuns cu ${res.status}.`,
        };
      }

      return {
        ok: true,
        series: json.series ?? SERIES,
        number: json.number,
        url: json.url,
        raw: json,
      };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Eroare de rețea.",
      };
    }
  },
};
