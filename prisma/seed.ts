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

/* Prețurile sunt în bani: 28000 = 280 lei.
   Ședința standard e 280, evaluările clinice 500, atelierul experiențial 250.
   Se schimbă aici și se aplică rulând din nou `npm run db:seed` (actualizează
   după slug, fără să creeze duplicate). */
const SERVICES = [
  {
    slug: "psihoterapie-adult",
    name: "Psihoterapie individuală pentru adulți",
    duration: 50,
    price: 28000,
    position: 1,
    description:
      "Ședință individuală de psihoterapie integrativă pentru adulți.",
  },
  {
    slug: "terapie-copil",
    name: "Psihoterapie pentru adolescent și preadolescent",
    duration: 50,
    price: 28000,
    position: 2,
    description:
      "Ședință individuală de psihoterapie pentru preadolescenți și adolescenți.",
  },
  {
    slug: "consiliere-parentala",
    name: "Consiliere parentală",
    duration: 50,
    price: 28000,
    position: 3,
    description: "Întâlnire dedicată părinților, despre relația cu copilul.",
  },
  {
    slug: "evaluare-copil",
    name: "Evaluare clinică psihologică pentru copii și adolescenți",
    duration: 90,
    price: 50000,
    position: 4,
    description:
      "Evaluarea dezvoltării emoționale și comportamentale, ADHD, dificultăți de învățare.",
  },
  {
    slug: "evaluare-adult",
    name: "Evaluare clinică psihologică pentru adulți",
    duration: 90,
    price: 50000,
    position: 5,
    description:
      "Evaluare pentru anxietate, depresie, tulburări afective și de personalitate.",
  },
  {
    slug: "atelier-sandtray",
    name: "Atelier experiențial (Sandtray)",
    duration: 90,
    price: 25000,
    position: 6,
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
      update: { name: s.name, duration: s.duration, price: s.price, position: s.position, description: s.description },
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

  await seedProgramator();

  console.log("\nGata.");
}

/* ------------------------------------------------- Programatorul cabinetelor
   Oamenii și cabinetele din vechiul programator de pe therapy-home.ro. Se
   creează o singură dată; după aceea se administrează din programator
   („Oameni și cabinete"), iar seed-ul nu mai atinge nimic.

   Diana și Liliana sunt psihologii centrului: cabinetele 2 și 4 sunt ale lor
   de luni până joi și libere de vineri până duminică. Cabinetele 1 și 3 sunt
   libere toată săptămâna. Ceilalți închiriază.                              */
const CAB_PEOPLE = [
  { name: "Liliana Jgheban", initials: "LJ", color: "#9ED8F0", kind: "CENTRU", manager: true, active: true },
  { name: "Diana Șorop", initials: "DS", color: "#BFE3C0", kind: "CENTRU", manager: true, active: true },
  { name: "Elena Praz", initials: "EP", color: "#F4B6C2", kind: "CHIRIAS", manager: false, active: true },
  { name: "Dana Ghindar", initials: "DG", color: "#D9C6F0", kind: "CHIRIAS", manager: false, active: true },
  { name: "Anca Butuc", initials: "AB", color: "#F7E3A1", kind: "CHIRIAS", manager: false, active: true },
  { name: "Camelia Buligoanea", initials: "CB", color: "#F6C6A8", kind: "CHIRIAS", manager: false, active: true },
  { name: "Mihaela Mihai", initials: "MM", color: "#A9D3C9", kind: "CHIRIAS", manager: false, active: true },
  { name: "Roxana Acojocaritei", initials: "RA", color: "#C9D6EA", kind: "CHIRIAS", manager: false, active: false },
  { name: "Teodora Ghiur", initials: "TG", color: "#E8C9A0", kind: "CHIRIAS", manager: false, active: false },
];

const CAB_ROOMS = [
  { name: "Cabinet 1", owner: null, days: "" },
  { name: "Cabinet 2", owner: "Diana Șorop", days: "1,2,3,4" },
  { name: "Cabinet 3", owner: null, days: "" },
  { name: "Cabinet 4", owner: "Liliana Jgheban", days: "1,2,3,4" },
];

async function seedProgramator() {
  if ((await db.cabPerson.count()) === 0) {
    for (const [position, p] of CAB_PEOPLE.entries()) {
      await db.cabPerson.create({ data: { ...p, position } });
    }
    console.log(`  programator: ${CAB_PEOPLE.length} oameni`);
  }

  if ((await db.cabRoom.count()) === 0) {
    for (const [i, r] of CAB_ROOMS.entries()) {
      const owner = r.owner ? await db.cabPerson.findFirst({ where: { name: r.owner } }) : null;
      await db.cabRoom.create({
        data: {
          name: r.name,
          position: i + 1,
          ownerId: owner?.id ?? null,
          ownerWeekdays: owner ? r.days : "",
        },
      });
    }
    console.log(`  programator: ${CAB_ROOMS.length} cabinete`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
