import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Situatie } from "@/components/programator/Situatie";
import { getProgUser } from "@/lib/programator/auth";
import { CANCEL_FEE, CANCEL_FREE_HOURS } from "@/lib/programator/reguli";
import { currentMonth, shiftMonth, situatie, validMonth } from "@/lib/programator/situatie";

const LUNI = [
  "ianuarie",
  "februarie",
  "martie",
  "aprilie",
  "mai",
  "iunie",
  "iulie",
  "august",
  "septembrie",
  "octombrie",
  "noiembrie",
  "decembrie",
];

const sageata =
  "flex h-11 w-11 items-center justify-center border border-ink/20 bg-cream-warm text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream";

export default async function SituatiePage({
  searchParams,
}: {
  searchParams: Promise<{ luna?: string }>;
}) {
  const user = await getProgUser();
  if (!user) redirect("/intra");
  if (!user.manager) redirect("/");

  const { luna } = await searchParams;
  const now = currentMonth();
  const month = validMonth(luna) ? luna : now;
  const rows = await situatie(month);
  const [y, m] = month.split("-").map(Number);
  const label = `${LUNI[m - 1]} ${y}`;

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <Link
        href="/"
        className="font-sans text-[0.9rem] text-periwinkle underline underline-offset-4 hover:text-ink print:hidden"
      >
        ← Înapoi la grilă
      </Link>
      <h1 className="mt-6 font-display text-3xl text-ink">Situație lunară</h1>
      <p className="mt-2 max-w-2xl font-sans text-[0.95rem] leading-relaxed text-ink-soft">
        Orele rezervate de chiriași și ședințele anulate cu mai puțin de {CANCEL_FREE_HOURS} de ore înainte, care se
        plătesc {CANCEL_FEE}%. Ședințele anulate din timp nu apar: nu se plătesc.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-2">
        <Link href={`/situatie?luna=${shiftMonth(month, -1)}`} aria-label="Luna trecută" className={`${sageata} print:hidden`}>
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <strong className="min-w-[11rem] px-2 text-center font-display text-2xl font-semibold text-ink first-letter:uppercase">
          {label}
        </strong>
        <Link href={`/situatie?luna=${shiftMonth(month, 1)}`} aria-label="Luna viitoare" className={`${sageata} print:hidden`}>
          <ChevronRight className="h-5 w-5" />
        </Link>
        {month !== now && (
          <Link
            href="/situatie"
            className="ml-1 inline-flex h-11 items-center border border-ink/20 bg-cream-warm px-4 font-sans text-[0.9rem] text-ink transition-colors hover:border-ink print:hidden"
          >
            Luna curentă
          </Link>
        )}
      </div>

      <Situatie rows={rows} monthLabel={label} />
    </main>
  );
}
