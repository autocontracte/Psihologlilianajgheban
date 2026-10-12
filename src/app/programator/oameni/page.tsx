import Link from "next/link";
import { redirect } from "next/navigation";
import { OameniSiCabinete } from "@/components/programator/OameniSiCabinete";
import { getProgUser } from "@/lib/programator/auth";
import { rooms } from "@/lib/programator/date";
import { peopleAdmin } from "@/lib/programator/oameni";

export default async function OameniPage() {
  const user = await getProgUser();
  if (!user) redirect("/intra");
  if (!user.manager) redirect("/");

  const [people, roomList] = await Promise.all([peopleAdmin(), rooms()]);

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <Link href="/" className="font-sans text-[0.9rem] text-periwinkle underline underline-offset-4 hover:text-ink">
        ← Înapoi la grilă
      </Link>
      <h1 className="mt-6 font-display text-3xl text-ink">Oameni și cabinete</h1>
      <OameniSiCabinete people={people} rooms={roomList} myId={user.personId} />
    </main>
  );
}
