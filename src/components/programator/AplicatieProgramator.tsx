"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Menu, Plus, Search, X } from "lucide-react";
import {
  LUNI_LUNGI,
  addDays,
  phoneDate,
  shortDate,
  type Month,
  type Reservation,
  type Room,
  type Week,
} from "@/lib/programator/reguli";
import { cere, type Me } from "./comun";
import { DialogCabinet } from "./DialogCabinet";
import { DialogRezervare } from "./DialogRezervare";
import { FormularNou, type Propunere } from "./FormularNou";
import { Grila } from "./Grila";
import { Sertar } from "./Sertar";
import { caSaptamana, type Ascunse, type Vedere } from "./telefon";
import { VedereLuna } from "./VedereLuna";
import { FoaieZi, VedereAn, VedereProgram, VedereZi } from "./VederiTelefon";

/* ----------------------------------------------------------------------------
   Programatorul, ca aplicația de calendar a telefonului: lună, an, zi și
   program, meniul lateral și „Adăugare" jos. Vederea „Săptămână" e grila de
   până acum. Pe telefon (și instalat ca aplicație) pornește pe lună, pe
   calculator pe săptămână; ultima vedere aleasă se ține minte.
   -------------------------------------------------------------------------- */

type InstallEvent = Event & { prompt: () => Promise<void> };

const VEDERI: Vedere[] = ["an", "luna", "saptamana", "zi", "program"];

function lunaPlus(first: string, n: number): string {
  const [y, m] = first.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 10);
}

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

