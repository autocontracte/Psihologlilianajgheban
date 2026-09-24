/* ----------------------------------------------------------------------------
   Lumina: o lumină caldă, ca de la o fereastră, și două raze moi care cad în
   diagonală peste secțiune — ca soarele de dimineață în cabinet.

   Doar gradienți, fără blur și fără mișcare: nu obosesc privirea și nu
   încarcă pagina (sticla de deasupra nu trebuie recalculată).

   `varianta="noapte"` e pentru secțiunile închise: lumină salvie, raze abia
   vizibile. `din` alege colțul din care vine lumina.
   -------------------------------------------------------------------------- */

export function Lumina({
  varianta = "zi",
  din = "dreapta",
}: {
  varianta?: "zi" | "noapte";
  din?: "dreapta" | "stanga";
}) {
  const zi = varianta === "zi";
  const dreapta = din === "dreapta";

  const sursa = zi ? "rgba(255, 242, 214, 0.85)" : "color-mix(in srgb, var(--color-periwinkle) 26%, transparent)";
  const raza = zi ? "rgba(255, 250, 236, 0.55)" : "rgba(243, 244, 238, 0.06)";
  const raza2 = zi ? "rgba(255, 247, 226, 0.35)" : "rgba(243, 244, 238, 0.04)";

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Sursa de lumină, în colț */}
      <div
        className={`absolute -top-48 h-[48rem] w-[48rem] ${dreapta ? "-right-48" : "-left-48"}`}
        style={{ background: `radial-gradient(closest-side, ${sursa}, transparent)` }}
      />
      {/* Razele — benzi lungi, estompate pe margini, înclinate dinspre sursă */}
      <div
        className={`absolute -top-1/4 h-[150%] w-[16rem] ${dreapta ? "right-[18%] rotate-[28deg]" : "left-[18%] -rotate-[28deg]"}`}
        style={{ background: `linear-gradient(90deg, transparent, ${raza}, transparent)` }}
      />
      <div
        className={`absolute -top-1/4 h-[150%] w-[9rem] ${dreapta ? "right-[34%] rotate-[28deg]" : "left-[34%] -rotate-[28deg]"}`}
        style={{ background: `linear-gradient(90deg, transparent, ${raza2}, transparent)` }}
      />
    </div>
  );
}
