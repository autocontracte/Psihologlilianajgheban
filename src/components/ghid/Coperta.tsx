import type { Parte } from "@/lib/ghid/parti";

/* ----------------------------------------------------------------------------
   Coperta unei părți din ghid, desenată în cod (nu imagine), în identitatea
   ghidului: fundal închis, logo, titlu Lora, linie aurie, autoarea jos.
   Fiecare parte are nuanța și ilustrația ei. Dimensiunile textului sunt în
   unități de container (cqw), ca o copertă mică să arate la fel ca una mare.
   -------------------------------------------------------------------------- */

export type StilCoperta = { de: string; la: string; lumina: string; motto: string };

export const STILURI: Record<number, StilCoperta> = {
  1: { de: "#5b7353", la: "#2c3a29", lumina: "#9db58f", motto: "Înainte să hotărăști ceva, înțelege ce se întâmplă" },
  2: { de: "#56627a", la: "#262c3a", lumina: "#9fb0cc", motto: "Când despărțirea e pe masă" },
  3: { de: "#9a6450", la: "#4f2e24", lumina: "#e0ab92", motto: "Când vă despărțiți fără copii împreună" },
  4: { de: "#4d6e68", la: "#22352f", lumina: "#93c2b6", motto: "Ce trăiește copilul și ce îl protejează" },
  5: { de: "#8f7856", la: "#4a3c28", lumina: "#e0c79c", motto: "Cum rămâneți o echipă de părinți" },
  6: { de: "#6d566b", la: "#33263a", lumina: "#c9a7c6", motto: "Familii noi, cu copii din relații diferite" },
};

const AUR = "#d3b47a";

