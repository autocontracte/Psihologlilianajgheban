import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientIp } from "@/lib/request";
import { TRACK_TYPES } from "@/lib/urmarireTipuri";

/* ============================================================================
   Primește loturile mici de evenimente trimise de scriptul de urmărire
   (components/Urmaritor.tsx) și le scrie în baza de date.

   Fără acordul pentru cookie-uri se salvează o vizită singuratică: niciun
   cookie, nicio adresă IP, nicio legătură cu alte vizite.

   Cu acord, lotul aduce și numărul din cookie-ul `lj_v`. Atunci vizita se
   leagă de un `Visitor` — se vede a câta vizită e, de unde a venit omul prima
   oară și după câte vizite s-a programat — și se păstrează și adresa IP.

   Răspunsul e mereu gol (204): scriptul de urmărire nu are ce face cu el, iar
   o eroare aici nu trebuie să se vadă în niciun fel pe site.
   ========================================================================== */

type Corp = {
  visit?: string;
  om?: string;
  acord?: string;
  ctx?: {
    ref?: string;
    src?: string;
    med?: string;
    camp?: string;
    land?: string;
    os?: string;
    w?: number;
    h?: number;
    sw?: number;
    sh?: number;
    lang?: string;
    tz?: string;
    conn?: string;
  };
  cifre?: {
    activ?: number;
    scroll?: number;
    clicuri?: number;
    erori?: number;
    lcp?: number;
    inp?: number;
    cls?: number;
    exit?: string;
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

const nr = (v: unknown, max: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : 0;
};

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

/* Țara, orașul și regiunea vin de la Cloudflare, care stă în fața site-ului.
   Orașul apare doar dacă e pornit „Add visitor location headers” în panoul
   Cloudflare (Rules → Settings → Managed Transforms). */
function locul(req: Request) {
  const zi = (antet: string, max: number) => {
    const brut = req.headers.get(antet) ?? "";
    try {
      return text(brut ? decodeURIComponent(brut) : "", max);
    } catch {
      return text(brut, max);
    }
  };
  return {
    country: text(req.headers.get("cf-ipcountry"), 4).toUpperCase().replace("XX", ""),
    city: zi("cf-ipcity", 80),
    region: zi("cf-region", 80),
  };
}

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || ROBOT.test(ua)) return new NextResponse(null, { status: 204 });

  const ip = clientIp(req);
  if (preaMulte(ip)) return new NextResponse(null, { status: 429 });

  /* sendBeacon trimite text simplu, nu JSON cu antetul potrivit. */
  const corp = (await req
    .text()
    .then((t) => JSON.parse(t))
    .catch(() => ({}))) as Corp;

  const id = text(corp.visit, 36);
  if (!UUID.test(id)) return new NextResponse(null, { status: 400 });

  const acord = corp.acord === "acceptat" || corp.acord === "refuzat" ? corp.acord : "";
  /* Numărul din cookie are sens doar cu acord; fără el îl ignorăm, chiar dacă
     ar veni din greșeală în lot. */
  const omId = acord === "acceptat" && UUID.test(text(corp.om, 36)) ? text(corp.om, 36) : null;

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

  const c = corp.cifre ?? {};
  const cifre = {
    activeSec: nr(c.activ, 12 * 3600),
    maxScroll: Math.min(nr(c.scroll, 100), 100),
    clicks: nr(c.clicuri, 10_000),
    errors: nr(c.erori, 10_000),
    lcp: nr(c.lcp, 120_000) || null,
    inp: nr(c.inp, 120_000) || null,
    cls: nr(c.cls, 100_000) || null,
    exitPath: text(c.exit, 300),
  };

  try {
    const vizita = await db.visit.findUnique({
      where: { id },
      select: { events: true, visitorId: true, booked: true, userId: true },
    });

    /* Cine e omul, dacă s-a autentificat. Îl căutăm doar la crearea vizitei
       sau cât timp încă nu știm de el — nu la fiecare lot. */
    const user =
      !vizita || !vizita.userId ? await getCurrentUser().catch(() => null) : null;

    /* Vizita se numără la om o singură dată: când o creăm, sau când omul
       acceptă cookie-urile pe parcurs și abia atunci o putem lega de el. */
    const vizitaNoua = !vizita || !vizita.visitorId;
    const om = omId ? await asiguraOmul(omId, corp, user?.id ?? null, vizitaNoua) : null;

    if (!vizita) {
      const ctx = corp.ctx ?? {};
      await db.visit.create({
        data: {
          id,
          referrer: text(ctx.ref, 200),
          source: text(ctx.src, 80),
          medium: text(ctx.med, 80),
          campaign: text(ctx.camp, 120),
          landing: text(ctx.land, 300) || "/",
          device: dispozitiv(ua),
          browser: navigator_(ua),
          os: text(ctx.os, 40),
          screenW: nr(ctx.sw, 20_000) || null,
          screenH: nr(ctx.sh, 20_000) || null,
          viewW: nr(ctx.w, 20_000) || null,
          viewH: nr(ctx.h, 20_000) || null,
          lang: text(ctx.lang, 20),
          timezone: text(ctx.tz, 60),
          connection: text(ctx.conn, 20),
          ...locul(req),
          consent: acord,
          /* Adresa IP se păstrează doar cu acord. */
          ip: acord === "acceptat" ? text(ip, 60) : "",
          userId: user?.id ?? null,
          visitorId: om?.id ?? null,
          visitNo: om?.visits ?? 1,
          pages: pagini,
          events: evenimente.length,
          booked: programat,
          ...cifre,
        },
      });

      if (evenimente.length) await db.visitEvent.createMany({ data: evenimente });
      await curatenie();
    } else {
      await db.visit.update({
        where: { id },
        data: {
          lastSeenAt: new Date(acum),
          pages: { increment: pagini },
          events: { increment: evenimente.length },
          ...(programat ? { booked: true } : {}),
          ...(acord ? { consent: acord } : {}),
          ...(acord === "acceptat" ? { ip: text(ip, 60) } : {}),
          ...(user?.id ? { userId: user.id } : {}),
          /* Acordul poate veni în timpul vizitei: de atunci se leagă de om. */
          ...(om && !vizita.visitorId ? { visitorId: om.id, visitNo: om.visits } : {}),
          ...cifre,
        },
      });

      if (evenimente.length && vizita.events < MAX_EVENIMENTE_PE_VIZITA) {
        await db.visitEvent.createMany({ data: evenimente });
      }
    }

    /* Prima programare a omului: de câte vizite a avut nevoie. */
    if (om && programat && !om.booked) {
      await db.visitor.update({
        where: { id: om.id },
        data: { booked: true, bookedAt: new Date(acum), visitsToBook: om.visits },
      });
    }
  } catch {
    /* Două loturi venite în același timp pot încerca să creeze vizita o dată
       fiecare, iar baza de date poate fi ocupată o clipă. Statisticile nu merită
       nicio eroare pe site: pierdem lotul și mergem înainte. */
  }

  return new NextResponse(null, { status: 204 });
}

