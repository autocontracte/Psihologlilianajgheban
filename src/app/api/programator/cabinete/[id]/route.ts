import { progRoute } from "@/lib/programator/api";
import { updateRoom } from "@/lib/programator/oameni";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return progRoute(request, (_user, b) => updateRoom(id, b), { manager: true });
}