/** Ilustrații în linie, câte una pentru fiecare parte. viewBox 200×140. */
function Ilustratie({ nr, culoare }: { nr: number; culoare: string }) {
  const p = { fill: "none", stroke: culoare, strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (nr) {
    case 1: // două cercuri care încă se ating, cu un fir între ele
      return (
        <>
          <circle cx="82" cy="70" r="38" {...p} />
          <circle cx="118" cy="70" r="38" {...p} />
          <path d="M100 38 C 92 56, 108 84, 100 102" {...p} strokeDasharray="2 4" />
          <circle cx="100" cy="70" r="3" fill={culoare} />
        </>
      );
    case 2: // un drum care se desparte în două
      return (
        <>
          <path d="M100 138 L100 86 C100 66 70 56 46 30 L32 12" {...p} />
          <path d="M100 86 C100 66 130 56 154 30 L168 12" {...p} />
          <path d="M92 138 L92 90 M108 138 L108 90" {...p} strokeOpacity={0.45} />
          <circle cx="100" cy="86" r="3.5" fill={culoare} />
        </>
      );
    case 3: // o ușă deschisă, cu lumină
      return (
        <>
          <path d="M70 128 L70 34 Q100 10 130 34 L130 128" {...p} />
          <path d="M70 128 L92 120 L92 40 Q96 30 102 26" {...p} strokeOpacity={0.6} />
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M112 ${60 + i * 12} L${150 + i * 6} ${54 + i * 14}`} {...p} strokeOpacity={0.35} />
          ))}
          <path d="M40 128 L160 128" {...p} />
        </>
      );
    case 4: // doi părinți și copilul ocrotit între ei
      return (
        <>
          <path d="M40 128 C40 70 70 52 78 52" {...p} />
          <path d="M160 128 C160 70 130 52 122 52" {...p} />
          <circle cx="70" cy="40" r="12" {...p} />
          <circle cx="130" cy="40" r="12" {...p} />
          <circle cx="100" cy="84" r="9" {...p} />
          <path d="M84 128 C84 104 92 96 100 96 C108 96 116 104 116 128" {...p} />
          <path d="M58 92 Q100 70 142 92" {...p} strokeDasharray="2 4" />
        </>
      );
    case 5: // două case unite de un drum
      return (
        <>
          <path d="M22 110 L22 78 L46 58 L70 78 L70 110 Z" {...p} />
          <path d="M130 110 L130 78 L154 58 L178 78 L178 110 Z" {...p} />
          <path d="M40 110 L40 94 L52 94 L52 110 M148 110 L148 94 L160 94 L160 110" {...p} strokeOpacity={0.6} />
          <path d="M70 102 C96 82 104 122 130 102" {...p} strokeDasharray="2 5" />
          <circle cx="100" cy="102" r="4" fill={culoare} />
          <path d="M10 112 L190 112" {...p} />
        </>
      );
    default: // cercuri de mărimi diferite care se întrepătrund
      return (
        <>
          <circle cx="74" cy="66" r="32" {...p} />
          <circle cx="126" cy="66" r="32" {...p} />
          <circle cx="100" cy="102" r="18" {...p} />
          <circle cx="58" cy="108" r="12" {...p} strokeOpacity={0.6} />
          <circle cx="146" cy="110" r="10" {...p} strokeOpacity={0.6} />
          <circle cx="100" cy="66" r="3" fill={culoare} />
        </>
      );
  }
}

export function Coperta({
  parte,
  eticheta,
  titlu,
  motto,
  className = "",
  deschisa = false,
}: {
  parte: Parte;
  /** Textul mic de sus; implicit „Ghid practic · Partea N”. */
  eticheta?: string;
  titlu?: string;
  motto?: string;
  className?: string;
  /** Varianta pe hârtie deschisă la culoare, pentru raportul personal. */
  deschisa?: boolean;
}) {
  const s0 = STILURI[parte.nr] ?? STILURI[1];
  const s: StilCoperta = deschisa ? { de: "#fbfaf5", la: "#e9e6da", lumina: s0.de, motto: s0.motto } : s0;
  const text = deschisa ? "#363c45" : "#f6f5ef";
  const slab = deschisa ? "rgba(54,60,69,0.62)" : "rgba(255,255,255,0.7)";
  return (
    <div
      className={`relative h-full w-full overflow-hidden [container-type:inline-size] ${className}`}
      style={{ background: `linear-gradient(160deg, ${s.de} 0%, ${s.la} 100%)` }}
    >
      {/* lumina din colț și granulația hârtiei */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: `radial-gradient(120% 70% at 18% 8%, ${s.lumina}55 0%, transparent 60%)` }}
      />
      <div aria-hidden className="grain absolute inset-0 opacity-60" />

      {/* cifra mare, discretă */}
      <span
        aria-hidden
        className={`absolute -right-[4cqw] top-[22cqw] font-display leading-none ${deschisa ? "text-ink/[0.05]" : "text-white/[0.06]"}`}
        style={{ fontSize: "62cqw" }}
      >
        {parte.nr}
      </span>

      <div className={`absolute inset-[3.2cqw] border ${deschisa ? "border-ink/10" : "border-white/15"}`} />

      <div className="relative flex h-full flex-col items-center px-[9cqw] pb-[8cqw] pt-[9cqw] text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={deschisa ? "/logo.svg" : "/logo-deschis.svg"} alt="" className="h-auto w-[30cqw] -my-[5cqw]" />

        <p className="mt-[9cqw] font-sans uppercase" style={{ fontSize: "2.7cqw", letterSpacing: "0.28em", color: slab }}>
          {eticheta ?? `Ghid practic · Partea ${parte.nr}`}
        </p>
        <p className="mt-[3cqw] max-w-full font-display leading-[1.08]" style={{ fontSize: "9.4cqw", color: text }}>
          {titlu ?? parte.titlu}
        </p>
        <span className="mt-[4.5cqw] block h-px w-[14cqw]" style={{ background: AUR }} />
        <p className="mt-[4cqw] max-w-[70cqw] font-display italic leading-snug" style={{ fontSize: "4.4cqw", color: slab }}>
          {motto ?? s.motto}
        </p>

        <svg viewBox="0 0 200 140" className="mt-auto w-[64cqw] opacity-80" aria-hidden>
          <Ilustratie nr={parte.nr} culoare={s.lumina} />
        </svg>

        <p className="mt-[6cqw] font-display" style={{ fontSize: "4.2cqw", color: text }}>
          Liliana Jgheban
        </p>
        <p className="mt-[1cqw] font-sans uppercase" style={{ fontSize: "2.2cqw", letterSpacing: "0.24em", color: slab }}>
          Cabinet individual de psihologie
        </p>
      </div>
    </div>
  );
}
