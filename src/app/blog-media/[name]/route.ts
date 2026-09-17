import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/* Servește imaginile din articole. Sunt salvate în uploads/blog/ (Next nu
   servește fișiere adăugate în public/ după build). Numele e generat de noi;
   verificăm totuși forma lui, ca să nu se poată ieși din folder. */
const TIPURI: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  webp: "image/webp", gif: "image/gif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!/^[a-zA-Z0-9._-]+$/.test(name) || name.includes("..")) {
    return new NextResponse("Cerere invalidă.", { status: 400 });
  }
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const tip = TIPURI[ext];
  if (!tip) return new NextResponse("Negăsit.", { status: 404 });

  // Întâi din uploads/blog (locul nou), apoi din public/blog-media (imagini
  // încărcate înainte de această corectură).
  const cai = [
    join(process.cwd(), "uploads", "blog", name),
    join(process.cwd(), "public", "blog-media", name),
  ];
  for (const cale of cai) {
    try {
      const bytes = await readFile(cale);
      return new NextResponse(new Uint8Array(bytes), {
        headers: {
          "Content-Type": tip,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // încearcă următoarea cale
    }
  }
  return new NextResponse("Negăsit.", { status: 404 });
}
