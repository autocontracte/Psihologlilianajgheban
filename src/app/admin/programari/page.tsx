import Link from "next/link";
import { db } from "@/lib/db";
import {
  AdminAppointmentRow,
  type AdminAppointment,
} from "@/components/admin/AdminAppointmentRow";
import { formatDateLong, formatTime } from "@/lib/tz";
import { STATUSES, STATUS_LABEL, type Format, type Status, isStatus } from "@/lib/types";
import type { Prisma } from "@prisma/client";

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

  const rows = await db.appointment.findMany({
    where,
    include: { service: true, user: true },
    orderBy: { startsAt: active === "upcoming" ? "asc" : "desc" },
    take: 200,
  });

  const now = Date.now();

  const items: AdminAppointment[] = rows.map((r) => ({
    id: r.id,
    clientName: r.user.name,
    clientEmail: r.user.email,
    clientPhone: r.user.phone,
    serviceName: r.service.name,
    duration: r.service.duration,
    dateLabel: formatDateLong(r.startsAt),
    timeLabel: formatTime(r.startsAt),
    format: r.format as Format,
    status: r.status as Status,
    notes: r.notes,
    adminNote: r.adminNote,
    isPast: r.startsAt.getTime() < now,
  }));

  return (
    <div>
      <h1 className="font-display text-3xl text-ink lg:text-4xl">Programări</h1>
      <p className="mt-2.5 font-sans text-[0.88rem] text-ink-soft">
        {items.length}{" "}
        {items.length === 1 ? "programare afișată" : "programări afișate"}
      </p>

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
              "rounded-pill px-4 py-2 font-sans text-[0.68rem] uppercase tracking-[0.14em] transition-all duration-400",
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
          <p className="rounded-[1.5rem] bg-cream px-6 py-10 text-center font-sans text-[0.88rem] text-ink-soft">
            Nicio programare pentru filtrul selectat.
          </p>
        ) : (
          items.map((a) => <AdminAppointmentRow key={a.id} a={a} />)
        )}
      </div>
    </div>
  );
}
