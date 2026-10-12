import { redirect } from "next/navigation";
import { Grila } from "@/components/programator/Grila";
import { getProgUser } from "@/lib/programator/auth";
import { week } from "@/lib/programator/date";

export default async function ProgramatorPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const user = await getProgUser();
  if (!user) redirect("/intra");

  const { s } = await searchParams;
  const data = await week(s ?? "");

  return (
    <Grila
      initial={data}
      me={{ personId: user.personId, name: user.name, manager: user.manager }}
    />
  );
}
