/* Manifestul aplicației: cu el, Chrome pe Android oferă „Instalează aplicația"
   și programatorul se deschide pe tot ecranul, fără bara browserului. */

const ICON = "/api/programator/aplicatie/iconita";

export function GET() {
  return Response.json(
    {
      id: "/",
      name: "Programator cabinete — Therapy Home",
      short_name: "Programator",
      description: "Programările cabinetelor Therapy Home.",
      lang: "ro",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#f3f4ee",
      theme_color: "#f3f4ee",
      icons: [
        { src: `${ICON}?s=192`, sizes: "192x192", type: "image/png", purpose: "any" },
        { src: `${ICON}?s=512`, sizes: "512x512", type: "image/png", purpose: "any" },
        { src: `${ICON}?s=512&m=1`, sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json; charset=utf-8", "Cache-Control": "public, max-age=3600" } },
  );
}