export function AplicatieProgramator({
  initialMonth,
  initialWeek,
  me,
}: {
  initialMonth: Month;
  initialWeek: Week;
  me: Me;
}) {
  const [data, setData] = useState(initialMonth);
  const [weekInit, setWeekInit] = useState(initialWeek);
  const [vedere, setVedere] = useState<Vedere | null>(null);
  const [selected, setSelected] = useState(
    initialMonth.today.slice(0, 7) === initialMonth.month.slice(0, 7) ? initialMonth.today : initialMonth.month,
  );
  const [ascunse, setAscunse] = useState<Ascunse>({ rooms: [], people: [] });
  const [sertar, setSertar] = useState(false);
  const [foaie, setFoaie] = useState<string | null>(null);
  const [nou, setNou] = useState<Propunere | null>(null);
  const [edit, setEdit] = useState<Reservation | null>(null);
  const [cab, setCab] = useState<{ room: Room; date: string; from: number } | null>(null);
  const [cauta, setCauta] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const loadSeq = useRef(0);

  /* ---------------------------------------------------------- Încărcare */

  const load = useCallback(async (day: string, quiet = false) => {
    const mine = ++loadSeq.current;
    try {
      const m = await cere<Month>(`/api/programator/luna?zi=${day}`);
      if (mine !== loadSeq.current) return;
      setData(m);
      setError("");
    } catch (err) {
      if (mine === loadSeq.current && !quiet) setError(err instanceof Error ? err.message : "Nu am putut încărca luna.");
    }
  }, []);

  // luna încărcată urmează ziua aleasă
  useEffect(() => {
    if (selected.slice(0, 7) !== data.month.slice(0, 7)) load(selected);
  }, [selected, data.month, load]);

  const liber = !nou && !edit && !cab && vedere !== "saptamana";
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
    const saved = citeste<string>("prog-vedere", "");
    const aplicatie = window.matchMedia("(display-mode: standalone)").matches;
    setVedere(
      VEDERI.includes(saved as Vedere) ? (saved as Vedere) : aplicatie || window.innerWidth < 900 ? "luna" : "saptamana",
    );
    setAscunse(citeste<Ascunse>("prog-ascunse", { rooms: [], people: [] }));

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/api/programator/aplicatie/sw", { scope: "/" }).catch(() => {});
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

  async function alegeVedere(v: Vedere) {
    scrie("prog-vedere", v);
    if (v === "saptamana") {
      try {
        setWeekInit(await cere<Week>(`/api/programator/saptamana?start=${selected}`));
      } catch {
        /* rămâne săptămâna de dinainte */
      }
    }
    setVedere(v);
  }

  function alegeAscunse(a: Ascunse) {
    setAscunse(a);
    scrie("prog-ascunse", a);
  }

  const gata = useCallback(
    (msg?: string) => {
      setNou(null);
      setEdit(null);
      setCab(null);
      setNotice(msg ?? "");
      load(selected, true);
    },
    [load, selected],
  );

  /* ------------------------------------------------------------- Bara */

  const anCurent = data.today.slice(0, 4);
  const titlu =
    vedere === "an"
      ? selected.slice(0, 4)
      : vedere === "zi"
        ? phoneDate(selected)
        : vedere === "program"
          ? "Program"
          : `${LUNI_LUNGI[Number(data.month.slice(5, 7)) - 1]}${data.month.slice(0, 4) === anCurent ? "" : ` ${data.month.slice(0, 4)}`}`;

  function muta(dir: 1 | -1) {
    if (vedere === "an") {
      setSelected(`${Number(selected.slice(0, 4)) + dir}${selected.slice(4, 8)}01`);
    } else if (vedere === "zi") {
      setSelected(addDays(selected, dir));
    } else {
      const first = lunaPlus(`${selected.slice(0, 7)}-01`, dir);
      setSelected(first.slice(0, 7) === data.today.slice(0, 7) ? data.today : first);
    }
  }

  const rezultate = useMemo(() => {
    if (cauta === null || cauta.trim().length < 2) return [];
    const q = simplu(cauta.trim());
    const people = new Map(data.people.map((p) => [p.id, p.name]));
    const rooms = new Map(data.rooms.map((r) => [r.id, r.name]));
    return data.reservations.filter((r) =>
      simplu(`${people.get(r.personId) ?? ""} ${rooms.get(r.roomId) ?? ""} ${r.note ?? ""}`).includes(q),
    );
  }, [cauta, data]);

  if (vedere === null) return <div className="h-dvh bg-cream" />;

  const sertarEl = (
    <Sertar
      open={sertar}
      onClose={() => setSertar(false)}
      vedere={vedere}
      onVedere={alegeVedere}
      data={data}
      ascunse={ascunse}
      onAscunse={alegeAscunse}
      me={me}
      install={
        install
          ? () => {
              install.prompt().catch(() => {});
              setInstall(null);
            }
          : null
      }
    />
  );

  if (vedere === "saptamana") {
    return (
      <>
        <Grila key={weekInit.start} initial={weekInit} me={me} onMenu={() => setSertar(true)} />
        {sertarEl}
      </>
    );
  }

  const unealta = "flex h-12 w-12 items-center justify-center rounded-full text-ink transition-colors hover:bg-cream-deep";

  return (
    <div className="prog-telefon flex h-dvh flex-col bg-cream">
      <header className="flex shrink-0 items-center gap-1 px-2 pb-1 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4">
        {cauta === null ? (
          <>
            <button type="button" onClick={() => setSertar(true)} aria-label="Meniu" className={unealta}>
              <Menu className="h-7 w-7" />
            </button>
            <button
              type="button"
              onClick={() => vedere === "luna" && alegeVedere("an")}
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
            <button
              type="button"
              onClick={() => setSelected(data.today)}
              aria-label="Azi"
              title="Azi"
              className={unealta}
            >
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
              placeholder="Caută un nume, un cabinet, o notă"
              className="h-12 min-w-0 flex-1 rounded-full bg-cream-warm px-5 font-sans text-[1.1rem] text-ink placeholder:text-ink-muted focus:outline-none focus:ring-4 focus:ring-periwinkle/20"
            />
            <button type="button" onClick={() => setCauta(null)} aria-label="Închide căutarea" className={unealta}>
              <X className="h-6 w-6" />
            </button>
          </>
        )}
      </header>

      {error && (
        <p role="alert" className="mx-3 mb-2 rounded-[1rem] bg-clay-pale px-4 py-2.5 font-sans text-[0.95rem] text-clay">
          {error}
        </p>
      )}

      {cauta !== null ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-10">
          <p className="px-1 py-2 font-sans text-[0.9rem] text-ink-muted">
            {cauta.trim().length < 2 ? "Scrie cel puțin două litere." : `${rezultate.length} rezultate în ${titlu}`}
          </p>
          <div className="space-y-2">
            {rezultate.map((r) => {
              const p = data.people.find((x) => x.id === r.personId);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setSelected(r.date);
                    setEdit(r);
                  }}
                  className="flex w-full items-center gap-3 rounded-[1rem] bg-cream-warm px-4 py-3 text-left font-sans hover:bg-cream-deep"
                >
                  <span className="w-[5.5rem] shrink-0 text-[0.95rem] text-ink-soft">{phoneDate(r.date)}</span>
                  <span className="min-w-0 flex-1 truncate text-[1.05rem] text-ink">
                    <b>{p?.name}</b> · {data.rooms.find((x) => x.id === r.roomId)?.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : vedere === "luna" ? (
        <VedereLuna
          data={data}
          selected={selected}
          ascunse={ascunse}
          onSelect={setSelected}
          onOpen={setFoaie}
          onSwipe={muta}
        />
      ) : vedere === "an" ? (
        <VedereAn
          year={Number(selected.slice(0, 4))}
          today={data.today}
          onMonth={(first) => {
            setSelected(first.slice(0, 7) === data.today.slice(0, 7) ? data.today : first);
            alegeVedere("luna");
          }}
          onSwipe={muta}
        />
      ) : vedere === "zi" ? (
        <VedereZi
          data={data}
          date={selected}
          ascunse={ascunse}
          onEdit={setEdit}
          onNew={(room, start) => setNou({ date: selected, start, end: start + 60, roomId: room.id })}
          onOwner={(room, from) => setCab({ room, date: selected, from })}
          onSwipe={muta}
        />
      ) : (
        <VedereProgram
          data={data}
          from={selected}
          ascunse={ascunse}
          onEdit={setEdit}
          onNext={() => muta(1)}
        />
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

      {sertarEl}

      {foaie && (
        <FoaieZi
          data={data}
          date={foaie}
          ascunse={ascunse}
          onClose={() => setFoaie(null)}
          onEdit={(r) => {
            setFoaie(null);
            setEdit(r);
          }}
          onAdd={() => {
            setFoaie(null);
            setNou({ date: foaie });
          }}
          onDay={() => {
            setFoaie(null);
            setSelected(foaie);
            alegeVedere("zi");
          }}
        />
      )}

      {nou && (
        <FormularNou
          data={data}
          me={me}
          propunere={nou}
          onClose={() => setNou(null)}
          onDone={(msg, date) => {
            setSelected(date);
            gata(msg);
          }}
        />
      )}

      {edit && (
        <DialogRezervare
          draft={{ mode: "edit", res: edit }}
          week={caSaptamana(data, edit.date)}
          me={me}
          onClose={() => setEdit(null)}
          onDone={gata}
        />
      )}

      {cab && (
        <DialogCabinet
          room={cab.room}
          date={cab.date}
          from={cab.from}
          week={caSaptamana(data, cab.date)}
          me={me}
          onClose={() => setCab(null)}
          onDone={gata}
        />
      )}
    </div>
  );
}
