import "server-only";

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { CalendarError } from "@/lib/calendarLiliana";

/* Rutele aplicației de calendar a Lilianei: doar pentru administrator, cu
   erorile spuse pe înțeles. */
export async function adminCalendar<T>(fn: () => Promise<T>): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sesiunea a expirat. Intră din nou în cont." }, { status: 401 });
  }
  try {
    return NextResponse.json(await fn());
  } catch (err) {
    if (err instanceof CalendarError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[calendar]", err);
    return NextResponse.json({ error: "Operațiunea nu a reușit. Încearcă din nou." }, { status: 500 });
  }
}
