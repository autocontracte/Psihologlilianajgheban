import { progRoute } from "@/lib/programator/api";
import { createRelease } from "@/lib/programator/date";

/** Proprietarul eliberează un interval din ziua lui, ca să-l poată rezerva alții. */
export async function POST(request: Request) {
  return progRoute(request, (user, b) =>
    createRelease(user, {
      roomId: String(b.roomId ?? ""),
      date: String(b.date ?? ""),
      start: Number(b.start),
      end: Number(b.end),
      everyWeeks: Number(b.everyWeeks) || 0,
      until: String(b.until ?? ""),
    }),
  );
}
