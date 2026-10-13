import { progRoute } from "@/lib/programator/api";
import { cancelReservation, restoreReservation } from "@/lib/programator/date";

type Ctx = { params: Promise<{ id: string }> };

/** Anulează ședința (cu `?urmatoarele=1`, și repetările de după ea). */
export async function POST(request: Request, { params }: Ctx) {
  const { id } = await params;
  const following = new URL(request.url).searchParams.get("urmatoarele") === "1";
  return progRoute(request, (user) => cancelReservation(user, id, following));
}

/** Repune în grilă o ședință anulată (doar administratorii). */
export async function DELETE(request: Request, { params }: Ctx) {
  const { id } = await params;
  return progRoute(request, (user) => restoreReservation(user, id));
}
