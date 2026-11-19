import "server-only";

import { calculeaza, chestionar, type Raspunsuri } from "./chestionare";
import { parte } from "./parti";

/* Ce înseamnă o comandă (GuideOrder) pentru ghidul pe părți: chestionarul,
   răspunsurile, rezultatul și partea aleasă (sau, până la alegere, cea
   recomandată). `null` pentru comenzile vechi ale trusei întregi. */

type ComandaBruta = { chestionar: number | null; parte: number | null; answers: string };

export function raspunsuriText(comanda: { answers: string }): Raspunsuri {
  try {
    const o = JSON.parse(comanda.answers);
    if (!o || typeof o !== "object") return {};
    return Object.fromEntries(Object.entries(o).filter(([, v]) => typeof v === "string")) as Raspunsuri;
  } catch {
    return {};
  }
}

export function dateParte(comanda: ComandaBruta) {
  const ch = chestionar(comanda.chestionar);
  if (!ch) return null;
  const r = raspunsuriText(comanda);
  const rez = calculeaza(ch, r);
  const aleasa = parte(comanda.parte) ?? rez?.recomandata ?? parte(ch.parte)!;
  return { chestionar: ch, raspunsuri: r, rezultat: rez, parte: aleasa };
}
