import { adminCalendar } from "@/lib/calendarApi";
import { stergeEveniment } from "@/lib/calendarLiliana";

/** DELETE — șterge din Google un eveniment pus de Liliana. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return adminCalendar(() => stergeEveniment(id));
}
