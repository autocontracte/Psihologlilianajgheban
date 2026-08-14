import { db } from "@/lib/db";
import { ScheduleManager } from "@/components/admin/ScheduleManager";
import { todayStr } from "@/lib/tz";

export const metadata = { title: "Program și zile libere" };

export default async function AdminSchedulePage() {
  const today = todayStr();

  const [windows, blocked] = await Promise.all([
    db.availability.findMany({
      where: { active: true },
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    }),
    db.blockedDate.findMany({
      where: { date: { gte: today } },
      orderBy: { date: "asc" },
    }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink lg:text-4xl">
        Program și zile libere
      </h1>
      <p className="mt-2.5 font-sans text-[0.88rem] text-ink-soft">
        De aici controlezi ce intervale sunt disponibile pentru programări.
      </p>

      <div className="mt-10">
        <ScheduleManager
          windows={windows}
          blocked={blocked}
          todayStr={today}
        />
      </div>
    </div>
  );
}
