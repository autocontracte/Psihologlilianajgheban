import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

/* ---------------------------------------------------- Publicuri / servicii */

/* Siluetele sunt gândite să se deosebească între ele dintr-o privire, la
   dimensiune mică: numărul de persoane și raportul cap/corp fac diferența.
   Copilul are capul mai mare față de corp, ca în proporțiile reale. */

export const IconAdults = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="7.2" r="3.6" />
    <path d="M4.6 20.5a7.4 7.4 0 0 1 14.8 0" />
  </svg>
);

/** Doi tineri de vârste apropiate, unul puțin mai mic. */
export const IconTeens = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="8.4" cy="6.9" r="3" />
    <path d="M3.2 20.5a5.2 5.2 0 0 1 10.4 0" />
    <circle cx="16.8" cy="9.6" r="2.4" />
    <path d="M12.6 20.5a4.2 4.2 0 0 1 8.4 0" />
  </svg>
);

/** Un copil și o minge — proporția cap/corp plus trimiterea la joc. */
export const IconChildren = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="9.6" cy="7.4" r="3.8" />
    <path d="M4.4 20.5a5.2 5.2 0 0 1 10.4 0" />
    <circle cx="18.8" cy="17.4" r="2.6" />
  </svg>
);

/** Un adult și un copil, alături — diferența de mărime spune totul. */
export const IconParents = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="8.2" cy="6.4" r="3.2" />
    <path d="M2.8 20.5a5.4 5.4 0 0 1 10.8 0" />
    <circle cx="17.4" cy="12.4" r="2.2" />
    <path d="M13.8 20.5a3.6 3.6 0 0 1 7.2 0" />
  </svg>
);

/** Trei persoane, cea din mijloc în față — un grup, nu o schemă. */
export const IconGroup = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8.4" r="2.9" />
    <path d="M7.4 20.5a4.6 4.6 0 0 1 9.2 0" />
    <circle cx="4.6" cy="9.6" r="2.2" />
    <path d="M1.6 17.4a3.4 3.4 0 0 1 3.3-3.4" />
    <circle cx="19.4" cy="9.6" r="2.2" />
    <path d="M22.4 17.4a3.4 3.4 0 0 0-3.3-3.4" />
  </svg>
);

/** Tava cu nisip și două miniaturi așezate în ea. */
export const IconSandtray = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="2.6" y="11" width="18.8" height="8.6" rx="2.4" />
    <path d="M3.4 15.6c1.9-1.5 3.4-1.5 5.2 0s3.3 1.5 5.2 0 3.4-1.5 5.2 0" />
    <circle cx="8.6" cy="5.6" r="1.7" />
    <path d="M8.6 7.6v3.2" />
    <path d="M15.4 4.8 17 11" />
  </svg>
);

/* ------------------------------------------------------------------ Format */

export const IconOffice = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3.5 10.5 12 4l8.5 6.5" />
    <path d="M5.5 12v8h13v-8" />
    <path d="M10 20v-4.5h4V20" />
  </svg>
);

export const IconOnline = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="2.5" y="5" width="19" height="12.5" rx="2.5" />
    <path d="M8.5 21h7M12 17.5V21" />
    <path d="m10 9.5 4 2.2-4 2.3z" />
  </svg>
);

/* ----------------------------------------------------------------- Contact */

export const IconPhone = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6.2 3.5h3l1.5 4-2 1.4a12 12 0 0 0 5.4 5.4l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.2 5.7a2 2 0 0 1 2-2.2Z" />
  </svg>
);

export const IconMail = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    <path d="m3.5 7.5 7.3 5.2a2 2 0 0 0 2.4 0l7.3-5.2" />
  </svg>
);

export const IconLocation = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

export const IconClock = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

/* ------------------------------------------------------------------ Diverse */

export const IconArrow = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </svg>
);

export const IconPlus = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 5.5v13M5.5 12h13" />
  </svg>
);

export const IconCheck = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const IconCompass = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m15 9-1.8 4.2L9 15l1.8-4.2z" />
  </svg>
);

export const IconUser = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8.5" r="3.6" />
    <path d="M5 20.5a7 7 0 0 1 14 0" />
  </svg>
);

export const IconCalendar = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 9.5h17M8.5 3.5V6M15.5 3.5V6" />
  </svg>
);

/* -------------------------------------------------------------------- Social */

export const IconFacebook = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M14 9V7.2c0-.8.2-1.2 1.4-1.2H17V3.1A19 19 0 0 0 14.7 3c-2.4 0-4 1.5-4 4.2V9H8.2v3h2.5v9H14v-9h2.5l.4-3H14Z" />
  </svg>
);

export const IconInstagram = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5.2" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const IconLinkedIn = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M6.9 21H3.4V9.2h3.5V21ZM5.1 7.6a2 2 0 1 1 0-4.1 2 2 0 0 1 0 4.1ZM21 21h-3.5v-5.7c0-1.4 0-3.2-2-3.2s-2.2 1.5-2.2 3.1V21H9.8V9.2h3.3v1.6h.1a3.7 3.7 0 0 1 3.3-1.8c3.5 0 4.2 2.3 4.2 5.3V21Z" />
  </svg>
);

/* -------------------------------------------------------------------------- */

export const ICONS = {
  adults: IconAdults,
  teens: IconTeens,
  children: IconChildren,
  parents: IconParents,
  group: IconGroup,
  sandtray: IconSandtray,
  office: IconOffice,
  online: IconOnline,
} as const;

export type IconName = keyof typeof ICONS;
