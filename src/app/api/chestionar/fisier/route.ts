import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { db } from "@/lib/db";
import { clientIp } from "@/lib/request";

/* ----------------------------------------------------------------------------
   Încărcarea documentelor din chestionar (modelul de contract).

   Fișierele NU ajung în folderul public: se salvează în `uploads/`, la rădăcina
   proiectului, cu un nume generat. Se descarcă doar din panoul de administrare.
   Numele original se păstrează separat, ca să nu poată influența calea pe disc.
   -------------------------------------------------------------------------- */

const UPLOAD_DIR = join(process.cwd(), "uploads");
const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED = new Map([
  ["application/pdf", "pdf"],
  ["application/msword", "doc"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
  ["application/vnd.oasis.opendocument.text", "odt"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
]);

const WINDOW_MS = 10 * 60 * 1000;
const MAX_UPLOADS = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_UPLOADS;
}

export async function POST(request: Request) {
  if (rateLimited(clientIp(request))) {
    return NextResponse.json(
      { error: "Prea multe încărcări. Încearcă peste câteva minute." },
      { status: 429 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const file = form.get("file");
  const key = String(form.get("key") ?? "contract");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Lipsește fișierul." }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "Fișierul este gol." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Fișierul depășește 10 MB." },
      { status: 400 },
    );
  }

  const ext = ALLOWED.get(file.type);
  if (!ext) {
    return NextResponse.json(
      { error: "Acceptăm doar PDF, Word, ODT, JPG sau PNG." },
      { status: 400 },
    );
  }

  const storedAs = `${randomBytes(16).toString("hex")}.${ext}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(
    join(UPLOAD_DIR, storedAs),
    Buffer.from(await file.arrayBuffer()),
  );

  const saved = await db.briefFile.create({
    data: {
      key,
      fileName: file.name.slice(0, 200),
      storedAs,
      mimeType: file.type,
      size: file.size,
    },
  });

  return NextResponse.json({
    ok: true,
    file: { id: saved.id, fileName: saved.fileName, size: saved.size },
  });
}
