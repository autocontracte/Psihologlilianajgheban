"use client";

import { Fragment, useEffect, useState } from "react";
import { ChevronDown, Printer } from "lucide-react";
import { longDate, minToTime } from "@/lib/programator/reguli";
import type { SituatieRand } from "@/lib/programator/situatie";
import { butonSimplu } from "./comun";

/** Ore cu zecimale, ca să se poată înmulți ușor cu prețul: 90 de minute = „1,5". */
function ore(min: number): string {
  return (min / 60).toLocaleString("ro-RO", { maximumFractionDigits: 2 });
}

function lei(v: number): string {
  return v.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const th = "px-3 py-2.5 text-right font-sans text-[0.78rem] font-semibold text-ink-soft";
const td = "px-3 py-3 text-right font-sans text-[1rem] tabular-nums text-ink";

export function Situatie({ rows, monthLabel }: { rows: SituatieRand[]; monthLabel: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const [pret, setPret] = useState("");

  /* Prețul pe oră e doar un ajutor de calcul: se ține minte pe calculatorul
     acesta, nu se salvează pe server. */
  useEffect(() => {
    setPret(window.localStorage.getItem("prog-pret-ora") ?? "");
  }, []);
  const price = Number(pret.replace(",", "."));
  const withPrice = Number.isFinite(price) && price > 0;

  const total = rows.reduce(
    (t, r) => ({
      sessions: t.sessions + r.sessions,
      minutes: t.minutes + r.minutes,
      cancelled: t.cancelled + r.cancelled,
      cancelledMinutes: t.cancelledMinutes + r.cancelledMinutes,
      payableMinutes: t.payableMinutes + r.payableMinutes,
    }),
    { sessions: 0, minutes: 0, cancelled: 0, cancelledMinutes: 0, payableMinutes: 0 },
  );

  return (
    <div className="mt-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 print:hidden">
        <div>
          <label htmlFor="pret-ora" className="mb-1.5 block font-sans text-[0.78rem] font-semibold text-ink-soft">
            Preț pe oră, în lei (opțional)
          </label>
          <input
            id="pret-ora"
            inputMode="decimal"
            value={pret}
            placeholder="ex. 40"
            onChange={(e) => {
              setPret(e.target.value);
              window.localStorage.setItem("prog-pret-ora", e.target.value);
            }}
            className="h-11 w-36 border border-ink/20 bg-cream-warm px-3 font-sans text-[1rem] text-ink focus:border-periwinkle focus:outline-none focus:ring-4 focus:ring-periwinkle/15"
          />
          <p className="mt-1.5 font-sans text-[0.8rem] text-ink-muted">
            Același pentru toți. Se ține minte doar pe calculatorul acesta.
          </p>
        </div>
        <button type="button" onClick={() => window.print()} className={`${butonSimplu} min-h-11`}>
          <Printer className="h-4 w-4" />
          Tipărește
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="bg-cream-warm px-5 py-8 text-center font-sans text-[1rem] text-ink-soft">
          Nicio rezervare a chiriașilor în {monthLabel}.
        </p>
      ) : (
        <div className="overflow-x-auto border border-ink/10 bg-cream-warm">
          <table className="w-full min-w-[40rem] border-collapse">
            <thead>
              <tr className="border-b border-ink/15">
                <th className="px-3 py-2.5 text-left font-sans text-[0.78rem] font-semibold text-ink-soft">Chiriaș</th>
                <th className={th}>Ședințe</th>
                <th className={th}>Ore rezervate</th>
                <th className={th}>Anulate târziu</th>
                <th className={th}>Ore anulate</th>
                <th className={th}>Ore de plată</th>
                {withPrice && <th className={th}>De plată (lei)</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const on = open === r.personId;
                return (
                  <Fragment key={r.personId}>
                    <tr className="border-b border-ink/10">
                      <td className="px-3 py-1.5 text-left">
                        <button
                          type="button"
                          aria-expanded={on}
                          onClick={() => setOpen(on ? null : r.personId)}
                          className="flex min-h-11 w-full items-center gap-2.5 text-left font-sans text-[1rem] font-semibold text-ink transition-colors hover:text-periwinkle"
                        >
                          <span className="inline-block h-5 w-5 shrink-0" style={{ background: r.color }} />
                          {r.name}
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-ink-soft transition-transform print:hidden ${on ? "rotate-180" : ""}`}
                          />
                        </button>
                      </td>
                      <td className={td}>{r.sessions}</td>
                      <td className={td}>{ore(r.minutes)}</td>
                      <td className={`${td} ${r.cancelled ? "font-semibold text-clay" : "text-ink-muted"}`}>{r.cancelled}</td>
                      <td className={`${td} ${r.cancelled ? "text-clay" : "text-ink-muted"}`}>{ore(r.cancelledMinutes)}</td>
                      <td className={`${td} font-semibold`}>{ore(r.payableMinutes)}</td>
                      {withPrice && <td className={`${td} font-semibold`}>{lei((r.payableMinutes / 60) * price)}</td>}
                    </tr>
                    {on && (
                      <tr className="border-b border-ink/10 bg-cream">
                        <td colSpan={withPrice ? 7 : 6} className="px-3 py-3">
                          <ul className="divide-y divide-ink/8 font-sans text-[0.92rem]">
                            {r.items.map((it) => (
                              <li key={it.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 py-1.5">
                                <span className={`w-52 first-letter:uppercase ${it.cancelled ? "text-ink-soft line-through" : "text-ink"}`}>
                                  {longDate(it.date)}
                                </span>
                                <span className="w-24 text-ink-soft">{it.room}</span>
                                <span className="w-28 tabular-nums text-ink">
                                  {minToTime(it.start)}–{minToTime(it.end)}
                                </span>
                                <span className="w-16 tabular-nums text-ink-soft">{ore(it.end - it.start)} h</span>
                                {it.cancelled && (
                                  <span className="font-semibold text-clay">anulată târziu · se plătește {it.cancelFee}%</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-ink/25">
                <td className="px-3 py-3 text-left font-sans text-[1rem] font-semibold text-ink">Total</td>
                <td className={`${td} font-semibold`}>{total.sessions}</td>
                <td className={`${td} font-semibold`}>{ore(total.minutes)}</td>
                <td className={`${td} font-semibold`}>{total.cancelled}</td>
                <td className={`${td} font-semibold`}>{ore(total.cancelledMinutes)}</td>
                <td className={`${td} font-semibold`}>{ore(total.payableMinutes)}</td>
                {withPrice && <td className={`${td} font-semibold`}>{lei((total.payableMinutes / 60) * price)}</td>}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <p className="mt-3 font-sans text-[0.85rem] text-ink-muted print:hidden">
        Apasă pe un nume ca să vezi ședințele lui, zi cu zi. Orele de plată = orele rezervate + partea plătită din
        cele anulate târziu.
      </p>
    </div>
  );
}
