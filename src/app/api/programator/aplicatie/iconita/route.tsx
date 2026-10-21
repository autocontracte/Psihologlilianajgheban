import { ImageResponse } from "next/og";

/* Iconița aplicației: o filă de calendar în culorile Lilianei. `m=1` e
   varianta „maskable": desenul stă în zona sigură, ca Android să o poată
   decupa rotund sau pătrat fără să taie din el. */

const VERDE = "#6e8567";
const CREM = "#f3f4ee";
const CERNEALA = "#363c45";

export function GET(request: Request) {
  const url = new URL(request.url);
  const s = url.searchParams.get("s") === "192" ? 192 : url.searchParams.get("s") === "180" ? 180 : 512;
  const maskable = url.searchParams.get("m") === "1";
  const card = Math.round(s * (maskable ? 0.56 : 0.72));
  const u = card / 100;

  return new ImageResponse(
    (
      <div
        style={{
          width: s,
          height: s,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: VERDE,
          borderRadius: maskable ? 0 : s * 0.22,
        }}
      >
        <div
          style={{
            width: card,
            height: card,
            display: "flex",
            flexDirection: "column",
            background: CREM,
            borderRadius: 16 * u,
            overflow: "hidden",
          }}
        >
          <div style={{ height: 26 * u, background: CERNEALA, display: "flex" }} />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexWrap: "wrap",
              alignContent: "center",
              justifyContent: "center",
              gap: 6 * u,
              padding: 8 * u,
            }}
          >
            {Array.from({ length: 9 }, (_, i) => (
              <div
                key={i}
                style={{
                  width: 18 * u,
                  height: 13 * u,
                  borderRadius: 3 * u,
                  background: i === 4 ? VERDE : "#dce0d4",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    { width: s, height: s, headers: { "Cache-Control": "public, max-age=86400" } },
  );
}
