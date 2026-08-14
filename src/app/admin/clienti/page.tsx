import { db } from "@/lib/db";
import { formatDateShort } from "@/lib/tz";

export const metadata = { title: "Clienți" };

export default async function AdminClientsPage() {
  const clients = await db.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { createdAt: "desc" },
    include: {
      appointments: {
        select: { status: true, startsAt: true },
      },
    },
  });

  const now = Date.now();

  return (
    <div>
      <h1 className="font-display text-3xl text-ink lg:text-4xl">Clienți</h1>
      <p className="mt-2.5 font-sans text-[0.88rem] text-ink-soft">
        {clients.length} {clients.length === 1 ? "cont" : "conturi"} înregistrate
      </p>

      <div className="mt-9">
        {clients.length === 0 ? (
          <p className="rounded-[1.5rem] bg-cream px-6 py-10 text-center font-sans text-[0.88rem] text-ink-soft">
            Nu există încă niciun client înregistrat.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-[1.75rem] bg-cream">
            <table className="w-full min-w-[46rem]">
              <thead>
                <tr className="border-b border-ink/10">
                  {["Nume", "Contact", "Ședințe", "Următoarea", "Cont creat"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-left font-sans text-[0.58rem] uppercase tracking-[0.2em] text-ink-muted"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => {
                  const done = c.appointments.filter(
                    (a) => a.status === "COMPLETED",
                  ).length;
                  const next = c.appointments
                    .filter(
                      (a) =>
                        a.startsAt.getTime() >= now &&
                        (a.status === "PENDING" || a.status === "CONFIRMED"),
                    )
                    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0];

                  return (
                    <tr
                      key={c.id}
                      className="border-b border-ink/6 last:border-0 transition-colors hover:bg-cream-warm"
                    >
                      <td className="px-6 py-4 font-sans text-[0.88rem] text-ink">
                        {c.name}
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`tel:${c.phone}`}
                          className="block font-sans text-[0.82rem] text-ink-soft transition-colors hover:text-periwinkle"
                        >
                          {c.phone}
                        </a>
                        <a
                          href={`mailto:${c.email}`}
                          className="block font-sans text-[0.82rem] text-ink-muted transition-colors hover:text-periwinkle"
                        >
                          {c.email}
                        </a>
                      </td>
                      <td className="px-6 py-4 font-sans text-[0.85rem] text-ink-soft">
                        {c.appointments.length} total
                        {done > 0 && (
                          <span className="text-ink-muted"> · {done} finalizate</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-sans text-[0.85rem] text-ink-soft">
                        {next ? formatDateShort(next.startsAt) : "—"}
                      </td>
                      <td className="px-6 py-4 font-sans text-[0.82rem] text-ink-muted">
                        {formatDateShort(c.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
