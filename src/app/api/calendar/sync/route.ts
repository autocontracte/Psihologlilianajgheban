import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sincronizeazaDinGoogle } from "@/lib/calendarSync";

/** POST — butonul „Sincronizează acum” din panou. */
export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  const rezultat = await sincronizeazaDinGoogle();
  return NextResponse.json(rezultat, { status: rezultat.ok ? 200 : 502 });
}
