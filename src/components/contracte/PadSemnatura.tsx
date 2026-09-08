"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ----------------------------------------------------------------------------
   Semnătura desenată cu degetul sau cu mouse-ul.

   Câteva lucruri contează aici mai mult decât par:

   • `touch-action: none` — fără el, pe telefon degetul derulează pagina în loc
     să deseneze.
   • Pointer Events, nu mouse + touch separat: același cod merge și cu degetul,
     și cu mouse-ul, și cu creionul de tabletă.
   • Pânza se desenează la rezoluția ecranului (devicePixelRatio), altfel
     semnătura iese pixelată pe telefoanele moderne.
   • La export tăiem marginile goale. Dacă cineva semnează mic într-un colț,
     fără tăiere semnătura ar apărea minusculă în contract.
   -------------------------------------------------------------------------- */

type Props = {
  eticheta: string;
  valoare: string | null;
  onChange: (png: string | null) => void;
  problema?: string;
};

export function PadSemnatura({ eticheta, valoare, onChange, problema }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const deseneaza = useRef(false);
  const ultimul = useRef<{ x: number; y: number } | null>(null);
  const [areUrma, setAreUrma] = useState(Boolean(valoare));

  /* Pânza se redimensionează după container, la rezoluția ecranului. */
  const pregateste = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1b2a44";
  }, []);

  useEffect(() => {
    pregateste();
    window.addEventListener("resize", pregateste);
    return () => window.removeEventListener("resize", pregateste);
  }, [pregateste]);

  function pozitia(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    deseneaza.current = true;
    ultimul.current = pozitia(e);

    // Un punct singur trebuie să lase urmă, nu doar liniile.
    const ctx = canvasRef.current?.getContext("2d");
    const p = ultimul.current;
    if (ctx && p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.1, 0, Math.PI * 2);
      ctx.fillStyle = "#1b2a44";
      ctx.fill();
    }
    setAreUrma(true);
  }

  function misca(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!deseneaza.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    const p = pozitia(e);
    const dinainte = ultimul.current;
    if (!ctx || !dinainte) return;

    ctx.beginPath();
    ctx.moveTo(dinainte.x, dinainte.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ultimul.current = p;
  }

  function opreste() {
    if (!deseneaza.current) return;
    deseneaza.current = false;
    ultimul.current = null;
    onChange(exporta());
  }

  /** Decupează marginile goale și întoarce un PNG. */
  function exporta(): string | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const { width: w, height: h } = canvas;
    const pixeli = ctx.getImageData(0, 0, w, h).data;

    let sus = h, jos = -1, stanga = w, dreapta = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (pixeli[(y * w + x) * 4 + 3] > 8) {
          if (y < sus) sus = y;
          if (y > jos) jos = y;
          if (x < stanga) stanga = x;
          if (x > dreapta) dreapta = x;
        }
      }
    }

    if (jos < 0) return null; // pânză goală

    const margine = 6;
    stanga = Math.max(0, stanga - margine);
    sus = Math.max(0, sus - margine);
    dreapta = Math.min(w - 1, dreapta + margine);
    jos = Math.min(h - 1, jos + margine);

    const taiat = document.createElement("canvas");
    taiat.width = dreapta - stanga + 1;
    taiat.height = jos - sus + 1;
    taiat
      .getContext("2d")
      ?.drawImage(canvas, stanga, sus, taiat.width, taiat.height, 0, 0, taiat.width, taiat.height);

    return taiat.toDataURL("image/png");
  }

  function sterge() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setAreUrma(false);
    onChange(null);
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label className="font-sans text-[0.87rem] text-ink">{eticheta}</label>
        {areUrma && (
          <button
            type="button"
            onClick={sterge}
            className="font-sans text-[0.8rem] text-ink-muted underline underline-offset-4 transition-colors hover:text-clay"
          >
            Șterge și semnează din nou
          </button>
        )}
      </div>

      <div
        className={`relative mt-3 border bg-cream-warm ${
          problema ? "border-clay" : "border-ink/15"
        }`}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={misca}
          onPointerUp={opreste}
          onPointerLeave={opreste}
          onPointerCancel={opreste}
          className="block h-40 w-full cursor-crosshair touch-none"
        />

        {/* Linia pe care se semnează, ca pe hârtie. */}
        <div className="pointer-events-none absolute inset-x-8 bottom-9 border-b border-ink/20" />

        {!areUrma && (
          <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center font-sans text-[0.78rem] text-ink-muted">
            Semnează cu degetul sau cu mouse-ul
          </p>
        )}
      </div>

      {problema && (
        <p className="mt-2 font-sans text-[0.8rem] text-clay">{problema}</p>
      )}
    </div>
  );
}
