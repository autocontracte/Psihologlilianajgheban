import { progRoute } from "@/lib/programator/api";
import { createPerson } from "@/lib/programator/oameni";

export async function POST(request: Request) {
  return progRoute(request, (_user, b) => createPerson(b), { manager: true });
}
