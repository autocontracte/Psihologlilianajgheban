import { progRoute } from "@/lib/programator/api";
import { createReservation } from "@/lib/programator/date";

export async function POST(request: Request) {
  return progRoute(request, (user, b) =>
    createReservation(user, {
      roomId: String(b.roomId ?? ""),
      personId: String(b.personId ?? ""),
      date: String(b.date ?? ""),
      start: Number(b.start),
      end: Number(b.end),
      note: String(b.note ?? ""),
      everyWeeks: Number(b.everyWeeks) || 0,
      until: String(b.until ?? ""),
    }),
  );
}
