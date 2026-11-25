import type { CSSProperties } from "react";
import type { Parte } from "@/lib/ghid/parti";
import { Coperta, STILURI } from "./Coperta";
import s from "./carte3d.module.css";

/* Cartea 3D a unei părți: coperta desenată în cod, cu cotor, pagini și umbră.
   `interactiv` o face să se întoarcă spre cititor la hover (când e într-un link). */
export function Carte3D({
  parte,
  grosime = 22,
  rotatieY = -28,
  rotatieX = 6,
  interactiv = false,
  className = "",
  eticheta,
  titlu,
  motto,
  deschisa = false,
}: {
  parte: Parte;
  grosime?: number;
  rotatieY?: number;
  rotatieX?: number;
  interactiv?: boolean;
  className?: string;
  eticheta?: string;
  titlu?: string;
  motto?: string;
  /** Coperta pe hârtie deschisă (raportul personal). */
  deschisa?: boolean;
}) {
  const spate = deschisa ? "#d9d5c7" : (STILURI[parte.nr] ?? STILURI[1]).la;
  return (
    <div className={`${interactiv ? s.interactiv : ""} ${className}`} aria-hidden>
      <div className={`${s.scena} relative`}>
      <div className={s.umbra} />
      <div
        className={s.carte}
        style={{ "--t": `${grosime}px`, "--ry": `${rotatieY}deg`, "--rx": `${rotatieX}deg`, "--culoare-spate": spate } as CSSProperties}
      >
        <div className={s.spate} />
        <div className={s.cotor} />
        <div className={s.pagini} />
        <div className={s.sus} />
        <div className={s.fata}>
          <Coperta parte={parte} eticheta={eticheta} titlu={titlu} motto={motto} deschisa={deschisa} />
        </div>
      </div>
      </div>
    </div>
  );
}

/** Folosit de link-urile care conțin o carte interactivă. */
export const clasaInteractiv = s.interactiv;
