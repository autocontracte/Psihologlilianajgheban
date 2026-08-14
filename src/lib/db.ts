import { PrismaClient } from "@prisma/client";

/* În dezvoltare, Next reîncarcă modulele la fiecare modificare. Fără acest
   singleton s-ar deschide o conexiune nouă de fiecare dată. */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
