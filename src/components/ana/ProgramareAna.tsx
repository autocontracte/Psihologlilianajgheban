"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { labelForDateStr } from "@/lib/tz";
import { IconCalendar } from "../ui/Icons";

/* ----------------------------------------------------------------------------
   Programarea făcută direct în chatul cu Ana.

   Un formular scurt, pas cu pas: serviciul, formatul, ziua, ora, apoi datele de
   contact. Folosește exact aceleași rute ca pagina de programări
   (/api/slots/days, /api/slots, /api/appointments), deci programarea intră în
   același calendar, cu aceleași verificări.

   Datele de contact merg direct la server — nu trec prin OpenAI și nu ajung în
   conversația cu modelul.
   -------------------------------------------------------------------------- */

type Serviciu = { id: string; name: string; duration: number; price: number };
type Zi = { date: string; free: number; closed: boolean };
type Ora = { time: string; available: boolean };

const chip =
  "px-3 py-2 font-sans text-[0.82rem] transition-colors disabled:cursor-not-allowed disabled:opacity-40";
const chipLiber = `${chip} bg-white/70 text-ink hover:bg-periwinkle hover:text-cream`;
const chipAles = `${chip} bg-periwinkle text-cream`;
const camp =
  "w-full border border-ink/12 bg-white/70 px-3 py-2.5 font-sans text-[0.88rem] text-ink placeholder:text-ink-muted focus:border-periwinkle focus:outline-none";

