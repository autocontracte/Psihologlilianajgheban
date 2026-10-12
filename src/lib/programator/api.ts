import "server-only";

import { NextResponse } from "next/server";
import { getProgUser, type ProgUser } from "./auth";
import { ProgError } from "./date";

type Handler = (user: ProgUser, body: Record<string, unknown>) => Promise<unknown>;

/**
 * Învelișul comun al rutelor programatorului: cere autentificare (și, la
 * nevoie, drept de administrare), citește corpul JSON și transformă erorile
 * de regulă (`ProgError`) în răspunsuri cu mesaj.
 */
export async function progRoute(
  request: Request,
  handler: Handler,
  opts: { manager?: boolean } = {},
): Promise<NextResponse> {
  const user = await getProgUser();
  if (!user) return NextResponse.json({ error: "Autentifică-te din nou." }, { status: 401 });
  if (opts.manager && !user.manager) {
    return NextResponse.json({ error: "Doar administratorii pot face asta." }, { status: 403 });
  }

  let body: Record<string, unknown> = {};
  if (request.method !== "GET" && request.method !== "DELETE") {
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
    }
  }

  try {
    return NextResponse.json((await handler(user, body)) ?? { ok: true });
  } catch (err) {
    if (err instanceof ProgError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[programator]", err);
    return NextResponse.json({ error: "A apărut o eroare. Încearcă din nou." }, { status: 500 });
  }
}
