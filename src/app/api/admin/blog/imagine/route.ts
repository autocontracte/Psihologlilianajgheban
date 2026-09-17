import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getCurrentUser } from "@/lib/auth";

/* Imaginile din articole sunt conținut public, așa că se salvează în
   `public/blog-media/` și se servesc direct la /blog-media/<nume>. Numele e
   generat de noi — cel original nu atinge niciodată calea de pe disc. */
const DIR = join(process.cwd(), "public", "blog-media");
const MAX = 8 * 1024 * 1024;
const TIPURI = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Lipsește imaginea." }, { status: 400 });
  }
  const ext = TIPURI.get(file.type);
  if (!ext) {
    return NextResponse.json({ error: "Format acceptat: JPG, PNG, WEBP, GIF." }, { status: 400 });
  }
  if (file.size > MAX) {
    return NextResponse.json({ error: "Imaginea e prea mare (max 8 MB)." }, { status: 400 });
  }

  const nume = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  await mkdir(DIR, { recursive: true });
  await writeFile(join(DIR, nume), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ ok: true, url: `/blog-media/${nume}` });
}
