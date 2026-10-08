import type { Metadata } from "next";
import { metaPagina } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { articolPublicat, articoleSimilare, curataHtml, rezumatDinHtml, structuraArticol } from "@/lib/blog";
import { formatDateLong } from "@/lib/tz";
import { DIPLOME, SITE } from "@/content/site";
import { AutorArticol, PORTRET_AUTOR, atestateAutor } from "@/components/blog/AutorArticol";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await articolPublicat(slug);
  if (!post) return { title: "Articol negăsit", robots: { index: false } };
  return metaPagina({
    titlu: post.title,
    descriere: post.excerpt || rezumatDinHtml(post.content, 160),
    cale: `/blog/${post.slug}`,
    articol: { publicat: post.publishedAt, modificat: post.updatedAt },
  });
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
  const { html, faq } = structuraArticol(curataHtml(post.content));
  const similare = await articoleSimilare(post.slug, 3);
  const descriere = post.excerpt || rezumatDinHtml(post.content, 160);
  const cuvinte = rezumatDinHtml(post.content, 1e9).split(/\s+/).filter(Boolean).length;
  const autor = {
    "@type": "Person",
    "@id": `${SITE.url}/#liliana`,
    name: SITE.name,
    url: `${SITE.url}/#despre`,
    image: `${SITE.url}${PORTRET_AUTOR}`,
    jobTitle: SITE.role,
    worksFor: { "@id": `${SITE.url}/#cabinet` },
    hasCredential: atestateAutor().map((d) => ({
      "@type": "EducationalOccupationalCredential",
      name: d.titlu,
      credentialCategory: "license",
      recognizedBy: { "@type": "Organization", name: d.emitent },
      dateCreated: d.an,
    })),
    alumniOf: DIPLOME.documente
      .filter((d) => d.titlu.startsWith("Formare completă"))
      .map((d) => ({ "@type": "Organization", name: d.emitent })),
  };
  const dateStructurate: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: descriere,
      image: post.coverImage
        ? { "@type": "ImageObject", url: `${SITE.url}${post.coverImage}`, caption: post.title }
        : `${SITE.url}/blog/${post.slug}/opengraph-image`,
      datePublished: post.publishedAt?.toISOString(),
      dateModified: post.updatedAt.toISOString(),
      mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
      author: autor,
      publisher: { "@id": `${SITE.url}/#cabinet` },
      inLanguage: "ro-RO",
      wordCount: cuvinte,
      isAccessibleForFree: true,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: SITE.url },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE.url}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: `${SITE.url}/blog/${post.slug}` },
      ],
    },
  ];
  if (faq.length) {
    dateStructurate.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

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
                  alt={post.title}
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
            <AutorArticol />
          </div>

          <div className="mx-auto mt-12 max-w-4xl px-6 lg:px-10">
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

        {similare.length > 0 && (
          <section aria-labelledby="articole-similare" className="bg-cream-deep py-16 lg:py-20">
            <div className="mx-auto max-w-5xl px-6 lg:px-10">
              <h2 id="articole-similare" className="font-display text-[1.7rem] text-ink lg:text-[2rem]">
                Articole similare
              </h2>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {similare.map((p) => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex flex-col bg-cream transition-colors hover:bg-cream-warm">
                    {p.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.coverImage} alt={p.title} loading="lazy" className="aspect-[16/10] w-full object-cover" />
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <p className="font-display text-[1.15rem] leading-snug text-ink group-hover:text-sage">{p.title}</p>
                      <p className="mt-2 line-clamp-3 font-sans text-[0.86rem] leading-relaxed text-ink-soft">{p.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
      {/* Articolul, descris pentru Google și pentru motoarele cu AI: autor cu
          atestate, date, imagine, firul de navigare și întrebările frecvente */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dateStructurate).replace(/</g, "\\u003c") }}
      />
    </>
  );
}

export const dynamic = "force-dynamic";
