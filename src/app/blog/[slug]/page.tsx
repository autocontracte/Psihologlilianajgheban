import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { articolPublicat, curataHtml } from "@/lib/blog";
import { formatDateLong } from "@/lib/tz";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await articolPublicat(slug);
  if (!post) return { title: "Articol negăsit" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: post.coverImage
      ? { images: [{ url: post.coverImage }], title: post.title }
      : undefined,
  };
}

export default async function ArticolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await articolPublicat(slug);
  if (!post) notFound();

  /* Conținutul e curățat și la salvare; îl mai curățăm o dată la afișare,
     ca măsură de siguranță în plus (apărare pe mai multe straturi). */
  const html = curataHtml(post.content);

  return (
    <>
      <Nav />
      <main>
        <article className="bg-cream pb-24 pt-36 lg:pt-44">
          <div className="mx-auto max-w-4xl px-6 lg:px-10">
            <Reveal>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 font-sans text-[0.82rem] text-ink-muted transition-colors hover:text-sage"
              >
                <span className="mi" style={{ fontSize: "1.05rem" }} aria-hidden="true">chevron_left</span>
                Toate articolele
              </Link>
            </Reveal>

            <Reveal delay={0.06}>
              {post.publishedAt && (
                <p className="mt-8 font-sans text-[0.8rem] tracking-[0.02em] text-ink-muted">
                  {formatDateLong(post.publishedAt)}
                </p>
              )}
              <h1 className="mt-3 font-display text-[2.1rem] leading-[1.12] text-ink lg:text-[3rem]">
                {post.title}
              </h1>
            </Reveal>
          </div>

          {post.coverImage && (
            <Reveal delay={0.12}>
              <div className="mx-auto mt-10 max-w-4xl px-6 lg:px-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.coverImage}
                  alt=""
                  className="max-h-[34rem] w-full border border-ink/10 object-cover"
                />
              </div>
            </Reveal>
          )}

          <Reveal delay={0.16}>
            <div
              className="prose-articol mx-auto mt-12 max-w-4xl px-6 lg:px-10"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </Reveal>

          <div className="mx-auto mt-16 max-w-4xl px-6 lg:px-10">
            <div className="border-t border-ink/10 pt-8">
              <p className="font-display text-[1.15rem] text-ink">
                Ai nevoie de sprijin?
              </p>
              <p className="mt-2 font-sans text-[0.9rem] leading-relaxed text-ink-soft">
                Dacă ceva din acest articol te-a atins, putem vorbi despre asta
                într-un cadru sigur.
              </p>
              <Link
                href="/programari"
                className="mt-5 inline-flex bg-periwinkle px-7 py-3.5 font-sans text-[0.88rem] text-cream transition-colors hover:bg-ink"
              >
                Programează o ședință
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

export const dynamic = "force-dynamic";
