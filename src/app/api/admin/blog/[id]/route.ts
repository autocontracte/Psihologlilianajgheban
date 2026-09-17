import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { curataHtml, rezumatDinHtml, slugUnic } from "@/lib/blog";

async function requireAdmin() {
  const user = await getCurrentUser();
  return user && user.role === "ADMIN" ? user : null;
}

/** PATCH — salvează modificările unui articol. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  const { id } = await params;
  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: "Articolul nu există." }, { status: 404 });
  }

  let body: Record<string, unknown>;
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
  const slug = await slugUnic(String(body.slug ?? "").trim() || title, id);

  // Prima publicare fixează data; republicarea nu o schimbă.
  const publishedAt =
    status === "PUBLISHED" ? post.publishedAt ?? new Date() : null;

  await db.blogPost.update({
    where: { id },
    data: {
      title,
      slug,
      content,
      excerpt: excerptDat || rezumatDinHtml(content),
      coverImage: String(body.coverImage ?? "").trim() || null,
      status,
      publishedAt,
    },
  });

  return NextResponse.json({ ok: true, slug });
}

/** DELETE — șterge un articol. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }
  const { id } = await params;
  await db.blogPost.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
