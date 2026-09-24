/**
 * Pete de culoare difuze în spatele cardurilor de sticlă. Fără ele, sticla ar
 * sta pe un fundal plat și n-ar avea ce să arate prin ea.
 *
 * Sunt gradienți radiali statici, nu forme încețoșate care se mișcă: sticla
 * (backdrop-filter) se recalculează la fiecare cadru în care ceva se mișcă în
 * spatele ei, iar cu pete animate pagina devenea atât de încărcată încât
 * cardurile apăreau cu secunde întârziere.
 *
 * `varianta` schimbă doar așezarea, ca secțiunile vecine să nu arate la fel.
 */
type Pata = { pozitie: string; marime: string; culoare: string; tarie: number };

const SALVIE = "var(--color-periwinkle)";
const SALVIE_DESCHIS = "var(--color-periwinkle-light)";
const NISIP = "var(--color-sage)";

const ASEZARI: Record<1 | 2 | 3, Pata[]> = {
  1: [
    { pozitie: "left-[-10rem] top-[8%]", marime: "h-[34rem] w-[34rem]", culoare: SALVIE, tarie: 30 },
    { pozitie: "right-[-8rem] top-[42%]", marime: "h-[30rem] w-[30rem]", culoare: NISIP, tarie: 30 },
    { pozitie: "left-[35%] bottom-[-8rem]", marime: "h-[26rem] w-[26rem]", culoare: SALVIE_DESCHIS, tarie: 25 },
  ],
  2: [
    { pozitie: "right-[-10rem] top-[4%]", marime: "h-[36rem] w-[36rem]", culoare: NISIP, tarie: 30 },
    { pozitie: "left-[-8rem] bottom-[8%]", marime: "h-[32rem] w-[32rem]", culoare: SALVIE, tarie: 28 },
  ],
  3: [
    { pozitie: "left-[8%] top-[-6rem]", marime: "h-[30rem] w-[30rem]", culoare: SALVIE, tarie: 28 },
    { pozitie: "right-[4%] bottom-[-6rem]", marime: "h-[32rem] w-[32rem]", culoare: NISIP, tarie: 28 },
  ],
};

export function Pete({ varianta = 1 }: { varianta?: 1 | 2 | 3 }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {ASEZARI[varianta].map((p) => (
        <span
          key={p.pozitie}
          className={`absolute ${p.pozitie} ${p.marime}`}
          style={{
            background: `radial-gradient(closest-side, color-mix(in srgb, ${p.culoare} ${p.tarie}%, transparent), transparent)`,
          }}
        />
      ))}
    </div>
  );
}
