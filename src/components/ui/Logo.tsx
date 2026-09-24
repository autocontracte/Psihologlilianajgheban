import Image from "next/image";

/**
 * Logo-ul cabinetului: monograma „LJ", fără nume alături — așa a cerut
 * Liliana. `ton="deschis"` e varianta pentru fundalurile închise.
 */
export function Logo({
  ton = "inchis",
  marime = 52,
  className = "",
}: {
  ton?: "inchis" | "deschis";
  marime?: number;
  className?: string;
}) {
  return (
    <Image
      src={ton === "deschis" ? "/logo-deschis.svg" : "/logo.svg"}
      alt="Liliana Jgheban, psiholog și psihoterapeut"
      width={marime}
      height={marime}
      className={`shrink-0 ${className}`}
      style={{ width: marime, height: marime }}
      unoptimized
      priority
    />
  );
}
