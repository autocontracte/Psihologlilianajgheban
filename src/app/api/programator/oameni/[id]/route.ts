import { progRoute } from "@/lib/programator/api";
import { updatePerson } from "@/lib/programator/oameni";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return progRoute(request, (user, b) => updatePerson(user, id, b), { manager: true });
}
