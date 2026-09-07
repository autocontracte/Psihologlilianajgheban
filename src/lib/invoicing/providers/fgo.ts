import type { InvoiceProvider, InvoiceRequest, InvoiceResult } from "../types";

/* ----------------------------------------------------------------------------
   FGO

   Autentificare prin cheie de API, trimisă în corpul cererii.
   Documentație: https://www.fgo.ro/api

   Structura de mai jos urmează forma documentată, dar nu a fost încă probată
   pe un cont real — la prima emitere, verifică răspunsul înainte de a te baza
   pe automatizare.
   -------------------------------------------------------------------------- */

const KEY = process.env.FGO_API_KEY ?? "";
const CUI = process.env.FGO_CUI ?? "";
const SERIES = process.env.FGO_SERIES ?? "";

export const fgoProvider: InvoiceProvider = {
  name: "FGO",
  configured: Boolean(KEY && CUI && SERIES),

  async issue(request: InvoiceRequest): Promise<InvoiceResult> {
    if (!this.configured) {
      return { ok: false, error: "Datele de acces FGO lipsesc din .env." };
    }

    const body = {
      Hash: KEY,
      CUIClient: request.client.cui ?? "",
      DenumireClient: request.client.name,
      EmailClient: request.client.email,
      AdresaClient: request.client.address ?? "",
      Serie: SERIES,
      DataEmitere: request.issueDate.toISOString().slice(0, 10),
      Moneda: request.currency,
      Observatii: request.note ?? "",
      Continut: request.lines.map((l) => ({
        Denumire: l.name,
        UM: "buc",
        Cantitate: l.quantity,
        Pret: l.unitPrice / 100,
        Valoare: (l.unitPrice * l.quantity) / 100,
        ProcTVA: l.vatRate,
      })),
    };

    try {
      const res = await fetch("https://api.fgo.ro/v1/factura/emitere", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || json.Success === false) {
        return {
          ok: false,
          error: json.Message || `FGO a răspuns cu ${res.status}.`,
        };
      }

      return {
        ok: true,
        series: json.Serie ?? SERIES,
        number: json.Numar,
        url: json.LinkPDF ?? json.Link,
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
