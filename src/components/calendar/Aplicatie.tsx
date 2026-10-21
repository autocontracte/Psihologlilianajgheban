"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Menu, Plus, Search, X } from "lucide-react";
import {
  LUNI_LUNGI,
  addDays,
  lunaPlus,
  mondayOf,
  phoneDate,
  shortDate,
  type Ev,
  type LunaCal,
} from "@/lib/calendarTelefon";
import { cere, type Strat, type Vedere } from "./comun";
import { Detalii } from "./Detalii";
import { Formular, type Propunere } from "./Formular";
import { Luna } from "./Luna";
import { Sertar } from "./Sertar";
import { An, FoaieZi, Ore, Program, Rand } from "./Vederi";

/* ----------------------------------------------------------------------------
   Calendarul Lilianei, ca aplicația de calendar a telefonului: programările
   clienților de pe site și tot ce e în Google Calendar, în vederile An, Lună,
   Săptămână, Zi și Program, cu meniul lateral și „Adăugare" jos. Se poate
   instala pe telefon. Ultima vedere și ce e ascuns se țin minte.
   -------------------------------------------------------------------------- */

type InstallEvent = Event & { prompt: () => Promise<void> };

const VEDERI: Vedere[] = ["an", "luna", "saptamana", "zi", "program"];

function citeste<T>(key: string, fallback: T): T {
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function scrie(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* fără memorie locală, aplicația merge oricum */
  }
}

