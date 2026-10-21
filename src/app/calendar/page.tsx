import { redirect } from "next/navigation";
import { Aplicatie } from "@/components/calendar/Aplicatie";
import { getCurrentUser } from "@/lib/auth";
import { lunaCalendar } from "@/lib/calendarLiliana";

export default async function CalendarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/cont/autentificare?redirect=/calendar");
  if (user.role !== "ADMIN") redirect("/cont");

  return <Aplicatie initial={await lunaCalendar("")} />;
}
