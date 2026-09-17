import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { FormularArticol } from "@/components/admin/FormularArticol";

export const metadata = { title: "Editează articolul" };

export default async function EditeazaArticolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl text-ink lg:text-4xl">Editează articolul</h1>
      <div className="mt-8">
        <FormularArticol
          articol={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt ?? "",
            content: post.content,
            coverImage: post.coverImage,
            status: post.status,
          }}
        />
      </div>
    </div>
  );
}
