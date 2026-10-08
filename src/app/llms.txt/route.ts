import { ABOUT, DIPLOME, FAQ, PRICE, SERVICES, SITE } from "@/content/site";
import { articolePublicate } from "@/lib/blog";

/* /llms.txt: o descriere scurtă, în Markdown, a site-ului, pentru asistenții
   AI (ChatGPT, Perplexity, Claude…) care o citesc ca să răspundă corect despre
   cabinet. Se generează la fiecare cerere, ca să includă articolele noi. */

export const dynamic = "force-dynamic";

export async function GET() {
  if (!SITE.indexable) return new Response("Negăsit.", { status: 404 });
  const articole = await articolePublicate();
  const atestate = DIPLOME.documente.filter((d) => d.titlu.startsWith("Atestat"));
  const l: string[] = [];
  l.push(`# ${SITE.name}: ${SITE.role.replace("&", "și")} în ${SITE.city}`);
  l.push("");
  l.push(`> ${SITE.description}`);
  l.push("");
  l.push(ABOUT.paragraphs[0]);
  l.push("");
  l.push("## Date esențiale");
  l.push(`- Cabinet: ${SITE.address} (și ședințe online)`);
  l.push(`- Ședință de psihoterapie individuală: ${PRICE.standard} ${PRICE.currency}, 50 de minute`);
  l.push(`- Program: ${SITE.schedule.map((s) => `${s.days} ${s.hours}`).join("; ")}`);
  l.push(`- Telefon: ${SITE.phone} · Email: ${SITE.email}`);
  l.push(`- Programări online: ${SITE.url}/programari`);
  for (const a of atestate) l.push(`- ${a.titlu} (${a.emitent}, ${a.an})`);
  l.push("");
  l.push("## Servicii");
  for (const s of SERVICES.items) l.push(`- **${s.title}** (${s.audience}): ${s.description}`);
  l.push("");
  l.push("## Pagini");
  l.push(`- [Prima pagină](${SITE.url}/): servicii, despre Liliana, diplome, întrebări frecvente, contact`);
  l.push(`- [Programări](${SITE.url}/programari): alegi ziua și ora, în cabinet sau online`);
  l.push(`- [Blog](${SITE.url}/blog): articole despre psihoterapie, emoții și parenting`);
  l.push("");
  if (articole.length) {
    l.push("## Articole");
    for (const a of articole) l.push(`- [${a.title}](${SITE.url}/blog/${a.slug}): ${a.excerpt}`);
    l.push("");
  }
  l.push("## Întrebări frecvente");
  for (const f of FAQ.items) {
    l.push(`### ${f.q}`);
    l.push(f.a);
    l.push("");
  }
  return new Response(l.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
