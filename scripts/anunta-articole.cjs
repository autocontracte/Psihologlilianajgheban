// Anunță prin IndexNow (Bing, Yandex, Seznam…) articolele care au apărut pe site
// în ultimele 25 de ore, inclusiv cele programate. Rulează zilnic din cron:
//   10 6 * * *  cd ~/app && set -a && . ./.env && set +a && node scripts/anunta-articole.cjs
// Cheia trebuie să fie aceeași cu INDEXNOW_CHEIE din src/lib/indexnow.ts.
const { PrismaClient } = require("@prisma/client");

const SITE = "https://psihologlilianajgheban.ro";
const CHEIE = "fe350f9e937ad888bc487f1cd5bf41eb";

async function main() {
  const db = new PrismaClient();
  try {
    const acum = new Date();
    const posts = await db.blogPost.findMany({
      where: { status: "PUBLISHED", publishedAt: { gt: new Date(acum.getTime() - 25 * 3600e3), lte: acum } },
      select: { slug: true },
    });
    if (!posts.length) return console.log("[indexnow] nimic nou");
    const urlList = [...posts.map((p) => `${SITE}/blog/${p.slug}`), `${SITE}/blog`, `${SITE}/llms.txt`];
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: new URL(SITE).host, key: CHEIE, keyLocation: `${SITE}/${CHEIE}.txt`, urlList }),
      signal: AbortSignal.timeout(15000),
    });
    console.log("[indexnow]", res.status, urlList.join(" "));
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => { console.error("[indexnow]", e.message || e); process.exitCode = 1; });
