import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientIp } from "@/lib/request";
import { TRACK_TYPES } from "@/lib/urmarireTipuri";

/* ============================================================================
   Primește loturile mici de evenimente trimise de scriptul de urmărire
   (components/Urmaritor.tsx) și le scrie în baza de date.

   Ce NU se salvează: adresa IP (se folosește doar în memorie, ca să limităm
   cererile), cookie-uri, nimic din ce scrie vizitatorul. Vizita are un id
   aleator, care trăiește cât e deschisă fila browserului.

   Răspunsul e mereu gol (204): scriptul de urmărire nu are ce face cu el, iar
   o eroare aici nu trebuie să se vadă în niciun fel pe site.
   ========================================================================== */

type Corp = {
  visit?: string;
  ctx?: {
    ref?: string;
    src?: string;
    med?: string;
    camp?: string;
    land?: string;
    w?: number;
  };
  events?: { t?: string; d?: string; p?: string; ago?: number }[];
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ROBOT =
  /bot|crawl|spider|slurp|preview|lighthouse|headless|monitor|facebookexternalhit|whatsapp|telegram|curl|wget|python-requests/i;

/* Un vizitator obișnuit trimite câteva loturi pe minut; peste atât e altceva. */
const FEREASTRA_MS = 10 * 60 * 1000;
const MAX_LOTURI = 240;
const loturi = new Map<string, number[]>();

function preaMulte(ip: string): boolean {
  const acum = Date.now();
  const recente = (loturi.get(ip) ?? []).filter((t) => acum - t < FEREASTRA_MS);
  recente.push(acum);
  loturi.set(ip, recente);

  if (loturi.size > 5000) {
    for (const [k, t] of loturi) {
      if (t.every((x) => acum - x >= FEREASTRA_MS)) loturi.delete(k);
    }
  }
  return recente.length > MAX_LOTURI;
}

/* Câte evenimente păstrăm pentru o vizită. Un traseu normal are câteva zeci. */
const MAX_EVENIMENTE_PE_VIZITA = 600;
/** După cât timp se șterg vizitele vechi (curățenie, la întâmplare). */
const PASTREAZA_ZILE = 365;

const text = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

function dispozitiv(ua: string) {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tabletă";
  if (/mobi|iphone|android/i.test(ua)) return "telefon";
  return "calculator";
}

function navigator_(ua: string) {
  if (/edg\//i.test(ua)) return "Edge";
  if (/samsungbrowser/i.test(ua)) return "Samsung";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  return "";
}

/* Țara și orașul vin de la Cloudflare, care stă în fața site-ului. Nu sunt
   date despre persoană, ci despre cerere, și nu se păstrează adresa IP. */
function locul(req: Request) {
  const oras = req.headers.get("cf-ipcity") ?? "";
  let decodat = "";
  try {
    decodat = oras ? decodeURIComponent(oras) : "";
  } catch {
    decodat = oras;
  }
  return {
    country: text(req.headers.get("cf-ipcountry"), 4).toUpperCase().replace("XX", ""),
    city: text(decodat, 80),
  };
}

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || ROBOT.test(ua)) return new NextResponse(null, { status: 204 });
  if (preaMulte(clientIp(req))) return new NextResponse(null, { status: 429 });

  /* sendBeacon trimite text simplu, nu JSON cu antetul potrivit. */
  const corp = (await req
    .text()
    .then((t) => JSON.parse(t))
    .catch(() => ({}))) as Corp;

  const id = text(corp.visit, 36);
  if (!UUID.test(id)) return new NextResponse(null, { status: 400 });

  const acum = Date.now();
  const evenimente = (Array.isArray(corp.events) ? corp.events.slice(0, 40) : [])
    .map((e) => ({
      visitId: id,
      type: text(e.t, 30),
      path: text(e.p, 300),
      detail: text(e.d, 300),
      /* Momentul se reconstituie din „acum minus câte secunde”, ca să fie
         corect și pentru evenimentele trimise la plecarea de pe pagină. */
      at: new Date(acum - Math.min(Math.max(Number(e.ago) || 0, 0), 3600) * 1000),
    }))
    .filter((e) => (TRACK_TYPES as readonly string[]).includes(e.type));

  const pagini = evenimente.filter((e) => e.type === "pagina").length;
  const programat = evenimente.some((e) => e.type === "programare");

  try {
    const vizita = await db.visit.findUnique({
      where: { id },
      select: { events: true },
    });

    if (!vizita) {
      const c = corp.ctx ?? {};
      /* Dacă e autentificat, legăm vizita de cont — ca să se vadă în panou ce
         a făcut un client al cabinetului. Nimic altceva din cont nu se atinge. */
      const user = await getCurrentUser().catch(() => null);

      await db.visit.create({
        data: {
          id,
          referrer: text(c.ref, 200),
          source: text(c.src, 80),
          medium: text(c.med, 80),
          campaign: text(c.camp, 120),
          landing: text(c.land, 300) || "/",
          screenW: Number(c.w) > 0 ? Math.round(Number(c.w)) : null,
          device: dispozitiv(ua),
          browser: navigator_(ua),
          ...locul(req),
          userId: user?.id ?? null,
          pages: pagini,
          events: evenimente.length,
          booked: programat,
        },
      });

      if (evenimente.length) await db.visitEvent.createMany({ data: evenimente });
      await curatenie();
      return new NextResponse(null, { status: 204 });
    }

    await db.visit.update({
      where: { id },
      data: {
        lastSeenAt: new Date(acum),
        pages: { increment: pagini },
        events: { increment: evenimente.length },
        ...(programat ? { booked: true } : {}),
      },
    });

    if (evenimente.length && vizita.events < MAX_EVENIMENTE_PE_VIZITA) {
      await db.visitEvent.createMany({ data: evenimente });
    }
  } catch {
    /* Două loturi venite în același timp pot încerca să creeze vizita o dată
       fiecare, iar baza de date poate fi ocupată o clipă. Statisticile nu merită
       nicio eroare pe site: pierdem lotul și mergem înainte. */
  }

  return new NextResponse(null, { status: 204 });
}

/* Curățenie rară (la aproximativ una din 200 de vizite noi): vizitele mai
   vechi de un an se șterg, cu tot traseul lor (`onDelete: Cascade`). */
async function curatenie() {
  if (Math.random() > 0.005) return;
  const limita = new Date(Date.now() - PASTREAZA_ZILE * 86_400_000);
  await db.visit.deleteMany({ where: { startedAt: { lt: limita } } }).catch(() => {});
}
