import { adminCalendar } from "@/lib/calendarApi";
import { creeazaProgramare } from "@/lib/calendarLiliana";

/** POST — Liliana adaugă o programare pentru un client. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  return adminCalendar(() => creeazaProgramare(body));
}
