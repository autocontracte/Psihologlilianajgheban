"use client";

import { useEffect, useRef, useState } from "react";
import { IconSend } from "../ui/Icons";
import { AnaFace } from "./AnaFace";
import { AnaMesaje } from "./AnaMesaje";
import { NotaAna, useAnaMood } from "./Ana";
import { useAna } from "./useAna";
import { useNavigheaza } from "./useNavigheaza";

/**
 * Ana, așezată direct în pagină (lângă întrebările frecvente): „sau, mai ușor,
 * întreabă-mă pe mine". Conversația e aceeași cu cea din hero și din butonul
 * plutitor. `data-ana-inline` îi spune butonului plutitor să stea ascuns cât
 * timp panoul e pe ecran, ca Ana să nu apară de două ori.
 */
export function AnaPanou({
  className = "",
  intro,
  sugestii,
}: {
  className?: string;
  /** Textul de deasupra conversației, până la prima întrebare. */
  intro?: string;
  sugestii?: readonly string[];
}) {
  const { busy, gata, intrebari, ramase, trimite, turns } = useAna();
  const [draft, setDraft] = useState("");
  const mood = useAnaMood(draft);
  const navigheaza = useNavigheaza();
  const listaRef = useRef<HTMLDivElement>(null);
  const aInceput = intrebari > 0;

  useEffect(() => {
    listaRef.current?.scrollTo({ top: listaRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy]);

  async function trimiteDraft() {
    const q = draft;
    if (!q.trim()) return;
    setDraft("");
    const ok = await trimite(q);
    if (!ok) setDraft(q);
  }

  return (
    <aside data-ana-inline className={`glass-strong flex h-[36rem] flex-col ${className}`} aria-label="Întreab-o pe Ana">
      {/* Antet: fața Anei și invitația */}
      <div className="flex items-center gap-4 border-b border-ink/8 px-6 py-5">
        <AnaFace size={64} mood={mood} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-[1.35rem] leading-tight text-ink">
            Sau, mai ușor, <em className="text-periwinkle">întreabă-mă pe mine</em>
          </p>
          <p className="mt-1 font-sans text-[0.8rem] text-ink-muted">
            Ana, asistenta virtuală a cabinetului
          </p>
        </div>
      </div>

      <div ref={listaRef} className="min-h-0 flex-1 overflow-y-auto px-6 py-5" aria-live="polite">
        {!aInceput && (
          <p className="mb-4 font-sans text-[0.92rem] leading-relaxed text-ink-soft">
            {intro ??
              "Nu ai găsit răspunsul în listă? Scrie-mi cu cuvintele tale și îți răspund pe loc despre ședințe, prețuri, varianta online sau despre cum decurge prima întâlnire."}
          </p>
        )}
        <AnaMesaje onGo={navigheaza} faraSalut sugestii={sugestii} />
      </div>

      {!gata && (
        <div className="border-t border-ink/8 px-6 pb-4 pt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              trimiteDraft();
            }}
            className="glass-btn flex items-center gap-2 p-1.5 pl-3 transition-shadow focus-within:shadow-[0_0_0_3px_rgba(110,133,103,0.25)]"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Scrie întrebarea ta…"
              aria-label="Întrebarea ta pentru Ana"
              maxLength={500}
              className="min-w-0 flex-1 bg-transparent py-2 font-sans text-[0.93rem] text-ink placeholder:text-ink-muted focus:outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim() || busy}
              aria-label="Trimite"
              className="flex h-10 w-10 shrink-0 items-center justify-center bg-periwinkle text-cream transition-colors hover:bg-ink disabled:opacity-40"
            >
              <IconSend className="h-4.5 w-4.5" />
            </button>
          </form>
          <NotaAna ramase={ramase} />
        </div>
      )}
    </aside>
  );
}
