import type { InvoiceProvider, InvoiceRequest, InvoiceResult } from "../types";

/**
 * Furnizorul implicit, cât timp nu e ales niciun program de facturare.
 *
 * Nu emite nimic, dar nici nu pierde nimic: datele facturii se salvează în
 * baza de date cu status DRAFT. Când se alege programul, facturile în așteptare
 * pot fi emise retroactiv din panou.
 */
export const noneProvider: InvoiceProvider = {
  name: "NONE",
  configured: true,

  async issue(_request: InvoiceRequest): Promise<InvoiceResult> {
    return {
      ok: false,
      error:
        "Nu este configurat niciun program de facturare. Datele au fost salvate și factura poate fi emisă mai târziu.",
    };
  },
};
