import { adminCalendar } from "@/lib/calendarApi";
import { lunaCalendar } from "@/lib/calendarLiliana";

/** GET — cele 6 săptămâni ale vederii pe lună în care cade ziua `zi`. */
export async function GET(request: Request) {
  const zi = new URL(request.url).searchParams.get("zi") ?? "";
  return adminCalendar(() => lunaCalendar(zi));
}
