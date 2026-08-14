/* Populează baza de date cu serviciile, programul săptămânal și contul de
   administrator. Rulare:  npm run db:seed
   Poate fi rulat de mai multe ori — nu creează duplicate.                    */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";

/* Comenzile `prisma` își încarcă singure fișierul .env, dar acest script rulează
   prin tsx, care nu o face. Fără asta, DATABASE_URL lipsește la conectare. */
if (existsSync(".env")) process.loadEnvFile(".env");

const db = new PrismaClient();

const SERVICES = [
  {
    slug: "psihoterapie-adult",
    name: "Psihoterapie individuală — adult",
    duration: 50,
    position: 1,
    description:
      "Ședință individuală de psihoterapie integrativă pentru adulți.",
  },
  {
    slug: "psihoterapie-adolescent",
    name: "Psihoterapie — adolescent",
    duration: 50,
    position: 2,
    description: "Ședință individuală pentru adolescenți și preadolescenți.",
  },
  {
    slug: "terapie-copil",
    name: "Terapie pentru copil",
    duration: 50,
    position: 3,
    description: "Ședință de terapie prin joc și metode potrivite vârstei.",
  },
  {
    slug: "consiliere-parentala",
    name: "Consiliere parentală",
    duration: 50,
    position: 4,
    description: "Întâlnire dedicată părinților, despre relația cu copilul.",
  },
  {
    slug: "evaluare-copil",
    name: "Evaluare clinică psihologică — copil / adolescent",
    duration: 90,
    position: 5,
    description:
      "Evaluarea dezvoltării emoționale și comportamentale, ADHD, dificultăți de învățare.",
  },
  {
    slug: "evaluare-adult",
    name: "Evaluare clinică psihologică — adult",
    duration: 90,
    position: 6,
    description:
      "Evaluare pentru anxietate, depresie, tulburări afective și de personalitate.",
  },
  {
    slug: "atelier-sandtray",
    name: "Atelier experiențial (Sandtray)",
    duration: 90,
    position: 7,
    description: "Intervenție experiențială cu nisip și miniaturi.",
  },
];

/* Program implicit: luni–vineri 10–20, sâmbătă 10–14. Se poate schimba
   oricând din panoul de administrare. */
const AVAILABILITY = [
  { weekday: 1, startTime: "10:00", endTime: "20:00" },
  { weekday: 2, startTime: "10:00", endTime: "20:00" },
  { weekday: 3, startTime: "10:00", endTime: "20:00" },
  { weekday: 4, startTime: "10:00", endTime: "20:00" },
  { weekday: 5, startTime: "10:00", endTime: "20:00" },
  { weekday: 6, startTime: "10:00", endTime: "14:00" },
];

async function main() {
  console.log("Se populează baza de date…\n");

  for (const s of SERVICES) {
    await db.service.upsert({
      where: { slug: s.slug },
      update: { name: s.name, duration: s.duration, position: s.position },
      create: s,
    });
  }
  console.log(`  ${SERVICES.length} servicii`);

  for (const a of AVAILABILITY) {
    await db.availability.upsert({
      where: {
        weekday_startTime_endTime: {
          weekday: a.weekday,
          startTime: a.startTime,
          endTime: a.endTime,
        },
      },
      update: {},
      create: a,
    });
  }
  console.log(`  ${AVAILABILITY.length} intervale în programul săptămânal`);

  // ---------------------------------------------------------- administrator
  const email = (process.env.ADMIN_EMAIL ?? "admin@psihologlilianajgheban.ro")
    .trim()
    .toLowerCase();

  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role !== "ADMIN") {
      await db.user.update({ where: { email }, data: { role: "ADMIN" } });
      console.log(`  contul ${email} a primit rol de administrator`);
    } else {
      console.log(`  administratorul ${email} există deja`);
    }
  } else {
    const password =
      process.env.ADMIN_PASSWORD ?? randomBytes(9).toString("base64url");

    await db.user.create({
      data: {
        name: process.env.ADMIN_NAME ?? "Liliana Jgheban",
        email,
        phone: process.env.ADMIN_PHONE ?? "+40764802536",
        passwordHash: await bcrypt.hash(password, 12),
        role: "ADMIN",
      },
    });

    console.log("\n  ────────────────────────────────────────────────");
    console.log("   CONT DE ADMINISTRATOR CREAT");
    console.log(`   Email: ${email}`);
    console.log(`   Parolă: ${password}`);
    console.log("   Notează parola acum și schimb-o după prima logare.");
    console.log("  ────────────────────────────────────────────────");
  }

  console.log("\nGata.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
