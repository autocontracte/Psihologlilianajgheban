/* ============================================================================
   Adaugă (sau repară) un cont de administrator.

   Rulare:
     npx tsx scripts/adauga-admin.ts <email> ["Nume"] ["+40..."] [parola]

   Fără parolă în linia de comandă, scriptul generează una și o afișează o
   singură dată. Dacă contul există deja:
     • primește rol de ADMIN, dacă nu îl avea;
     • parola se schimbă numai dacă e dată în linia de comandă.

   Pe producție (vezi README): se copiază în /home/psiholog/app și se rulează
   ca utilizatorul `psiholog`, altfel Node nu găsește @prisma/client.
   ========================================================================== */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";

/* `tsx` nu încarcă .env singur, cum face CLI-ul Prisma. */
if (existsSync(".env")) process.loadEnvFile(".env");

const db = new PrismaClient();

/* Parolă ușor de citit și de tastat, dar imposibil de ghicit (~95 de biți). */
function parolaNoua() {
  return randomBytes(12).toString("base64url");
}

async function main() {
  const [emailArg, numeArg, telefonArg, parolaArg] = process.argv.slice(2);

  const email = (emailArg ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    console.error(
      'Lipsește emailul. Exemplu:\n  npx tsx scripts/adauga-admin.ts eu@exemplu.ro "Numele Meu" "+40700000000"',
    );
    process.exit(1);
  }

  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    const data: { role?: string; passwordHash?: string; name?: string; phone?: string } =
      {};
    if (existing.role !== "ADMIN") data.role = "ADMIN";
    if (numeArg) data.name = numeArg;
    if (telefonArg) data.phone = telefonArg;
    if (parolaArg) data.passwordHash = await bcrypt.hash(parolaArg, 12);

    if (Object.keys(data).length === 0) {
      console.log(`Contul ${email} e deja administrator. Nimic de schimbat.`);
      return;
    }

    await db.user.update({ where: { email }, data });
    console.log(`Contul ${email} a fost actualizat:`);
    if (data.role) console.log("  • are acum rol de ADMIN");
    if (data.name) console.log(`  • nume: ${data.name}`);
    if (data.phone) console.log(`  • telefon: ${data.phone}`);
    if (data.passwordHash) console.log("  • parola a fost schimbată cu cea dată");
    return;
  }

  const parola = parolaArg || parolaNoua();
  await db.user.create({
    data: {
      name: numeArg || email.split("@")[0],
      email,
      phone: telefonArg || "",
      passwordHash: await bcrypt.hash(parola, 12),
      role: "ADMIN",
    },
  });

  console.log("────────────────────────────────────────────");
  console.log(" CONT DE ADMINISTRATOR CREAT");
  console.log(` Email:  ${email}`);
  if (!parolaArg) console.log(` Parolă: ${parola}`);
  console.log(" Intri de la /cont/autentificare, apoi /admin.");
  console.log("────────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
