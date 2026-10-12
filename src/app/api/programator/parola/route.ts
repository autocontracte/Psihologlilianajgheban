import { db } from "@/lib/db";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/auth";
import { progRoute } from "@/lib/programator/api";
import { ProgError } from "@/lib/programator/date";

/** Fiecare își schimbă singur parola primită de la administrator. */
export async function POST(request: Request) {
  return progRoute(request, async (user, b) => {
    if (!user.personId) {
      throw new ProgError("Parola contului de administrator se schimbă de pe site.");
    }
    const person = await db.cabPerson.findUnique({ where: { id: user.personId } });
    if (!person?.passwordHash || !(await verifyPassword(String(b.veche ?? ""), person.passwordHash))) {
      throw new ProgError("Parola actuală nu e corectă.");
    }
    const problem = passwordProblem(String(b.noua ?? ""));
    if (problem) throw new ProgError(problem);
    await db.cabPerson.update({
      where: { id: person.id },
      data: { passwordHash: await hashPassword(String(b.noua)) },
    });
  });
}
