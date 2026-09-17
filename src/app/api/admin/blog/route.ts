import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { curataHtml, rezumatDinHtml, slugUnic } from "@/lib/blog";

type Intrare = {
  title?: unknown;
  slug?: unknown;
  excerpt?: unknown;
  content?: unknown;
  coverImage?: unknown;
  status?: unknown;
};

async function requireAdmin() {
  const user = await getCurrentUser();
  return user && user.role === "ADMIN" ? user : null;
}

/** POST — creează un articol nou (ciornă sau publicat). */
export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  let body: Intrare;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  if (title.length < 3) {
    return NextResponse.json({ error: "Titlul e prea scurt." }, { status: 400 });
  }

  const content = curataHtml(String(body.content ?? ""));
  const excerptDat = String(body.excerpt ?? "").trim();
  const status = body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  const slug = await slugUnic(String(body.slug ?? "").trim() || title);

  const post = await db.blogPost.create({
    data: {
      title,
      slug,
      content,
      excerpt: excerptDat || rezumatDinHtml(content),
      coverImage: String(body.coverImage ?? "").trim() || null,
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });

  return NextResponse.json({ ok: true, id: post.id, slug: post.slug });
}
