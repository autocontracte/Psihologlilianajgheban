/* ----------------------------------------------------------------------------
   Rulează o singură dată, la pornirea serverului.

   Codul propriu-zis e în instrumentation-node.ts: Next compilează fișierul
   acesta și pentru runtime-ul edge, unde nodemailer și Prisma nu există.
   Condiția de mai jos e înlocuită la compilare, deci importul dispare cu
   totul din varianta edge.
   -------------------------------------------------------------------------- */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation-node");
  }
}
