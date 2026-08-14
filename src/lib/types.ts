/* SQLite nu acceptă enum-uri native, așa că valorile sunt text în baza de date
   iar tipurile sigure sunt definite aici. */

export const ROLES = ["CLIENT", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const FORMATS = ["CABINET", "ONLINE"] as const;
export type Format = (typeof FORMATS)[number];

export const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
] as const;
export type Status = (typeof STATUSES)[number];

export const FORMAT_LABEL: Record<Format, string> = {
  CABINET: "În cabinet",
  ONLINE: "Online",
};

export const STATUS_LABEL: Record<Status, string> = {
  PENDING: "În așteptare",
  CONFIRMED: "Confirmată",
  CANCELLED: "Anulată",
  COMPLETED: "Finalizată",
};

/** Clase Tailwind pentru bulina de status. */
export const STATUS_STYLE: Record<Status, string> = {
  PENDING: "bg-clay-pale text-clay",
  CONFIRMED: "bg-sage-pale text-sage",
  CANCELLED: "bg-ink/10 text-ink-muted",
  COMPLETED: "bg-periwinkle-pale text-periwinkle",
};

export const WEEKDAYS = [
  "Duminică",
  "Luni",
  "Marți",
  "Miercuri",
  "Joi",
  "Vineri",
  "Sâmbătă",
] as const;

export function isFormat(v: unknown): v is Format {
  return typeof v === "string" && (FORMATS as readonly string[]).includes(v);
}

export function isStatus(v: unknown): v is Status {
  return typeof v === "string" && (STATUSES as readonly string[]).includes(v);
}
