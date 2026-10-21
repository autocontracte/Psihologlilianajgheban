import { adminCalendar } from "@/lib/calendarApi";
import { creeazaEveniment } from "@/lib/calendarLiliana";

/** POST — un eveniment nou în Google Calendar-ul Lilianei. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  return adminCalendar(() => creeazaEveniment(body));
}
