"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* Așteaptă interpretarea personală: o pornește dacă lipsește (plasa de
   siguranță), întreabă din 4 în 4 secunde dacă e gata și reîncarcă pagina
   când e. Dacă generarea pică, mai încearcă de două ori. */
export function StareInterpretare({ token, activa }: { token: string; activa: boolean }) {
  const router = useRouter();
  const [esuat, setEsuat] = useState(false);
  const incercari = useRef(0);

  useEffect(() => {
    if (!activa) return;
    let oprit = false;
    let timer: ReturnType<typeof setTimeout>;

    async function porneste() {
      incercari.current += 1;
      await fetch(`/api/kit/${token}/interpretare`, { method: "POST" }).catch(() => {});
    }

    async function verifica() {
      if (oprit) return;
      try {
        const res = await fetch(`/api/kit/${token}/interpretare`, { cache: "no-store" });
        const { stare } = await res.json();
        if (stare === "gata") {
          router.refresh();
          return;
        }
        if (stare === "lipsa") {
          if (incercari.current >= 3) {
            setEsuat(true);
            return;
          }
          await porneste();
        }
      } catch {
        /* rețea — reîncercăm la următorul pas */
      }
      timer = setTimeout(verifica, 4000);
    }

    porneste().then(() => (timer = setTimeout(verifica, 3000)));
    return () => {
      oprit = true;
      clearTimeout(timer);
    };
  }, [token, activa, router]);

  if (!activa || esuat) {
    return (
      <div className="glass p-8 text-center">
        <h2 className="font-display text-[1.4rem] text-ink">Interpretarea personală întârzie</h2>
        <p className="mx-auto mt-2 max-w-md font-sans text-[0.9rem] leading-relaxed text-ink-soft">
          Scorurile tale și ghidul sunt deja aici. Interpretarea detaliată o pregătim cât de curând; reîncarcă pagina
          peste câteva minute sau revino din linkul primit pe email.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-strong p-8 text-center sm:p-10" role="status" aria-live="polite">
      <div className="mx-auto flex w-fit gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 animate-pulse bg-periwinkle"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      <h2 className="mt-5 font-display text-[1.5rem] text-ink">Interpretarea ta se scrie acum</h2>
      <p className="mx-auto mt-2 max-w-md font-sans text-[0.9rem] leading-relaxed text-ink-soft">
        Pornim de la cele 30 de răspunsuri ale tale și de la ghidul Lilianei. Durează în jur de un minut; pagina se
        actualizează singură. Până atunci, poți citi scorurile de mai sus.
      </p>
    </div>
  );
}
