"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { HERO, PRICE, PHOTOS } from "@/content/site";
import { IconArrow, IconClock, IconOffice, IconPrice, IconSend } from "../ui/Icons";
import { AnaFace } from "../ana/AnaFace";
import { AnaMesaje } from "../ana/AnaMesaje";
import { AntetAna, NotaAna, useAnaMood } from "../ana/Ana";
import { useAna } from "../ana/useAna";
import { useNavigheaza } from "../ana/useNavigheaza";

/* ----------------------------------------------------------------------------
   Hero-ul: cabinetul pe tot fundalul și Liliana în prim-plan, într-o ramă de sticlă.

   Parallax pe trei planuri, fiecare cu viteza lui la scroll:
     - fundalul (cabinetul) coboară încet — pare departe;
     - portretul urcă — pare aproape;
     - etichetele de sticlă urcă cel mai repede — sunt cele mai apropiate.
   Pe desktop, planurile se mai mișcă puțin și după mouse. Cu „mișcare redusă"
   activată, totul stă pe loc.

   Caseta de text are jos o bară în care îi poți scrie Anei. La prima literă,
   textul de prezentare se retrage și caseta devine chatul.
   -------------------------------------------------------------------------- */

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const m = reduce ? 0 : 1;
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", `${22 * m}%`]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.1 + 0.08 * m]);
  const portretY = useTransform(scrollYProgress, [0, 1], [0, -120 * m]);
  const chipY = useTransform(scrollYProgress, [0, 1], [0, -210 * m]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -50 * m]);

  // Mouse: -1…1 pe fiecare axă, netezit cu un arc ca să nu tremure
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 20, mass: 0.6 });
  const bgX = useTransform(sx, (v) => v * -14);
  const bgYm = useTransform(sy, (v) => v * -10);
  const portretX = useTransform(sx, (v) => v * 14);
  const portretYm = useTransform(sy, (v) => v * 10);
  const chipX = useTransform(sx, (v) => v * 26);

  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, mx, my]);

  return (
    <section
      ref={ref}
      id="acasa"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-cream-deep pt-24 lg:pb-24 lg:pt-28"
    >
      {/* Planul din spate: cabinetul, pe toată lățimea */}
      <motion.div aria-hidden style={{ x: bgX, y: bgYm }} className="pointer-events-none absolute inset-0">
        <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-0">
          <Image
            src={PHOTOS.heroFundal}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_40%] blur-[1.5px]"
          />
        </motion.div>
      </motion.div>

      {/* Voal cald: fundalul se estompează, ca Liliana și textul să iasă în față */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cream/75 via-cream/45 to-cream/80 lg:bg-gradient-to-r lg:from-cream/85 lg:via-cream/40 lg:to-cream/25"
      />

      <div className="relative z-[1] mx-auto grid w-full max-w-7xl items-center gap-8 px-4 pb-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,29rem)] lg:gap-16 lg:px-10 lg:pb-0 xl:grid-cols-[minmax(0,1fr)_minmax(0,31rem)]">
        {/* Liliana, în rama de sticlă (pe telefon, deasupra casetei) */}
        <motion.div
          style={{ y: portretY }}
          className="relative order-first mx-auto w-full max-w-[16rem] sm:max-w-[19rem] lg:order-last lg:max-w-none"
        >
          <motion.div style={{ x: portretX, y: portretYm }}>
            <Portret />
          </motion.div>

          {/* Etichete de sticlă, pe un plan și mai apropiat */}
          <motion.div
            style={{ y: chipY, x: chipX }}
            className="pointer-events-none absolute inset-0 hidden sm:block"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="glass-strong absolute -left-10 top-[16%] flex items-center gap-2.5 px-4 py-3 lg:-left-14"
            >
              <IconOffice className="h-5 w-5 text-periwinkle" />
              <span className="font-sans text-[0.88rem] text-ink">În cabinet și online</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
              className="glass-strong absolute -right-6 bottom-[12%] px-5 py-3.5 lg:-right-10"
            >
              <p className="font-display text-2xl leading-none text-ink">
                {PRICE.standard} {PRICE.currency}
              </p>
              <p className="mt-1.5 font-sans text-[0.78rem] text-ink-soft">ședința de 50 de minute</p>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: textY }} className="w-full">
          <CasetaHero />
        </motion.div>
      </div>
    </section>
  );
}

