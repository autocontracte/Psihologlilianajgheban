import Link from "next/link";
import { db } from "@/lib/db";
import { formatDateLong, formatTime, todayStr, zonedToUtc, addDays } from "@/lib/tz";
import { STATUS_LABEL, STATUS_STYLE, FORMAT_LABEL, type Format, type Status } from "@/lib/types";

export default async function AdminHome() {
  const today = todayStr();
  const startOfToday = zonedToUtc(today, "00:00");
  const startOfTomorrow = zonedToUtc(addDays(today, 1), "00:00");
  const in7days = zonedToUtc(addDays(today, 7), "00:00");
  const now = new Date();

  const [pending, todayList, weekCount, clientCount, upcoming] =
    await Promise.all([
      db.appointment.count({ where: { status: "PENDING", startsAt: { gte: now } } }),
      db.appointment.findMany({
        where: {
          startsAt: { gte: startOfToday, lt: startOfTomorrow },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        include: { service: true, user: true },
        orderBy: { startsAt: "asc" },
      }),
      db.appointment.count({
        where: {
          startsAt: { gte: startOfToday, lt: in7days },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      }),
      db.user.count({ where: { role: "CLIENT" } }),
      db.appointment.findMany({
        where: { startsAt: { gte: now }, status: { in: ["PENDING", "CONFIRMED"] } },
        include: { service: true, user: true },
        orderBy: { startsAt: "asc" },
        take: 6,
      }),
    ]);

  const stats = [
    { label: "În așteptare", value: pending, accent: "text-clay", href: "/admin/programari?status=PENDING" },
    { label: "Astăzi", value: todayList.length, accent: "text-periwinkle", href: "/admin/programari" },
    { label: "Următoarele 7 zile", value: weekCount, accent: "text-sage", href: "/admin/programari" },
    { label: "Clienți", value: clientCount, accent: "text-ink", href: "/admin/clienti" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink lg:text-4xl">Prezentare</h1>
      <p className="mt-2.5 font-sans text-[0.88rem] text-ink-soft">
        {formatDateLong(new Date())}
      </p>

      {/* Cifre */}
      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="lift rounded-[1.75rem] bg-cream p-6 transition-shadow"
          >
            <p className="font-sans text-[0.58rem] uppercase tracking-[0.22em] text-ink-muted">
              {s.label}
            </p>
            <p className={`mt-3 font-display text-4xl ${s.accent}`}>{s.value}</p>
          </Link>
        ))}
      </div>

      {/* Programul de azi */}
      <section className="mt-12">
        <h2 className="font-display text-2xl text-ink">Programul de azi</h2>
        <div className="mt-6">
          {todayList.length === 0 ? (
            <p className="rounded-[1.5rem] bg-cream px-6 py-8 text-center font-sans text-[0.88rem] text-ink-soft">
              Nicio ședință programată astăzi.
            </p>
          ) : (
            <div className="space-y-3">
              {todayList.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center gap-4 rounded-[1.5rem] bg-cream p-5"
                >
                  <span className="font-display text-2xl text-periwinkle">
                    {formatTime(a.startsAt)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-[0.92rem] text-ink">
                      {a.user.name}
                    </p>
                    <p className="font-sans text-[0.8rem] text-ink-soft">
                      {a.service.name} · {FORMAT_LABEL[a.format as Format]}
                    </p>
                  </div>
                  <span
                    className={`rounded-pill px-3.5 py-1.5 font-sans text-[0.6rem] uppercase tracking-[0.14em] ${STATUS_STYLE[a.status as Status]}`}
                  >
                    {STATUS_LABEL[a.status as Status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Ce urmează */}
      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl text-ink">Ce urmează</h2>
          <Link
            href="/admin/programari"
            className="font-sans text-[0.7rem] uppercase tracking-[0.14em] text-periwinkle transition-colors duration-300 hover:text-ink"
          >
            Toate programările →
          </Link>
        </div>

        <div className="mt-6">
          {upcoming.length === 0 ? (
            <p className="rounded-[1.5rem] bg-cream px-6 py-8 text-center font-sans text-[0.88rem] text-ink-soft">
              Nu există programări viitoare.
            </p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] bg-cream p-5"
                >
                  <div className="min-w-0">
                    <p className="font-sans text-[0.92rem] text-ink">
                      {a.user.name} — {a.service.name}
                    </p>
                    <p className="mt-0.5 font-sans text-[0.8rem] text-ink-soft">
                      {formatDateLong(a.startsAt)}, ora {formatTime(a.startsAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-pill px-3.5 py-1.5 font-sans text-[0.6rem] uppercase tracking-[0.14em] ${STATUS_STYLE[a.status as Status]}`}
                  >
                    {STATUS_LABEL[a.status as Status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
