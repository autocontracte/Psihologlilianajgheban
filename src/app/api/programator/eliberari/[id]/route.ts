import { progRoute } from "@/lib/programator/api";
import { deleteRelease } from "@/lib/programator/date";

/** Proprietarul își ia înapoi intervalul (cu `?urmatoarele=1`, și repetările de după). */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const following = new URL(request.url).searchParams.get("urmatoarele") === "1";
  return progRoute(request, (user) => deleteRelease(user, id, following));
}
