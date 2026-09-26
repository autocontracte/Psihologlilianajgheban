import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { SITE } from "@/content/site";

/* ----------------------------------------------------------------------------
   Miniaturile pentru linkuri (Open Graph): ce apare când cineva trimite un
   link pe WhatsApp, Facebook, LinkedIn sau în mesaje.

   Fiecare pagină își are fișierul `opengraph-image.tsx`, care cheamă
   `miniatura()` cu textul și fotografia ei. Aspectul e același peste tot,
   în identitatea cabinetului: crem, verde-salvie, Lora pentru titlu.

   Imaginea se desenează cu `next/og` (1200×630). Paginile statice o
   generează o singură dată, la build; articolele de blog, la prima cerere.
   -------------------------------------------------------------------------- */

export const OG_MARIME = { width: 1200, height: 630 };
export const OG_TIP = "image/png";

const RADACINA = process.cwd();

const C = {
  crem: "#f3f4ee",
  cremAdanc: "#e9ebe1",
  verde: "#6e8567",
  verdeInchis: "#46573f",
  nisip: "#a08b6f",
  cerneala: "#363c45",
  cernealaMoale: "#5c626c",
  cernealaStearsa: "#8b9098",
};

type Imagine = {
  /** Calea din `public`, de exemplu „/foto/liliana-portret-4.jpg”. */
  src: string;
  /** `cover` umple coloana (fotografii); `contain` o arată întreagă (mockup-uri). */
  potrivire?: "cover" | "contain";
  /** Poziția decupajului, pentru `cover` (de exemplu „50% 20%”, pe față). */
  pozitie?: string;
};

export type Miniatura = {
  eticheta: string;
  titlu: string;
  subtitlu?: string;
  imagine?: Imagine;
  /** Folosită dacă `imagine` nu se poate citi (de exemplu, coperta unui articol ștearsă). */
  rezerva?: Imagine;
};

const TIP_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

/** Octeții imaginii: din `public`, din `uploads/blog` (imaginile încărcate
    în articole, servite ca /blog-media/…) sau de pe web. */
async function citeste(src: string): Promise<{ bytes: Buffer; ext: string } | null> {
  if (/^https?:\/\//.test(src)) {
    const res = await fetch(src, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return { bytes: Buffer.from(await res.arrayBuffer()), ext: extname(new URL(src).pathname).toLowerCase() };
  }
  const relativ = decodeURIComponent(src.split("?")[0]).replace(/^\/+/, "");
  const [dir, rest] = relativ.startsWith("blog-media/")
    ? [join(RADACINA, "uploads", "blog"), relativ.slice("blog-media/".length)]
    : [join(RADACINA, "public"), relativ];
  const cale = join(dir, rest);
  if (!cale.startsWith(dir)) return null;
  return { bytes: await readFile(cale), ext: extname(cale).toLowerCase() };
}

/** Imaginea, ca data URL. Formatele pe care `next/og` nu le citește (webp,
    avif) trec prin sharp. Dacă nu se poate citi, întoarce null. */
async function dataUrl(src: string): Promise<string | null> {
  try {
    const fisier = await citeste(src);
    if (!fisier) return null;
    const { bytes } = fisier;
    const mime = TIP_MIME[fisier.ext];
    if (mime) return `data:${mime};base64,${bytes.toString("base64")}`;

    const sharp = (await import("sharp")).default;
    const png = await sharp(bytes).resize({ width: 1000, withoutEnlargement: true }).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

let fonturi: Promise<{ name: string; data: Buffer; weight: 400 | 600; style: "normal" }[]> | null = null;

function incarcaFonturi() {
  fonturi ??= Promise.all(
    (
      [
        ["Lora", "Lora-Regular.ttf", 400],
        ["Lora", "Lora-SemiBold.ttf", 600],
        ["Source Sans 3", "SourceSans3-Regular.ttf", 400],
        ["Source Sans 3", "SourceSans3-SemiBold.ttf", 600],
      ] as const
    ).map(async ([name, fisier, weight]) => ({
      name,
      data: await readFile(join(RADACINA, "ghiduri", "fonturi", fisier)),
      weight,
      style: "normal" as const,
    })),
  );
  return fonturi;
}

/** Titlurile lungi (articolele) se micșorează, ca să încapă pe trei rânduri. */
function marimeTitlu(titlu: string, cuImagine: boolean): number {
  const n = titlu.length;
  const baza = cuImagine ? 1 : 1.15;
  if (n <= 28) return 68 * baza;
  if (n <= 48) return 58 * baza;
  if (n <= 72) return 48 * baza;
  return 40 * baza;
}

export async function miniatura({ eticheta, titlu, subtitlu, imagine: ceruta, rezerva }: Miniatura) {
  const [fonts, logo, fotoCeruta] = await Promise.all([
    incarcaFonturi(),
    dataUrl("/og/logo.png"),
    ceruta ? dataUrl(ceruta.src) : Promise.resolve(null),
  ]);
  const [foto, imagine] =
    fotoCeruta || !rezerva ? [fotoCeruta, ceruta] : [await dataUrl(rezerva.src), rezerva];
  const cuImagine = Boolean(foto);
  const contain = imagine?.potrivire === "contain";
  const domeniu = SITE.url.replace(/^https?:\/\//, "");

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: C.crem, fontFamily: "Source Sans 3" }}>
        {/* Textul */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: cuImagine ? 700 : 1200,
            height: "100%",
            padding: "60px 64px 54px 72px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {logo && <img src={logo} width={58} height={48} alt="" />}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: "Lora", fontSize: 24, color: C.cerneala }}>{SITE.name}</span>
              <span style={{ fontSize: 15, letterSpacing: 2.5, color: C.cernealaStearsa, textTransform: "uppercase" }}>
                Cabinet individual de psihologie
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: C.verde,
              }}
            >
              {eticheta}
            </span>
            <span
              style={{
                marginTop: 18,
                fontFamily: "Lora",
                fontSize: marimeTitlu(titlu, cuImagine),
                lineHeight: 1.12,
                color: C.cerneala,
              }}
            >
              {titlu}
            </span>
            {subtitlu && (
              <span style={{ marginTop: 22, fontSize: 26, lineHeight: 1.4, color: C.cernealaMoale }}>{subtitlu}</span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 3, background: C.nisip }} />
            <span style={{ fontSize: 20, color: C.verde }}>{domeniu}</span>
          </div>
        </div>

        {/* Imaginea */}
        {foto && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 500,
              height: "100%",
              background: contain ? C.cremAdanc : C.verdeInchis,
              borderLeft: `6px solid ${C.nisip}`,
            }}
          >
            <img
              src={foto}
              alt=""
              width={contain ? 460 : 494}
              height={contain ? 560 : 630}
              style={{
                objectFit: contain ? "contain" : "cover",
                objectPosition: imagine?.pozitie ?? "50% 30%",
              }}
            />
          </div>
        )}
      </div>
    ),
    { ...OG_MARIME, fonts },
  );
}
