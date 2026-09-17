import Link from "next/link";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/tz";

export const metadata = { title: "Blog" };

const STARE: Record<string, { text: string; stil: string }> = {
  PUBLISHED: { text: "Publicat", stil: "bg-periwinkle-pale text-periwinkle" },
  DRAFT: { text: "Ciornă", stil: "bg-clay-pale text-clay" },
};

export default async function AdminBlogPage() {
  const posts = await db.blogPost.findMany({ orderBy: { updatedAt: "desc" } });
  const publicate = posts.filter((p) => p.status === "PUBLISHED").length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink lg:text-4xl">Blog</h1>
          <p className="mt-3 font-sans text-[0.92rem] text-ink-soft">
            {posts.length} articole · {publicate} publicate
          </p>
        </div>
        <Link
          href="/admin/blog/nou"
          className="bg-periwinkle px-6 py-3 font-sans text-[0.88rem] text-cream transition-colors hover:bg-ink"
        >
          Articol nou
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {posts.length === 0 ? (
          <p className="bg-cream px-6 py-10 text-center font-sans text-[0.9rem] text-ink-soft">
            Niciun articol încă. Apasă „Articol nou".
          </p>
        ) : (
          posts.map((p) => {
            const stare = STARE[p.status] ?? STARE.DRAFT;
            return (
              <Link
                key={p.id}
                href={`/admin/blog/${p.id}`}
                className="flex items-center gap-4 bg-cream p-5 transition-colors hover:bg-cream-deep"
              >
                {p.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverImage} alt="" className="h-16 w-24 shrink-0 border border-ink/10 object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className={`px-2.5 py-1 font-sans text-[0.72rem] ${stare.stil}`}>
                      {stare.text}
                    </span>
                    <span className="font-sans text-[0.78rem] text-ink-muted">
                      {p.publishedAt ? formatDateTime(p.publishedAt) : `modificat ${formatDateTime(p.updatedAt)}`}
                    </span>
                  </div>
                  <p className="mt-1.5 font-display text-[1.15rem] text-ink">{p.title}</p>
                </div>
                <span className="mi shrink-0 text-ink-muted" aria-hidden="true">chevron_right</span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
