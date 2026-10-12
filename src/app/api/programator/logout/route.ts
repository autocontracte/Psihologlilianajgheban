import { NextResponse } from "next/server";
import { destroyProgSession } from "@/lib/programator/auth";

export async function POST() {
  await destroyProgSession();
  return NextResponse.json({ ok: true });
}
