import { progRoute } from "@/lib/programator/api";
import { week } from "@/lib/programator/date";

export async function GET(request: Request) {
  const start = new URL(request.url).searchParams.get("start") ?? "";
  return progRoute(request, () => week(start));
}
