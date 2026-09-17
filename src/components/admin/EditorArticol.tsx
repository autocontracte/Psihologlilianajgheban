"use client";

import { useEffect, useRef, useState } from "react";

/* ----------------------------------------------------------------------------
   Editor vizual simplu, în stilul „mini WordPress".

   Scrii direct și vezi cum arată. Butoanele aplică formatări obișnuite
   (îngroșat, titluri, liste, citat, link, imagine). Sub capotă folosim
   `document.execCommand` — vechi, dar merge în toate browserele și nu cere
   nicio bibliotecă grea. HTML-ul rezultat e curățat pe server la salvare.
   -------------------------------------------------------------------------- */

type Props = {
  valoareInitiala: string;
  onChange: (html: string) => void;
};

export function EditorArticol({ valoareInitiala, onChange }: Props) {
  const zona = useRef<HTMLDivElement>(null);
  const [incarc, setIncarc] = useState(false);

  // Punem conținutul inițial o singură dată, ca să nu sară cursorul.
  useEffect(() => {
    if (zona.current && valoareInitiala && !zona.current.innerHTML) {
      zona.current.innerHTML = valoareInitiala;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function raporteaza() {
    if (zona.current) onChange(zona.current.innerHTML);
  }

  function cmd(comanda: string, valoare?: string) {
    zona.current?.focus();
    document.execCommand(comanda, false, valoare);
    raporteaza();
  }

  function titlu(tag: "H2" | "H3" | "P" | "BLOCKQUOTE") {
    cmd("formatBlock", tag);
  }

  function link() {
    const url = window.prompt("Adresa linkului (https://…):", "https://");
    if (url) cmd("createLink", url);
  }

  async function inserimagine(file: File) {
    setIncarc(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/blog/imagine", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Încărcarea a eșuat.");
      zona.current?.focus();
      document.execCommand(
        "insertHTML",
        false,
        `<img src="${json.url}" alt="" /><p><br/></p>`,
      );
      raporteaza();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Eroare la încărcarea imaginii.");
    } finally {
      setIncarc(false);
    }
  }

  const buton =
    "flex h-9 min-w-9 items-center justify-center px-2.5 font-sans text-[0.82rem] text-ink transition-colors hover:bg-periwinkle-pale";

  return (
    <div className="rounded-none border border-ink/15 bg-cream-warm">
      {/* Bara de instrumente */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-ink/10 bg-cream px-2 py-1.5">
        <button type="button" title="Îngroșat" onClick={() => cmd("bold")} className={`${buton} font-bold`}>B</button>
        <button type="button" title="Cursiv" onClick={() => cmd("italic")} className={`${buton} italic`}>I</button>
        <span className="mx-1 h-5 w-px bg-ink/10" />
        <button type="button" title="Titlu mare" onClick={() => titlu("H2")} className={buton}>T1</button>
        <button type="button" title="Subtitlu" onClick={() => titlu("H3")} className={buton}>T2</button>
        <button type="button" title="Paragraf normal" onClick={() => titlu("P")} className={buton}>¶</button>
        <button type="button" title="Citat" onClick={() => titlu("BLOCKQUOTE")} className={buton}>❝</button>
        <span className="mx-1 h-5 w-px bg-ink/10" />
        <button type="button" title="Listă cu puncte" onClick={() => cmd("insertUnorderedList")} className={buton}>• Listă</button>
        <button type="button" title="Listă numerotată" onClick={() => cmd("insertOrderedList")} className={buton}>1. Listă</button>
        <span className="mx-1 h-5 w-px bg-ink/10" />
        <button type="button" title="Link" onClick={link} className={buton}>🔗</button>
        <label title="Imagine" className={`${buton} cursor-pointer`}>
          {incarc ? "…" : "🖼"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) inserimagine(f);
              e.target.value = "";
            }}
          />
        </label>
        <span className="mx-1 h-5 w-px bg-ink/10" />
        <button type="button" title="Înapoi" onClick={() => cmd("undo")} className={buton}>↶</button>
        <button type="button" title="Refă" onClick={() => cmd("redo")} className={buton}>↷</button>
      </div>

      {/* Zona de scris */}
      <div
        ref={zona}
        contentEditable
        suppressContentEditableWarning
        onInput={raporteaza}
        onBlur={raporteaza}
        data-placeholder="Scrie articolul aici…"
        className="prose-editor min-h-[24rem] px-6 py-5 font-sans text-[0.98rem] leading-[1.75] text-ink focus:outline-none"
      />
    </div>
  );
}
