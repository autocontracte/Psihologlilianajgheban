/* Service worker-ul calendarului Lilianei. Nu ține nimic în memorie (ce e în
   calendar trebuie să fie mereu cel de pe server și din Google); doar arată o
   pagină clară când nu e internet, în loc de eroarea browserului. */

const OFFLINE = `<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fără internet</title></head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f3f4ee;color:#363c45;font-family:system-ui,sans-serif;text-align:center;padding:24px">
<div><p style="font-size:22px;font-weight:600;margin:0 0 8px">Nu ai internet</p><p style="font-size:17px;margin:0 0 24px;color:#5c626c">Calendarul arată mereu programările de pe site și din Google, deci are nevoie de conexiune.</p>
<button onclick="location.reload()" style="font-size:18px;padding:14px 28px;border:0;border-radius:999px;background:#6e8567;color:#f3f4ee">Încearcă din nou</button></div></body></html>`;

const SW = `
const OFFLINE = ${JSON.stringify(OFFLINE)};
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(
    fetch(e.request).catch(
      () => new Response(OFFLINE, { headers: { "Content-Type": "text/html; charset=utf-8" } }),
    ),
  );
});
`;

export function GET() {
  return new Response(SW, {
    headers: { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
