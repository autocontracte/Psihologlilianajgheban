"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Accent = "periwinkle" | "sage" | "cream" | "clay";

const borderColor: Record<Accent, string> = {
  periwinkle: "border-periwinkle/25",
  sage: "border-sage/30",
  cream: "border-cream/25",
  clay: "border-clay/30",
};

/**
 * Chenar decorativ care se leagănă încet în spatele conținutului.
 * Același efect ca în hero, refolosibil oriunde.
 *
 * Se pune în jurul conținutului:
 *   <OrbitFrame><div>…</div></OrbitFrame>
 */
export function OrbitFrame({
  children,
  className = "",
  frameClassName = "",
  inset = "-1.25rem",
  radius = "3.5rem",
  accent = "periwinkle",
  duration = 18,
  tilt = 4,
  reverse = false,
  double = false,
}: {
  children: ReactNode;
  className?: string;
  frameClassName?: string;
  /** Cât de departe stă chenarul de conținut. */
  inset?: string;
  radius?: string;
  accent?: Accent;
  /** Durata unui ciclu complet, în secunde. Mai mare = mai lent. */
  duration?: number;
  /** Amplitudinea rotației, în grade. */
  tilt?: number;
  reverse?: boolean;
  /** Adaugă un al doilea chenar, care se mișcă în sens opus. */
  double?: boolean;
}) {
  const reduce = useReducedMotion();
  const sway = reverse ? [0, -tilt, 0] : [0, tilt, 0];

  return (
    <div className={`relative ${className}`}>
      <motion.div
        aria-hidden
        animate={reduce ? {} : { rotate: sway }}
        transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
        style={{ inset, borderRadius: radius }}
        className={`pointer-events-none absolute border ${borderColor[accent]} ${frameClassName}`}
      />

      {double && (
        <motion.div
          aria-hidden
          animate={reduce ? {} : { rotate: reverse ? [0, tilt, 0] : [0, -tilt, 0] }}
          transition={{
            duration: duration * 1.35,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8,
          }}
          style={{
            inset: `calc(${inset} - 0.75rem)`,
            borderRadius: `calc(${radius} + 0.75rem)`,
          }}
          className={`pointer-events-none absolute border ${borderColor[accent]} opacity-50`}
        />
      )}

      <div className="relative">{children}</div>
    </div>
  );
}

/**
 * Cerc decorativ care se rotește continuu. Bun ca accent în fundalul
 * secțiunilor, în locul petelor difuze.
 */
export function OrbitRing({
  className = "",
  size = "22rem",
  accent = "periwinkle",
  duration = 40,
  reverse = false,
  dashed = false,
}: {
  className?: string;
  size?: string;
  accent?: Accent;
  duration?: number;
  reverse?: boolean;
  dashed?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      aria-hidden
      animate={reduce ? {} : { rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
      style={{ width: size, height: size }}
      className={[
        "pointer-events-none absolute rounded-full border",
        dashed ? "border-dashed" : "",
        borderColor[accent],
        className,
      ].join(" ")}
    />
  );
}