/** Fără diacritice și majuscule, pentru căutare. */
function simplu(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function Aplicatie({ initial }: { initial: LunaCal }) {
  const [data, setData] = useState(initial);
  const [vedere, setVedere] = useState<Vedere>("luna");
  const [selected, setSelected] = useState(initial.today);
  const [ascunse, setAscunse] = useState<Strat[]>([]);
  const [sertar, setSertar] = useState(false);
  const [foaie, setFoaie] = useState<string | null>(null);
  const [nou, setNou] = useState<Propunere | null>(null);
  const [detalii, setDetalii] = useState<Ev | null>(null);
  const [cauta, setCauta] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [install, setInstall] = useState<InstallEvent | null>(null);
  /** vederile de dinainte, pentru „înapoi" (din Zi înapoi în Lună etc.) */
  const [istoric, setIstoric] = useState<Vedere[]>([]);
  const loadSeq = useRef(0);

  /* ---------------------------------------------------------- Încărcare */

  const load = useCallback(async (day: string, quiet = false) => {
    const mine = ++loadSeq.current;
    try {
      const m = await cere<LunaCal>(`/api/admin/calendar?zi=${day}`);
      if (mine !== loadSeq.current) return;
      setData(m);
      setError("");
    } catch (err) {
      if (mine === loadSeq.current && !quiet) setError(err instanceof Error ? err.message : "Nu am putut încărca luna.");
    }
  }, []);

  // luna încărcată urmează ziua aleasă (în săptămână, și zilele vecine)
  useEffect(() => {
    const need = vedere === "saptamana" ? [mondayOf(selected), addDays(mondayOf(selected), 6)] : [selected];
    if (need.some((d) => d < data.start || d > data.end) || (vedere === "luna" && selected.slice(0, 7) !== data.month.slice(0, 7))) {
      load(selected);
    }
  }, [selected, vedere, data.start, data.end, data.month, load]);

  const liber = !nou && !detalii;
  useEffect(() => {
    if (!liber) return;
    const refresh = () => document.visibilityState === "visible" && load(selected, true);
    const timer = setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [liber, selected, load]);

  /* ------------------------------------------- Pornire, memorie, instalare */

  useEffect(() => {
    const saved = citeste<string>("cal-vedere", "");
    if (VEDERI.includes(saved as Vedere)) setVedere(saved as Vedere);
    setAscunse(citeste<Strat[]>("cal-ascunse", []));

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/calendar-sw.js", { scope: "/calendar" }).catch(() => {});
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstall(e as InstallEvent);
    };
    const onInstalled = () => setInstall(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(t);
  }, [notice]);

  /** `adanc`: s-a intrat dintr-o vedere în alta (lună → zi), deci „înapoi" revine.
      Din meniu, vederea nouă devine punctul de pornire. */
  function alegeVedere(v: Vedere, adanc = false) {
    scrie("cal-vedere", v);
    setIstoric(adanc ? [...istoric, vedere].slice(-10) : []);
    setVedere(v);
  }

  /* ------------------------------------------------- Butonul „înapoi"

     Pe Android, „înapoi" ar scoate din aplicație: pagina nu are istoric.
     Cât e ceva de închis sau de întors, ținem o intrare în plus în istoricul
     browserului; „înapoi" o consumă, iar noi închidem ce e deasupra (detaliile,
     formularul, foaia zilei, meniul, căutarea) sau revenim la vederea de
     dinainte. Când nu mai e nimic, intrarea dispare și „înapoi" iese. */

  const adanc = !!detalii || !!nou || !!foaie || sertar || cauta !== null || istoric.length > 0;
  const armat = useRef(false);
  const ignora = useRef(false);
  const [rearmeaza, setRearmeaza] = useState(0);

  useEffect(() => {
    if (adanc && !armat.current) {
      window.history.pushState({ calendar: true }, "");
      armat.current = true;
    } else if (!adanc && armat.current) {
      // s-a închis din aplicație: scoatem intrarea, fără să mai facem nimic la ea
      armat.current = false;
      ignora.current = true;
      window.history.back();
    }
  }, [adanc, rearmeaza]);

  const inapoi = useRef<() => void>(() => {});
  inapoi.current = () => {
    if (detalii) setDetalii(null);
    else if (nou) setNou(null);
    else if (foaie) setFoaie(null);
    else if (sertar) setSertar(false);
    else if (cauta !== null) setCauta(null);
    else if (istoric.length) {
      const prev = istoric[istoric.length - 1];
      setIstoric(istoric.slice(0, -1));
      scrie("cal-vedere", prev);
      setVedere(prev);
    }
  };

  useEffect(() => {
    const onPop = () => {
      if (ignora.current) {
        ignora.current = false;
        return;
      }
      armat.current = false;
      inapoi.current();
      setRearmeaza((n) => n + 1);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function alegeAscunse(a: Strat[]) {
    setAscunse(a);
    scrie("cal-ascunse", a);
  }

  const gata = useCallback(
    (msg: string) => {
      setNou(null);
      setDetalii(null);
      setNotice(msg);
      load(selected, true);
    },
    [load, selected],
  );

  /* ------------------------------------------------------------- Bara */

  const lunaAfisata = vedere === "luna" ? data.month : `${selected.slice(0, 7)}-01`;
  const numeLuna = `${LUNI_LUNGI[Number(lunaAfisata.slice(5, 7)) - 1]}${lunaAfisata.slice(0, 4) === data.today.slice(0, 4) ? "" : ` ${lunaAfisata.slice(0, 4)}`}`;
  const titlu =
    vedere === "an" ? selected.slice(0, 4) : vedere === "zi" ? phoneDate(selected) : vedere === "program" ? "Program" : numeLuna;

  function muta(dir: 1 | -1) {
    if (vedere === "an") setSelected(`${Number(selected.slice(0, 4)) + dir}${selected.slice(4, 8)}01`);
    else if (vedere === "zi") setSelected(addDays(selected, dir));
    else if (vedere === "saptamana") setSelected(addDays(selected, 7 * dir));
    else {
      const first = lunaPlus(`${selected.slice(0, 7)}-01`, dir);
      setSelected(first.slice(0, 7) === data.today.slice(0, 7) ? data.today : first);
    }
  }

  const rezultate = useMemo(() => {
    if (cauta === null || cauta.trim().length < 2) return [];
    const q = simplu(cauta.trim());
    return data.events.filter((e) =>
      simplu(e.kind === "prog" ? `${e.title} ${e.client.phone} ${e.client.email} ${e.service}` : e.title).includes(q),
    );
  }, [cauta, data]);

  const unealta = "flex h-12 w-12 items-center justify-center rounded-full text-ink transition-colors hover:bg-cream-deep";
  const saptamana = Array.from({ length: 7 }, (_, i) => addDays(mondayOf(selected), i));

  return (
    <div className="flex h-dvh flex-col bg-cream">
      <header className="flex shrink-0 items-center gap-1 px-2 pb-1 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4">
        {cauta === null ? (
          <>
            <button type="button" onClick={() => setSertar(true)} aria-label="Meniu" className={unealta}>
              <Menu className="h-7 w-7" />
            </button>
            <button
              type="button"
              onClick={() => vedere === "luna" && alegeVedere("an", true)}
              className="ml-1 min-w-0 truncate rounded-[0.8rem] px-2 py-1 text-left font-sans text-[1.85rem] font-bold tracking-tight text-ink"
            >
              {titlu}
            </button>
            {vedere !== "program" && (
              <span className="hidden items-center md:flex">
                <button type="button" onClick={() => muta(-1)} aria-label="Înapoi" className={unealta}>
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button type="button" onClick={() => muta(1)} aria-label="Înainte" className={unealta}>
                  <ChevronRight className="h-6 w-6" />
                </button>
              </span>
            )}
            <span className="flex-1" />
            <button type="button" onClick={() => setCauta("")} aria-label="Caută" className={unealta}>
              <Search className="h-6 w-6" />
            </button>
            <button type="button" onClick={() => setSelected(data.today)} aria-label="Azi" title="Azi" className={unealta}>
              <span className="flex h-8 w-8 items-center justify-center rounded-[0.55rem] border-2 border-ink font-sans text-[0.95rem] font-bold tabular-nums">
                {Number(data.today.slice(8))}
              </span>
            </button>
          </>
        ) : (
          <>
            <input
              autoFocus
              value={cauta}
              onChange={(e) => setCauta(e.target.value)}
              placeholder="Caută un client, un telefon, un eveniment"
              className="h-12 min-w-0 flex-1 rounded-full bg-cream-warm px-5 font-sans text-[1.1rem] text-ink placeholder:text-ink-muted focus:outline-none focus:ring-4 focus:ring-periwinkle/20"
            />
            <button type="button" onClick={() => setCauta(null)} aria-label="Închide căutarea" className={unealta}>
              <X className="h-6 w-6" />
            </button>
          </>
        )}
      </header>

      {(error || data.google.eroare) && (
        <p role="alert" className="mx-3 mb-2 rounded-[1rem] bg-clay-pale px-4 py-2.5 font-sans text-[0.95rem] text-clay">
          {error || data.google.eroare}
        </p>
      )}

      {cauta !== null ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-10">
          <p className="px-1 py-2 font-sans text-[0.9rem] text-ink-muted">
            {cauta.trim().length < 2 ? "Scrie cel puțin două litere." : `${rezultate.length} rezultate în ${numeLuna} (și zilele vecine)`}
          </p>
          <div className="space-y-2">
            {rezultate.map((e) => (
              <div key={e.id}>
                <p className="px-1 pb-1 font-sans text-[0.85rem] text-ink-muted">{phoneDate(e.date)}</p>
                <Rand e={e} onClick={() => setDetalii(e)} />
              </div>
            ))}
          </div>
        </div>
      ) : vedere === "luna" ? (
        <Luna data={data} selected={selected} ascunse={ascunse} onSelect={setSelected} onOpen={setFoaie} onSwipe={muta} />
      ) : vedere === "an" ? (
        <An
          year={Number(selected.slice(0, 4))}
          today={data.today}
          onMonth={(first) => {
            setSelected(first.slice(0, 7) === data.today.slice(0, 7) ? data.today : first);
            alegeVedere("luna", true);
          }}
          onSwipe={muta}
        />
      ) : vedere === "zi" || vedere === "saptamana" ? (
        <Ore
          data={data}
          dates={vedere === "zi" ? [selected] : saptamana}
          ascunse={ascunse}
          onEv={setDetalii}
          onNew={(date, start) => setNou({ date, start })}
          onSwipe={muta}
          onDay={(d) => {
            setSelected(d);
            alegeVedere("zi", true);
          }}
        />
      ) : (
        <Program data={data} from={selected} ascunse={ascunse} onEv={setDetalii} onNext={() => muta(1)} />
      )}

      {/* Adăugare 22 oct. + */}
      {vedere !== "an" && cauta === null && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => setNou({ date: selected })}
            className="pointer-events-auto flex w-[min(30rem,calc(100%-6rem))] items-center justify-between rounded-full bg-cream-warm py-3.5 pl-7 pr-5 font-sans text-[1.25rem] text-ink-soft shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)] ring-1 ring-ink/5 transition-colors hover:bg-white"
          >
            Adăugare {shortDate(selected)}
            <Plus className="h-8 w-8 text-ink" strokeWidth={1.75} />
          </button>
        </div>
      )}

      {notice && (
        <div className="fixed inset-x-0 bottom-24 z-30 flex justify-center px-4" role="status">
          <button type="button" onClick={() => setNotice("")} className="max-w-md rounded-[1rem] bg-ink px-5 py-3 font-sans text-[1rem] text-cream shadow-lg">
            {notice}
          </button>
        </div>
      )}

      <Sertar
        open={sertar}
        onClose={() => setSertar(false)}
        vedere={vedere}
        onVedere={alegeVedere}
        ascunse={ascunse}
        onAscunse={alegeAscunse}
        google={data.google.activ}
        onSincronizat={(msg) => {
          setNotice(msg);
          load(selected, true);
        }}
        install={
          install
            ? () => {
                install.prompt().catch(() => {});
                setInstall(null);
              }
            : null
        }
      />

      {foaie && (
        <FoaieZi
          data={data}
          date={foaie}
          ascunse={ascunse}
          onClose={() => setFoaie(null)}
          onEv={(e) => {
            setFoaie(null);
            setDetalii(e);
          }}
          onAdd={() => {
            setFoaie(null);
            setNou({ date: foaie });
          }}
          onDay={() => {
            setFoaie(null);
            setSelected(foaie);
            alegeVedere("zi", true);
          }}
        />
      )}

      {nou && (
        <Formular
          data={data}
          propunere={nou}
          onClose={() => setNou(null)}
          onDone={(msg, date) => {
            setSelected(date);
            gata(msg);
          }}
        />
      )}

      {detalii && <Detalii e={detalii} onClose={() => setDetalii(null)} onDone={gata} />}
    </div>
  );
}
