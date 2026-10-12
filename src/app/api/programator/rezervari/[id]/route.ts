import { progRoute } from "@/lib/programator/api";
import { deleteReservation, updateReservation } from "@/lib/programator/date";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  return progRoute(request, async (user, b) => {
    await updateReservation(user, id, {
      roomId: b.roomId === undefined ? undefined : String(b.roomId),
      personId: b.personId === undefined ? undefined : String(b.personId),
      date: b.date === undefined ? undefined : String(b.date),
      start: b.start === undefined ? undefined : Number(b.start),
      end: b.end === undefined ? undefined : Number(b.end),
      note: b.note === undefined ? undefined : String(b.note),
    });
  });
}

export async function DELETE(request: Request, { params }: Ctx) {
  const { id } = await params;
  const following = new URL(request.url).searchParams.get("urmatoarele") === "1";
  return progRoute(request, async (user) => ({
    deleted: await deleteReservation(user, id, following),
  }));
}
