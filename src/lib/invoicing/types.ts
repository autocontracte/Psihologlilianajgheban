/* ============================================================================
   Facturare — contractul comun

   Programul de facturare nu e încă ales (SmartBill, FGO, Saga sau altul), așa
   că restul aplicației nu vorbește niciodată direct cu vreunul. Vorbește cu
   interfața de mai jos, iar la alegere se scrie un singur fișier nou în
   `providers/`. Nimic altceva nu se schimbă.
   ========================================================================== */

export type InvoiceLine = {
  name: string;
  quantity: number;
  /** În bani, ca peste tot în aplicație (28000 = 280 lei). */
  unitPrice: number;
  /**
   * Cota de TVA, în procente.
   *
   * ⚠️ Serviciile psihologice pot intra la scutire de TVA, dar asta depinde de
   * situația fiscală a cabinetului. Valoarea vine din INVOICE_VAT_RATE și
   * trebuie confirmată cu contabilul — nu o presupune.
   */
  vatRate: number;
};

export type InvoiceClient = {
  name: string;
  email: string;
  phone?: string;
  /** Pentru persoane fizice rămâne gol. */
  cui?: string;
  address?: string;
  city?: string;
  country?: string;
};

export type InvoiceRequest = {
  client: InvoiceClient;
  lines: InvoiceLine[];
  currency: string;
  issueDate: Date;
  /** Plata pentru care se emite, ca să putem lega factura de ea. */
  paymentId?: string;
  /** Ce apare pe factură ca mențiune. */
  note?: string;
};

export type InvoiceResult =
  | {
      ok: true;
      series?: string;
      number?: string;
      url?: string;
      /** Răspunsul brut, păstrat pentru depanare. */
      raw?: unknown;
    }
  | { ok: false; error: string };

export interface InvoiceProvider {
  /** Numele salvat în baza de date: NONE | SMARTBILL | FGO | SAGA */
  readonly name: string;
  /** Fals dacă lipsesc datele de acces — atunci factura rămâne în așteptare. */
  readonly configured: boolean;
  issue(request: InvoiceRequest): Promise<InvoiceResult>;
}