function Pas({ numar, titlu, children }: { numar: number; titlu: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 first:mt-0">
      <p className="font-sans text-[0.78rem] text-ink-muted">
        <span className="text-periwinkle">{numar}.</span> {titlu}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function ProgramareAna({ onInchide }: { onInchide: () => void }) {
  const [servicii, setServicii] = useState<Serviciu[]>([]);
  const [serviciu, setServiciu] = useState<Serviciu | null>(null);
  const [format, setFormat] = useState<"CABINET" | "ONLINE">("CABINET");
  const [zile, setZile] = useState<Zi[] | null>(null);
  const [zi, setZi] = useState<string | null>(null);
  const [ore, setOre] = useState<Ora[] | null>(null);
  const [ora, setOra] = useState<string | null>(null);
  const [nume, setNume] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [trimite, setTrimite] = useState(false);
  const [eroare, setEroare] = useState<string | null>(null);
  const [gata, setGata] = useState(false);

  useEffect(() => {
    fetch("/api/servicii")
      .then((r) => r.json())
      .then((j) => setServicii(j.servicii ?? []))
      .catch(() => setEroare("Nu am putut încărca serviciile. Încearcă pagina de programări."));
  }, []);

  // Zilele cu locuri libere, pentru serviciul ales
  useEffect(() => {
    if (!serviciu) return;
    setZile(null);
    setZi(null);
    setOra(null);
    fetch(`/api/slots/days?serviceId=${serviciu.id}&days=45`)
      .then((r) => r.json())
      .then((j) => setZile((j.days ?? []).filter((d: Zi) => !d.closed && d.free > 0).slice(0, 12)))
      .catch(() => setZile([]));
  }, [serviciu]);

  // Orele libere din ziua aleasă
  useEffect(() => {
    if (!serviciu || !zi) return;
    setOre(null);
    setOra(null);
    fetch(`/api/slots?serviceId=${serviciu.id}&date=${zi}`)
      .then((r) => r.json())
      .then((j) => setOre((j.slots ?? []).filter((s: Ora) => s.available)))
      .catch(() => setOre([]));
  }, [serviciu, zi]);

  async function confirma() {
    if (!serviciu || !zi || !ora) return;
    setTrimite(true);
    setEroare(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: serviciu.id,
          date: zi,
          time: ora,
          format,
          name: nume,
          email,
          phone: telefon,
          notes: "Programare făcută din chatul cu Ana.",
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "Programarea nu a putut fi înregistrată.");
      setGata(true);
    } catch (e) {
      setEroare(e instanceof Error ? e.message : "Programarea nu a putut fi înregistrată.");
    } finally {
      setTrimite(false);
    }
  }

  if (gata && serviciu && zi && ora) {
    return (
      <div className="glass p-5">
        <p className="font-display text-[1.1rem] text-ink">Gata, te-am programat.</p>
        <p className="mt-2 font-sans text-[0.86rem] leading-relaxed text-ink-soft">
          {serviciu.name}, {labelForDateStr(zi)}, ora {ora},{" "}
          {format === "ONLINE" ? "online" : "în cabinet"}. Liliana îți confirmă programarea în cel
          mai scurt timp, pe email sau la telefon.
        </p>
        <button
          type="button"
          onClick={onInchide}
          className="mt-4 font-sans text-[0.82rem] text-periwinkle underline underline-offset-4 hover:text-ink"
        >
          Înapoi la conversație
        </button>
      </div>
    );
  }

  const contactValid =
    nume.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) &&
    telefon.replace(/\D/g, "").length >= 9;

  return (
    <div className="glass p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-2 font-display text-[1.05rem] text-ink">
          <IconCalendar className="h-5 w-5 text-periwinkle" />
          Programează-te aici
        </p>
        <button
          type="button"
          onClick={onInchide}
          aria-label="Închide formularul de programare"
          className="flex h-8 w-8 shrink-0 items-center justify-center text-ink-soft transition-colors hover:bg-ink hover:text-cream"
        >
          <span className="mi text-[1.1rem]">close</span>
        </button>
      </div>

      <div className="mt-4">
        <Pas numar={1} titlu="Ce serviciu">
          <div className="flex flex-col gap-1.5">
            {servicii.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setServiciu(s)}
                className={`${serviciu?.id === s.id ? chipAles : chipLiber} text-left`}
              >
                <span className="block">{s.name}</span>
                <span className={`block text-[0.76rem] ${serviciu?.id === s.id ? "text-cream/75" : "text-ink-muted"}`}>
                  {Math.round(s.price / 100)} lei, {s.duration} min
                </span>
              </button>
            ))}
          </div>
        </Pas>

        {serviciu && (
          <Pas numar={2} titlu="Unde">
            <div className="flex gap-1.5">
              {(["CABINET", "ONLINE"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={format === f ? chipAles : chipLiber}
                >
                  {f === "CABINET" ? "În cabinet" : "Online"}
                </button>
              ))}
            </div>
          </Pas>
        )}

        {serviciu && (
          <Pas numar={3} titlu="Ziua">
            {zile === null ? (
              <p className="font-sans text-[0.82rem] text-ink-muted">Caut zilele libere…</p>
            ) : zile.length === 0 ? (
              <p className="font-sans text-[0.82rem] text-ink-soft">
                Nu mai sunt locuri libere în perioada următoare. Sună-o pe Liliana, poate găsiți
                împreună o variantă.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {zile.map((d) => (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => setZi(d.date)}
                    className={zi === d.date ? chipAles : chipLiber}
                  >
                    {labelForDateStr(d.date).replace(/^./, (c) => c.toUpperCase())}
                  </button>
                ))}
              </div>
            )}
          </Pas>
        )}

        {zi && (
          <Pas numar={4} titlu="Ora">
            {ore === null ? (
              <p className="font-sans text-[0.82rem] text-ink-muted">Caut orele libere…</p>
            ) : ore.length === 0 ? (
              <p className="font-sans text-[0.82rem] text-ink-soft">Ziua s-a ocupat între timp. Alege alta.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {ore.map((o) => (
                  <button
                    key={o.time}
                    type="button"
                    onClick={() => setOra(o.time)}
                    className={ora === o.time ? chipAles : chipLiber}
                  >
                    {o.time}
                  </button>
                ))}
              </div>
            )}
          </Pas>
        )}

        {ora && (
          <Pas numar={5} titlu="Cum te contactează Liliana">
            <div className="space-y-2">
              <input className={camp} placeholder="Numele tău" value={nume} onChange={(e) => setNume(e.target.value)} autoComplete="name" maxLength={100} />
              <input className={camp} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={150} />
              <input className={camp} placeholder="Telefon" type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} autoComplete="tel" maxLength={30} />
            </div>
            <p className="mt-2 font-sans text-[0.72rem] leading-snug text-ink-muted">
              Datele merg direct la Liliana, nu la Ana. Prin programare ești de acord cu{" "}
              <Link href="/termeni" className="text-periwinkle underline underline-offset-2">
                termenii
              </Link>{" "}
              și cu{" "}
              <Link href="/confidentialitate" className="text-periwinkle underline underline-offset-2">
                politica de confidențialitate
              </Link>
              .
            </p>
            <button
              type="button"
              onClick={confirma}
              disabled={!contactValid || trimite}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 bg-periwinkle px-4 py-3 font-sans text-[0.88rem] text-cream transition-colors hover:bg-ink disabled:opacity-40"
            >
              {trimite ? "Se înregistrează…" : `Confirmă programarea, ora ${ora}`}
            </button>
          </Pas>
        )}

        {eroare && <p className="mt-3 bg-clay-pale px-3 py-2 font-sans text-[0.8rem] text-clay">{eroare}</p>}
      </div>
    </div>
  );
}
