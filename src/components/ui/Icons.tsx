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

export const IconAdults = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="7.5" r="3.4" />
    <path d="M5.5 20.5a6.5 6.5 0 0 1 13 0" />
  </svg>
);

export const IconTeens = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="7" r="2.8" />
    <circle cx="16.5" cy="9" r="2.2" />
    <path d="M3.5 20.5a5.5 5.5 0 0 1 11 0" />
    <path d="M15 20.5a4.3 4.3 0 0 1 5.5-3.9" />
  </svg>
);

export const IconChildren = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="3" />
    <path d="M7 20.5c0-2.8 2.2-5 5-5s5 2.2 5 5" />
    <path d="M9.5 7.2c.6.5 1.5.8 2.5.8s1.9-.3 2.5-.8" />
  </svg>
);

export const IconParents = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="7.5" cy="7" r="2.8" />
    <circle cx="16.5" cy="8.5" r="2.2" />
    <path d="M3 20.5a4.5 4.5 0 0 1 9 0" />
    <path d="M13 20.5a3.5 3.5 0 0 1 7 0" />
    <path d="M11 12.5c.8-.6 1.7-.9 2.6-.9" />
  </svg>
);

export const IconGroup = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="6" r="2.2" />
    <circle cx="5.5" cy="12.5" r="2.2" />
    <circle cx="18.5" cy="12.5" r="2.2" />
    <circle cx="12" cy="19" r="2.2" />
    <path d="M10.4 7.6 7 10.9M13.6 7.6l3.4 3.3M7 14.2l3.4 3.3M17 14.2l-3.4 3.3" />
  </svg>
);

export const IconSandtray = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="9" width="18" height="10.5" rx="2.5" />
    <path d="M3.5 14.5c2-1.6 3.6-1.6 5.5 0s3.5 1.6 5.5 0 3.6-1.6 5.5 0" />
    <path d="M8 6.5V4.5M12 6.5V3.5M16 6.5V5" />
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