/** Fotografia Lilianei, în rama de sticlă. */
function Portret() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="glass p-2.5 sm:p-3"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={PHOTOS.heroPortret}
          alt="Liliana Jgheban, psiholog clinician și psihoterapeut integrativ în București"
          fill
          priority
          sizes="(max-width: 640px) 256px, (max-width: 1024px) 304px, 31rem"
          className="object-cover object-[50%_20%]"
        />
      </div>
    </motion.div>
  );
}

/* ----------------------------------------------------------------------------
   Coloana din stânga a hero-ului: prezentarea, iar dedesubt blocul Anei.

   Cât scrii în bara Anei nu se schimbă nimic — prezentarea rămâne. Când
   trimiți întrebarea, chatul apare printr-un fade peste toată coloana
   (prezentare + Ana), care își păstrează înălțimea, deci pagina nu sare.
   Cu ✕ chatul dispare și prezentarea e din nou acolo.
   -------------------------------------------------------------------------- */

const SUGESTII_HERO = ["Cât costă o ședință?", "Se poate și online?", "Cum decurge prima întâlnire?"];

function CasetaHero() {
  const { busy, gata, intrebari, ramase, trimite, turns } = useAna();
  const [chat, setChat] = useState(false);
  const [bara, setBara] = useState("");
  const [scris, setScris] = useState("");
  const [focus, setFocus] = useState(false);
  const listaRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const mood = useAnaMood(chat ? scris : bara);
  const navigheaza = useNavigheaza();
  const ease = [0.22, 1, 0.36, 1] as const;

  useEffect(() => {
    listaRef.current?.scrollTo({ top: listaRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy, chat]);

  useEffect(() => {
    if (!chat) return;
    const t = setTimeout(() => chatInputRef.current?.focus(), 350);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setChat(false);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [chat]);

  async function intreaba(text: string, deUnde: "bara" | "chat") {
    const q = text.trim();
    if (!q) return;
    setChat(true);
    if (deUnde === "bara") setBara("");
    else setScris("");
    const ok = await trimite(q);
    // dacă n-a mers, întrebarea rămâne în câmpul din chat, ca omul să o poată retrimite
    if (!ok) setScris(q);
  }

  return (
    <div className="relative">
      {/* Prezentarea */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.1, ease }}
        aria-hidden={chat || undefined}
        className="glass-strong px-6 pb-8 pt-7 sm:px-10 sm:pb-10 sm:pt-10 lg:!bg-white/45 lg:px-12 lg:pb-12 lg:pt-12"
      >
        {/* Titlul principal. Pentru Google se citește „Liliana Jgheban — Psiholog
            clinician și psihoterapeut integrativ în București" (numele întâi, apoi
            ce și unde); pe ecran rândul mic stă deasupra numelui. */}
        <h1 className="flex flex-col-reverse">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.4, ease }}
            className="mt-3 block font-display text-[2.5rem] font-medium leading-[1.05] tracking-tight text-periwinkle sm:text-6xl lg:text-[4rem]"
          >
            {HERO.name}
            <span className="sr-only">, </span>
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease }}
            className="block font-sans text-[0.98rem] font-medium text-ink"
          >
            {HERO.eyebrow}
          </motion.span>
        </h1>



        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.65, ease }}
          className="mt-6 hidden font-sans text-[1rem] leading-[1.8] text-ink-soft sm:block"
        >
          {HERO.intro}
        </motion.p>

        {/* Pe telefon etichetele de lângă portret nu încap — reperele stau aici */}
        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 sm:hidden">
          {[
            { Icon: IconPrice, text: `${PRICE.standard} ${PRICE.currency} / ședință` },
            { Icon: IconClock, text: "50 de minute" },
            { Icon: IconOffice, text: "În cabinet și online" },
          ].map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-2 font-sans text-[0.9rem] text-ink">
              <Icon className="h-5 w-5 text-periwinkle" />
              {text}
            </li>
          ))}
        </ul>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8, ease }}
          className="mt-7 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href={HERO.ctaPrimary.href}
            className="group inline-flex items-center justify-center gap-2.5 bg-periwinkle px-7 py-3.5 font-sans text-[0.95rem] text-cream shadow-[0_18px_40px_-18px_rgba(110,133,103,0.9)] transition-colors duration-400 hover:bg-ink"
          >
            {HERO.ctaPrimary.label}
            <IconArrow className="h-5 w-5 transition-transform duration-400 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </motion.div>

      {/* Ana — blocul ei, separat, sub prezentare */}
      {!gata && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease }}
          className="glass-strong mt-4 p-4 sm:p-5 lg:!bg-white/55"
        >
          <div className="flex items-center gap-3">
            <AnaFace size={46} mood={mood} />
            <div className="min-w-0 flex-1">
              <p className="font-display text-[1.1rem] leading-tight text-ink">Întreab-o pe Ana</p>
              <p className="mt-0.5 font-sans text-[0.8rem] text-ink-muted">
                Asistenta virtuală a cabinetului îți răspunde pe loc.
              </p>
            </div>
            {intrebari > 0 && !chat && (
              <button
                type="button"
                onClick={() => setChat(true)}
                className="shrink-0 font-sans text-[0.8rem] text-periwinkle underline underline-offset-4 transition-colors hover:text-ink"
              >
                Conversația voastră
              </button>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              intreaba(bara, "bara");
            }}
            className="glass-btn mt-3 flex items-center gap-2 p-1.5 pl-3 transition-shadow focus-within:shadow-[0_0_0_3px_rgba(110,133,103,0.25),0_12px_30px_-20px_rgba(54,60,69,0.45)]"
          >
            <input
              value={bara}
              onChange={(e) => setBara(e.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              placeholder="Prețuri, ședințe online, prima întâlnire…"
              aria-label="Întreab-o pe Ana, asistenta virtuală a cabinetului"
              maxLength={500}
              className="min-w-0 flex-1 bg-transparent py-2 font-sans text-[0.93rem] text-ink placeholder:text-ink-muted focus:outline-none"
            />
            <button
              type="submit"
              disabled={!bara.trim() || busy}
              aria-label="Trimite întrebarea"
              className="flex h-10 w-10 shrink-0 items-center justify-center bg-periwinkle text-cream transition-colors hover:bg-ink disabled:opacity-40"
            >
              <IconSend className="h-4.5 w-4.5" />
            </button>
          </form>

          {/* Câteva întrebări gata scrise, cât bara e activă și încă goală */}
          <AnimatePresence initial={false}>
            {focus && !bara && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-3">
                  {SUGESTII_HERO.map((s) => (
                    <button
                      key={s}
                      type="button"
                      // mousedown, nu click: altfel bara pierde focusul și sugestiile dispar înainte de click
                      onMouseDown={(e) => {
                        e.preventDefault();
                        intreaba(s, "bara");
                      }}
                      className="bg-white/60 px-3 py-1.5 font-sans text-[0.8rem] text-ink transition-colors hover:bg-periwinkle hover:text-cream"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Chatul — apare printr-un fade peste toată coloana */}
      <AnimatePresence>
        {chat && (
          <motion.div
            role="dialog"
            aria-label="Conversația cu Ana"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease }}
            className="glass-strong absolute inset-0 z-10 flex min-h-[26rem] flex-col !bg-cream-warm/95"
          >
            <AntetAna mood={mood} onClose={() => setChat(false)} inchideEticheta="Închide conversația" />
            <div ref={listaRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6" aria-live="polite">
              <AnaMesaje onGo={navigheaza} faraSalut />
            </div>
            {!gata && (
              <div className="border-t border-ink/8 px-5 pb-3 pt-3 sm:px-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    intreaba(scris, "chat");
                  }}
                  className="glass-btn flex items-center gap-2 p-1.5 pl-3 transition-shadow focus-within:shadow-[0_0_0_3px_rgba(110,133,103,0.25)]"
                >
                  <input
                    ref={chatInputRef}
                    value={scris}
                    onChange={(e) => setScris(e.target.value)}
                    placeholder="Scrie o întrebare…"
                    aria-label="Întrebarea ta pentru Ana"
                    maxLength={500}
                    className="min-w-0 flex-1 bg-transparent py-2 font-sans text-[0.93rem] text-ink placeholder:text-ink-muted focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!scris.trim() || busy}
                    aria-label="Trimite"
                    className="flex h-10 w-10 shrink-0 items-center justify-center bg-periwinkle text-cream transition-colors hover:bg-ink disabled:opacity-40"
                  >
                    <IconSend className="h-4.5 w-4.5" />
                  </button>
                </form>
                <NotaAna ramase={ramase} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
