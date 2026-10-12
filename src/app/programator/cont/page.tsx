import Link from "next/link";
import { redirect } from "next/navigation";
import { ParolaForm } from "@/components/programator/ParolaForm";
import { getProgUser } from "@/lib/programator/auth";

export default async function ContPage() {
  const user = await getProgUser();
  if (!user) redirect("/intra");
  if (!user.personId) redirect("/");

  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <Link href="/" className="font-sans text-[0.9rem] text-periwinkle underline underline-offset-4 hover:text-ink">
        ← Înapoi la grilă
      </Link>
      <h1 className="mt-6 font-display text-3xl text-ink">Parola mea</h1>
      <p className="mt-2 font-sans text-[0.95rem] text-ink-soft">{user.name}</p>
      <div className="mt-7 bg-cream-warm p-7">
        <ParolaForm />
      </div>
    </main>
  );
}
