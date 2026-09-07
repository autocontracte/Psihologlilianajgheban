/* ============================================================================
   Iconițe Google — Material Symbols Outlined, auto-găzduite ca font.

   Fontul e subsetat la cele 29 de simboluri folosite (5 KB) și declarat în
   globals.css. Iconița se randează prin ligatură: textul „person" devine
   simbolul. De aceea numele simbolului e conținutul elementului.

   Numele exportate sunt cele folosite deja în componente, așa că schimbarea
   setului nu a cerut modificări în restul aplicației.
   ========================================================================== */

type IconProps = {
  className?: string;
  /** Grosimea conturului nu se aplică — păstrat pentru compatibilitate. */
  strokeWidth?: number;
  style?: React.CSSProperties;
  "aria-hidden"?: boolean;
};

/* Iconițele sunt acum text, nu SVG, deci clasele de tip `h-4 w-4` le dau
   cutia, nu și mărimea semnului. Ca să nu fie nevoie să atingem fiecare loc
   din aplicație, deducem mărimea literei din clasa de înălțime primită. */
const SIZES: Record<string, string> = {
  "h-3": "0.75rem",
  "h-3.5": "0.875rem",
  "h-4": "1rem",
  "h-4.5": "1.125rem",
  "h-5": "1.25rem",
  "h-6": "1.5rem",
  "h-7": "1.75rem",
  "h-8": "2rem",
};

function fontSizeFrom(className: string): string {
  const arbitrar = className.match(/h-\[([^\]]+)\]/);
  if (arbitrar) return arbitrar[1];

  for (const token of className.split(/\s+/)) {
    if (SIZES[token]) return SIZES[token];
  }
  return "1.5rem";
}

/** Construiește o iconiță pornind de la numele simbolului Google. */
function symbol(name: string, displayName: string) {
  const Icon = ({ className = "", style }: IconProps) => (
    <span
      className={`mi ${className}`}
      style={{ fontSize: fontSizeFrom(className), ...style }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
  Icon.displayName = displayName;
  return Icon;
}

/* ---------------------------------------------------- Publicuri / servicii */

export const IconAdults = symbol("person", "IconAdults");
export const IconTeens = symbol("diversity_3", "IconTeens");
export const IconChildren = symbol("child_care", "IconChildren");
export const IconParents = symbol("family_restroom", "IconParents");
export const IconGroup = symbol("groups", "IconGroup");
export const IconSandtray = symbol("toys", "IconSandtray");

/* ------------------------------------------------------------------ Format */

export const IconOffice = symbol("chair", "IconOffice");
export const IconOnline = symbol("videocam", "IconOnline");

/* ----------------------------------------------------------------- Contact */

export const IconPhone = symbol("call", "IconPhone");
export const IconMail = symbol("mail", "IconMail");
export const IconLocation = symbol("location_on", "IconLocation");
export const IconClock = symbol("schedule", "IconClock");

/* ------------------------------------------------------------------ Diverse */

export const IconArrow = symbol("arrow_forward", "IconArrow");
export const IconPlus = symbol("add", "IconPlus");
export const IconCheck = symbol("check", "IconCheck");
export const IconCompass = symbol("explore", "IconCompass");
export const IconCalendar = symbol("calendar_month", "IconCalendar");
export const IconUser = symbol("account_circle", "IconUser");
export const IconQuote = symbol("format_quote", "IconQuote");
export const IconStar = symbol("star", "IconStar");
export const IconPrice = symbol("payments", "IconPrice");
export const IconContract = symbol("description", "IconContract");
export const IconSign = symbol("draw", "IconSign");
export const IconDownload = symbol("download", "IconDownload");
export const IconSend = symbol("send", "IconSend");
export const IconExternal = symbol("north_east", "IconExternal");

/* -------------------------------------------------------------------- Social

   Material Symbols nu conține marcaje de brand — pentru acestea se folosesc
   formele oficiale ale platformelor.                                        */

type BrandProps = React.SVGProps<SVGSVGElement>;

export const IconFacebook = (p: BrandProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M14 9V7.2c0-.8.2-1.2 1.4-1.2H17V3.1A19 19 0 0 0 14.7 3c-2.4 0-4 1.5-4 4.2V9H8.2v3h2.5v9H14v-9h2.5l.4-3H14Z" />
  </svg>
);

export const IconInstagram = (p: BrandProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...p}
  >
    <rect x="3" y="3" width="18" height="18" rx="5.2" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const IconLinkedIn = (p: BrandProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
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
