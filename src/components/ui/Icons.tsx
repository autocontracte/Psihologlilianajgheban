/* ============================================================================
   Iconițele vin din Lucide (https://lucide.dev) — set open-source, licență ISC,
   folosit pe scară largă. Aici doar le dăm nume potrivite contextului și un
   contur puțin mai subțire decât implicit, ca să se așeze lângă serife.

   Numele exportate sunt cele folosite deja în componente, așa că înlocuirea
   setului nu cere modificări în restul aplicației.
   ========================================================================== */

import type { ComponentType, SVGProps } from "react";
import {
  Armchair,
  ArrowRight,
  Baby,
  CalendarDays,
  Check,
  Clock,
  Compass,
  HeartHandshake,
  Mail,
  MapPin,
  PersonStanding,
  Phone,
  Plus,
  Shapes,
  UserRound,
  UsersRound,
  Video,
  type LucideProps,
} from "lucide-react";

/** Conturul implicit din Lucide (2) e prea greu lângă titlurile cu serife. */
function tune(Icon: ComponentType<LucideProps>, displayName: string) {
  const Wrapped = (props: LucideProps) => (
    <Icon strokeWidth={1.6} {...props} />
  );
  Wrapped.displayName = displayName;
  return Wrapped;
}

/* ---------------------------------------------------- Publicuri / servicii */

export const IconAdults = tune(UserRound, "IconAdults");
export const IconTeens = tune(PersonStanding, "IconTeens");
export const IconChildren = tune(Baby, "IconChildren");
export const IconParents = tune(HeartHandshake, "IconParents");
export const IconGroup = tune(UsersRound, "IconGroup");
export const IconSandtray = tune(Shapes, "IconSandtray");

/* ------------------------------------------------------------------ Format */

export const IconOffice = tune(Armchair, "IconOffice");
export const IconOnline = tune(Video, "IconOnline");

/* ----------------------------------------------------------------- Contact */

export const IconPhone = tune(Phone, "IconPhone");
export const IconMail = tune(Mail, "IconMail");
export const IconLocation = tune(MapPin, "IconLocation");
export const IconClock = tune(Clock, "IconClock");

/* ------------------------------------------------------------------ Diverse */

export const IconArrow = tune(ArrowRight, "IconArrow");
export const IconPlus = tune(Plus, "IconPlus");
export const IconCheck = tune(Check, "IconCheck");
export const IconCompass = tune(Compass, "IconCompass");
export const IconCalendar = tune(CalendarDays, "IconCalendar");
export const IconUser = tune(UserRound, "IconUser");

/* -------------------------------------------------------------------- Social

   Lucide a scos marcajele de brand din motive de marcă înregistrată. Pentru
   acestea se folosesc formele oficiale ale platformelor, ca peste tot.        */

type BrandProps = SVGProps<SVGSVGElement>;

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
