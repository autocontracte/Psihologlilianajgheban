import { progRoute } from "@/lib/programator/api";
import { month } from "@/lib/programator/date";

/** Cele 6 săptămâni afișate în vederea pe lună a zilei `zi`. */
export async function GET(request: Request) {
  const zi = new URL(request.url).searchParams.get("zi") ?? "";
  return progRoute(request, () => month(zi));
}
