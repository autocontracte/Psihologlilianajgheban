import Link from "next/link";
import { db } from "@/lib/db";
import {
  AdminAppointmentRow,
  type AdminAppointment,
} from "@/components/admin/AdminAppointmentRow";
import { formatDateLong, formatTime } from "@/lib/tz";
import { clientOf } from "@/lib/appointments";
import { STATUSES, STATUS_LABEL, type Format, type Status, isStatus } from "@/lib/types";
import type { Prisma } from "@prisma/client";
import { googleActiv } from "@/lib/googleCalendar";
import { SincronizeazaGoogle } from "@/components/admin/SincronizeazaGoogle";

export const metadata = { title: "Programări" };

const FILTERS = [
  { key: "upcoming", label: "Viitoare" },
  { key: "all", label: "Toate" },
  ...STATUSES.map((s) => ({ key: s, label: STATUS_LABEL[s] })),
];

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; filter?: string }>;
}) {
  const sp = await searchParams;
  const active = sp.status ?? sp.filter ?? "upcoming";

  const where: Prisma.AppointmentWhereInput = {};

  if (isStatus(active)) {
    where.status = active;
  } else if (active === "upcoming") {
    where.startsAt = { gte: new Date() };
    where.status = { in: ["PENDING", "CONFIRMED"] };
  }

  /* Plățile online abandonate n-au fost niciodată programări reale — nu le
     arătăm, ca lista să nu se umple de „anulate” fantomă. */
  where.NOT = { paymentMethod: "ONLINE", calendarSeq: 0, status: "CANCELLED" };

  const rows = await db.appointment.findMany({
    where,
    include: { service: true, user: true, payments: true },
    orderBy: { startsAt: active === "upcoming" ? "asc" : "desc" },
    take: 200,
  });

  const now = Date.now();

  /* Ce e în Google Calendar pus direct de Liliana (nu de site): ocupă orele
     pe site, deci îl arătăm aici, ca imaginea să fie completă. */
  const [sync, blocuri] = await Promise.all([
    db.calendarSync.findUnique({ where: { id: "google" } }),
    active === "upcoming"
      ? db.calendarBlock.findMany({
          where: { endsAt: { gte: new Date() } },
          orderBy: { startsAt: "asc" },
          take: 30,
        })
      : Promise.resolve([]),
  ]);

  const items: AdminAppointment[] = rows.map((r) => {
    const client = clientOf(r);
    return {
      id: r.id,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      hasAccount: client.hasAccount,
      serviceName: r.service.name,
      duration: r.service.duration,
      dateLabel: formatDateLong(r.startsAt),
      timeLabel: formatTime(r.startsAt),
      format: r.format as Format,
      status: r.status as Status,
      notes: r.notes,
      adminNote: r.adminNote,
      isPast: r.startsAt.getTime() < now,
      plata: r.paymentMethod === "ONLINE" ? "ONLINE" : "CABINET",
      platita: r.payments.some((p) => p.status === "PAID"),
      asteaptaPlata: r.paymentMethod === "ONLINE" && r.status === "PENDING",
      inGoogle: Boolean(r.googleEventId),
    };
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink lg:text-4xl">Programări</h1>
      <p className="mt-2.5 font-sans text-[0.88rem] text-ink-soft">
        {items.length}{" "}
        {items.length === 1 ? "programare afișată" : "programări afișate"}
      </p>

      {/* Google Calendar */}
      <section className="mt-7 bg-cream p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-[1.15rem] text-ink">Google Calendar</h2>
            <p className="mt-1.5 font-sans text-[0.82rem] text-ink-soft">
              {!googleActiv
                ? "Neconectat — programările nu ajung încă în Google Calendar."
                : sync?.lastError
                  ? `Ultima sincronizare a eșuat: ${sync.lastError.slice(0, 160)}`
                  : sync?.lastOkAt
                    ? `Sincronizat automat la 2 minute. Ultima dată: ${formatTime(sync.lastOkAt)}.`
                    : "Conectat. Prima sincronizare rulează în câteva momente."}
            </p>
          </div>
          {googleActiv && <SincronizeazaGoogle />}
        </div>

        {blocuri.length > 0 && (
          <div className="mt-5 border-t border-ink/10 pt-4">
            <p className="font-sans text-[0.78rem] text-ink-muted">
              Puse direct în Google — orele sunt ocupate pe site:
            </p>
            <ul className="mt-2.5 space-y-1.5">
              {blocuri.map((b) => (
                <li key={b.id} className="font-sans text-[0.84rem] text-ink-soft">
                  <span className="text-ink">{b.title}</span> ·{" "}
                  {formatDateLong(b.startsAt)}
                  {b.allDay ? " (toată ziua)" : `, ${formatTime(b.startsAt)}–${formatTime(b.endsAt)}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Filtre */}
      <div className="mt-7 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={
              f.key === "upcoming" || f.key === "all"
                ? `/admin/programari?filter=${f.key}`
                : `/admin/programari?status=${f.key}`
            }
            className={[
              "rounded-none px-4 py-2 font-sans text-[0.8rem] tracking-[0.02em] transition-all duration-400",
              active === f.key
                ? "bg-periwinkle text-cream"
                : "bg-cream text-ink-soft hover:bg-periwinkle-pale hover:text-ink",
            ].join(" ")}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Listă */}
      <div className="mt-8 space-y-4">
        {items.length === 0 ? (
          <p className="rounded-none bg-cream px-6 py-10 text-center font-sans text-[0.88rem] text-ink-soft">
            Nicio programare pentru filtrul selectat.
          </p>
        ) : (
          items.map((a) => <AdminAppointmentRow key={a.id} a={a} />)
        )}
      </div>
    </div>
  );
}
