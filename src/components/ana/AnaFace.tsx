"use client";

import { useEffect, useId, useRef, useState } from "react";

/* ----------------------------------------------------------------------------
   Fața Anei.

   O piatră de râu — rotunjită, ușor asimetrică, în verdele-salvie al site-ului.
   Piatra netedă e un simbol vechi al echilibrului: ceva stabil, care nu se
   grăbește. Ochii clipesc rar și se uită discret spre cursor, ca semn că Ana
   e atentă; zâmbetul e mic și cald, nu exuberant.

   Expresii:
     idle      — liniștită, clipește din când în când
     listening — omul scrie: ochii puțin mai mari, privirea în jos, spre text
     thinking  — așteaptă răspunsul: privirea în sus, gura strânsă
     talking   — răspunsul curge: gura se mișcă ușor
   -------------------------------------------------------------------------- */

export type AnaMood = "idle" | "listening" | "thinking" | "talking";

export function AnaFace({
  size = 48,
  mood = "idle",
  className = "",
}: {
  size?: number;
  mood?: AnaMood;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const [privire, setPrivire] = useState({ x: 0, y: 0 });
  const [clipeste, setClipeste] = useState(false);

  // Clipește la 3–6 secunde, niciodată la intervale fixe (ar părea mecanic)
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const urmator = () => {
      t = setTimeout(() => {
        setClipeste(true);
        setTimeout(() => setClipeste(false), 140);
        urmator();
      }, 3000 + Math.random() * 3000);
    };
    urmator();
    return () => clearTimeout(t);
  }, []);

  // Ochii urmăresc discret cursorul
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cadru = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(cadru);
      cadru = requestAnimationFrame(() => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const d = Math.max(1, Math.hypot(dx, dy));
        const k = Math.min(1, d / 400);
        setPrivire({ x: (dx / d) * 2.6 * k, y: (dy / d) * 2.2 * k });
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(cadru);
    };
  }, []);

  const ochi =
    mood === "thinking"
      ? { x: 1.8, y: -2.6 }
      : mood === "listening"
        ? { x: privire.x * 0.4, y: 2 }
        : privire;
  const ochiRy = clipeste ? 0.8 : mood === "listening" ? 7.4 : 6.6;

  return (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`ana-fata overflow-visible ${className}`}
      data-mood={mood}
      aria-hidden
    >
      <defs>
        <linearGradient id={`p${id}`} x1="0.15" y1="0.05" x2="0.85" y2="1">
          <stop offset="0" stopColor="#9db394" />
          <stop offset="0.55" stopColor="#7a9172" />
          <stop offset="1" stopColor="#5f7559" />
        </linearGradient>
        <radialGradient id={`l${id}`} cx="0.32" cy="0.22" r="0.55">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Umbra moale de sub piatră */}
      <ellipse cx="50" cy="94" rx="30" ry="4.5" fill="#363c45" opacity="0.14" />

      {/* Piatra — respiră încet */}
      <g className="ana-respiratie">
        <path
          d="M50 7C73 7 91 22 92 46c1 25-16 42-42 43C24 90 8 75 8 50 8 25 27 7 50 7Z"
          fill={`url(#p${id})`}
        />
        <path
          d="M50 7C73 7 91 22 92 46c1 25-16 42-42 43C24 90 8 75 8 50 8 25 27 7 50 7Z"
          fill={`url(#l${id})`}
        />
        <path
          d="M50 7C73 7 91 22 92 46c1 25-16 42-42 43C24 90 8 75 8 50 8 25 27 7 50 7Z"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.35"
          strokeWidth="1.2"
        />

        {/* Obrajii */}
        <ellipse cx="27" cy="60" rx="7.5" ry="4.5" fill="#f0a896" opacity="0.42" />
        <ellipse cx="73" cy="60" rx="7.5" ry="4.5" fill="#f0a896" opacity="0.42" />

        {/* Ochii */}
        <g
          style={{
            transform: `translate(${ochi.x}px, ${ochi.y}px)`,
            transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <ellipse
            cx="37"
            cy="47"
            rx="5.4"
            ry={ochiRy}
            fill="#2c332d"
            style={{ transition: "ry 0.09s ease" }}
          />
          <ellipse
            cx="63"
            cy="47"
            rx="5.4"
            ry={ochiRy}
            fill="#2c332d"
            style={{ transition: "ry 0.09s ease" }}
          />
          {!clipeste && (
            <>
              <circle cx="39" cy="44" r="1.9" fill="#ffffff" />
              <circle cx="65" cy="44" r="1.9" fill="#ffffff" />
            </>
          )}
        </g>

        {/* Gura */}
        {mood === "talking" ? (
          <ellipse className="ana-gura" cx="50" cy="66" rx="5" ry="3.2" fill="#2c332d" />
        ) : mood === "thinking" ? (
          <path d="M45 66.5h10" stroke="#2c332d" strokeWidth="3" strokeLinecap="round" />
        ) : (
          <path
            d="M41.5 63.5Q50 71.5 58.5 63.5"
            fill="none"
            stroke="#2c332d"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}
      </g>
    </svg>
  );
}
