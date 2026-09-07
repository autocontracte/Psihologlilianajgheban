import "server-only";

import Stripe from "stripe";

/* ----------------------------------------------------------------------------
   Stripe

   Cheile stau doar în .env, pe server. Nu ajung niciodată în cod, în git sau
   în browser. Cât timp lipsesc, plata online e pur și simplu ascunsă din
   interfață — restul site-ului funcționează normal.
   -------------------------------------------------------------------------- */

const SECRET = process.env.STRIPE_SECRET_KEY ?? "";

/** Fals cât timp contul nu e încă legat. Interfața se adaptează singură. */
export const platileSuntActive = Boolean(SECRET);

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!SECRET) {
    throw new Error(
      "STRIPE_SECRET_KEY lipsește. Plata online nu poate fi folosită până nu e completată în .env.",
    );
  }
  client ??= new Stripe(SECRET);
  return client;
}

/** Suma se ține în bani peste tot, deci nu mai e nevoie de conversie. */
export function baniInStripe(amount: number): number {
  return amount;
}
