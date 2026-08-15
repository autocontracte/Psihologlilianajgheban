import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { OrbitRing } from "@/components/ui/OrbitFrame";
import {
  AppointmentList,
  type ClientAppointment,
} from "@/components/account/AppointmentList";
import { LogoutButton } from "@/components/account/LogoutButton";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CANCEL_LEAD_HOURS } from "@/lib/slots";
import { formatDateLong, formatTime } from "@/lib/tz";
import type { Format, Status } from "@/lib/types";
import { IconArrow } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Contul meu",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ContPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/cont/autentificare?redirect=/cont");
  if (user.role === "ADMIN") redirect("/admin");

  const rows = await db.appointment.findMany({
    where: { userId: user.id },
    include: { service: true },
    orderBy: { startsAt: "asc" },
  });

  const now = Date.now();

  const map = (r: (typeof rows)[number]): ClientAppointment => ({
    id: r.id,
    serviceName: r.service.name,
    duration: r.service.duration,
    startsAtISO: r.startsAt.toISOString(),
    dateLabel: formatDateLong(r.startsAt),
    timeLabel: formatTime(r.startsAt),
    format: r.format as Format,
    status: r.status as Status,
    notes: r.notes,
    canCancel:
      (r.status === "PENDING" || r.status === "CONFIRMED") &&
      r.startsAt.getTime() - now > CANCEL_LEAD_HOURS * 60 * 60 * 1000,
  });

  const upcoming = rows
    .filter(
      (r) =>
        r.startsAt.getTime() >= now &&
        r.status !== "CANCELLED" &&
        r.status !== "COMPLETED",
    )
    .map(map);

  const past = rows
    .filter(
      (r) =>
        r.startsAt.getTime() < now ||
        r.status === "CANCELLED" ||
        r.status === "COMPLETED",
    )
    .reverse()
    .map(map);

  return (
    <>
      <Nav />
      <main className="grain relative min-h-screen overflow-hidden bg-cream pt-36 pb-24 lg:pt-44">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-10 h-[30rem] w-[30rem] rounded-full bg-periwinkle-pale/50 blur-3xl"
        />
        <OrbitRing
          className="-left-32 top-40 hidden lg:block"
          size="24rem"
          accent="sage"
          duration={66}
          dashed
        />

        <div className="relative mx-auto max-w-3xl px-6 lg:px-10">
          {/* Antet */}
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="font-sans text-[0.76rem] tracking-[0.02em] text-periwinkle">
                  Contul meu
                </p>
                <h1 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
                  Bună, {user.name.split(" ")[0]}
                </h1>
                <p className="mt-3 font-sans text-[0.88rem] text-ink-soft">
                  {user.email} · {user.phone}
                </p>
              </div>
              <LogoutButton />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Link
              href="/programari"
              className="group mt-9 inline-flex items-center gap-2.5 rounded-pill bg-periwinkle px-7 py-3.5 font-sans text-[0.7rem] tracking-[0.02em] text-cream transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink"
            >
              Programează o ședință
              <IconArrow className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </Reveal>

          {/* Programări viitoare */}
          <section className="mt-14">
            <Reveal>
              <h2 className="font-display text-2xl text-ink">
                Ședințe viitoare
              </h2>
              <div className="rule-soft mt-5" />
            </Reveal>
            <div className="mt-7">
              <AppointmentList
                appointments={upcoming}
                emptyText="Nu ai nicio ședință programată. Poți stabili una oricând."
              />
            </div>
            {upcoming.length > 0 && (
              <p className="mt-4 font-sans text-[0.78rem] text-ink-muted">
                Anularea se poate face cu cel puțin {CANCEL_LEAD_HOURS} de ore
                înainte. Pentru schimbări în ultimul moment, sună-mă.
              </p>
            )}
          </section>

          {/* Istoric */}
          {past.length > 0 && (
            <section className="mt-16">
              <Reveal>
                <h2 className="font-display text-2xl text-ink">Istoric</h2>
                <div className="rule-soft mt-5" />
              </Reveal>
              <div className="mt-7 opacity-80">
                <AppointmentList appointments={past} emptyText="" />
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
