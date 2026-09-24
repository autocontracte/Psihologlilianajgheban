import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { articolePublicate } from "@/lib/blog";
import { formatDateLong } from "@/lib/tz";
import { Lumina } from "@/components/ui/Lumina";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articole despre psihoterapie, relații, parenting și dezvoltare personală, scrise de psiholog Liliana Jgheban.",
};

export default async function BlogPage() {
  const posts = await articolePublicate();

  return (
    <>
      <Nav />
      <main>
        <Lumina din="dreapta" />
        <section className="grain relative overflow-hidden bg-cream pt-40 pb-16 lg:pt-48 lg:pb-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 -top-20 h-[30rem] w-[30rem] bg-sage-pale/60 blur-3xl"
          />
          <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-10">
            <Reveal>
              <span className="inline-flex bg-periwinkle-pale px-5 py-2 font-sans text-[0.74rem] tracking-[0.02em] text-periwinkle">
                Blog
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-7 font-display text-4xl leading-[1.05] text-ink sm:text-6xl">
                Gânduri și <span className="italic text-sage">resurse</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="relative mx-auto mt-8 max-w-xl font-sans text-[0.95rem] leading-[1.9] text-ink-soft">
                Articole despre relații, emoții, parenting și pașii mărunți prin
                care ne îngrijim de noi. Scrise pe îndelete, fără grabă.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="bg-cream pb-24 lg:pb-32">
          <div className="relative mx-auto max-w-6xl px-6 lg:px-10">
            {posts.length === 0 ? (
              <p className="relative mx-auto max-w-md text-center font-sans text-[0.95rem] text-ink-soft">
                Primele articole apar în curând.
              </p>
            ) : (
              <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((p) => (
                  <StaggerItem key={p.slug}>
                    <Link href={`/blog/${p.slug}`} className="lift group block h-full border border-ink/8 bg-cream-warm">
                      <div className="relative aspect-[3/2] w-full overflow-hidden bg-cream-deep">
                        {p.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.coverImage}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-sage-pale">
                            <span className="mi text-sage" style={{ fontSize: "2rem" }} aria-hidden="true">article</span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        {p.publishedAt && (
                          <p className="font-sans text-[0.75rem] tracking-[0.02em] text-ink-muted">
                            {formatDateLong(p.publishedAt)}
                          </p>
                        )}
                        <h2 className="mt-2 font-display text-[1.3rem] leading-snug text-ink transition-colors group-hover:text-sage">
                          {p.title}
                        </h2>
                        {p.excerpt && (
                          <p className="mt-3 font-sans text-[0.86rem] leading-[1.8] text-ink-soft">
                            {p.excerpt}
                          </p>
                        )}
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export const dynamic = "force-dynamic";
