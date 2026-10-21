import { redirect } from "next/navigation";
import { AplicatieProgramator } from "@/components/programator/AplicatieProgramator";
import { getProgUser } from "@/lib/programator/auth";
import { month, week } from "@/lib/programator/date";

export default async function ProgramatorPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const user = await getProgUser();
  if (!user) redirect("/intra");

  const { s } = await searchParams;
  const [m, w] = await Promise.all([month(s ?? ""), week(s ?? "")]);

  return (
    <AplicatieProgramator
      initialMonth={m}
      initialWeek={w}
      me={{ personId: user.personId, name: user.name, manager: user.manager }}
    />
  );
}
