import { NextResponse, type NextRequest } from "next/server";

/* ----------------------------------------------------------------------------
   Programatorul intern al cabinetelor stă în aceeași aplicație, dar se vede
   doar pe subdomeniul lui: programator.psihologlilianajgheban.ro.

   - pe subdomeniu, adresele curate („/", „/intra", „/oameni") sunt servite din
     folderul /programator, iar restul site-ului nu există;
   - pe site-ul principal, /programator și API-ul lui nu există.
   -------------------------------------------------------------------------- */

const PAGES = "/programator";
const API = "/api/programator";

function under(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function middleware(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").toLowerCase();
  const { pathname } = request.nextUrl;
  const onProgramator = host.startsWith("programator.");

  if (!onProgramator) {
    if (under(pathname, API)) return new NextResponse(null, { status: 404 });
    if (under(pathname, PAGES)) {
      return NextResponse.rewrite(new URL("/pagina-inexistenta", request.url), { status: 404 });
    }
    return NextResponse.next();
  }

  // unealtă internă: nu are ce căuta în motoarele de căutare
  if (pathname === "/robots.txt") {
    return new NextResponse("User-agent: *\nDisallow: /\n", {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (pathname.startsWith("/api/")) {
    return under(pathname, API) ? NextResponse.next() : new NextResponse(null, { status: 404 });
  }

  // fișierele statice din /public (logo, fonturi, iconițe)
  if (/\.[a-z0-9]+$/i.test(pathname)) return NextResponse.next();

  if (under(pathname, PAGES)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(PAGES.length) || "/";
    return NextResponse.redirect(url);
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? PAGES : `${PAGES}${pathname}`;
  const response = NextResponse.rewrite(url);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/((?!_next/).*)"],
};