/**
 * Omul din spatele cookie-ului: îl creăm la prima vizită cu acord, iar la
 * fiecare vizită nouă îi creștem numărul. Prima sursă rămâne cea de la început
 * — ea spune ce l-a adus pe site, chiar dacă s-a programat abia a treia oară.
 */
async function asiguraOmul(
  omId: string,
  corp: Corp,
  userId: string | null,
  vizitaNoua: boolean,
): Promise<{ id: string; visits: number; booked: boolean }> {
  const existent = await db.visitor.findUnique({
    where: { id: omId },
    select: { id: true, visits: true, booked: true, userId: true },
  });

  if (existent) {
    const vizite = existent.visits + (vizitaNoua ? 1 : 0);
    await db.visitor.update({
      where: { id: omId },
      data: {
        lastSeenAt: new Date(),
        ...(vizitaNoua ? { visits: { increment: 1 } } : {}),
        ...(userId && !existent.userId ? { userId } : {}),
      },
    });
    return { id: existent.id, visits: vizite, booked: existent.booked };
  }

  const ctx = corp.ctx ?? {};
  const creat = await db.visitor.create({
    data: {
      id: omId,
      visits: 1,
      firstReferrer: text(ctx.ref, 200),
      firstSource: text(ctx.src, 80),
      firstMedium: text(ctx.med, 80),
      firstCampaign: text(ctx.camp, 120),
      firstLanding: text(ctx.land, 300) || "/",
      userId,
    },
    select: { id: true, visits: true, booked: true },
  });
  return creat;
}

/* Curățenie rară (la aproximativ una din 200 de vizite noi): vizitele mai
   vechi de un an se șterg, cu tot traseul lor (`onDelete: Cascade`), iar
   oamenii fără nicio vizită rămasă dispar și ei. */
async function curatenie() {
  if (Math.random() > 0.005) return;
  const limita = new Date(Date.now() - PASTREAZA_ZILE * 86_400_000);
  await db.visit.deleteMany({ where: { startedAt: { lt: limita } } }).catch(() => {});
  await db.visitor
    .deleteMany({ where: { lastSeenAt: { lt: limita }, visitList: { none: {} } } })
    .catch(() => {});
}
