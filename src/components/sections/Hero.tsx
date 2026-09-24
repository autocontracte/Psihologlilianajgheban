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
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="glass-strong absolute -left-10 top-[16%] flex items-center gap-2.5 px-4 py-3 lg:-left-14"
            >
              <IconOffice className="h-5 w-5 text-periwinkle" />
              <span className="font-sans text-[0.88rem] text-ink">În cabinet și online</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
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
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
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
   Caseta din hero: prezentarea, iar dedesubt bara în care îi scrii Anei.
   -------------------------------------------------------------------------- */

function CasetaHero() {
  const { busy, gata, intrebari, ramase, trimite, turns } = useAna();
  const [chat, setChat] = useState(false);
  const [draft, setDraft] = useState("");
  const [inaltime, setInaltime] = useState<number | null>(null);
  const casetaRef = useRef<HTMLDivElement>(null);
  const listaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mood = useAnaMood(draft);
  const navigheaza = useNavigheaza();
  const ease = [0.22, 1, 0.36, 1] as const;

  // Caseta își păstrează înălțimea când devine chat, ca pagina să nu sară
  useLayoutEffect(() => {
    if (chat || !casetaRef.current) return;
    const el = casetaRef.current;
    const masoara = () => setInaltime(el.getBoundingClientRect().height);
    masoara();
    const ro = new ResizeObserver(masoara);
    ro.observe(el);
    return () => ro.disconnect();
  }, [chat]);

  useEffect(() => {
    listaRef.current?.scrollTo({ top: listaRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy, chat]);

  function scrie(v: string) {
    setDraft(v);
    if (v.length > 0 && !chat) setChat(true);
    if (v.length === 0 && chat && intrebari === 0) setChat(false);
  }

  async function trimiteDraft() {
    const q = draft;
    if (!q.trim()) return;
    setChat(true);
    setDraft("");
    const ok = await trimite(q);
    if (!ok) setDraft(q);
    inputRef.current?.focus();
  }

  function inchide() {
    setChat(false);
    setDraft("");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.1, ease }}
      ref={casetaRef}
      className="glass-strong flex flex-col lg:!bg-white/45"
      style={chat && inaltime ? { height: Math.max(inaltime, 440) } : undefined}
    >
      <AnimatePresence mode="wait" initial={false}>
        {!chat ? (
          <motion.div
            key="intro"
            exit={{ opacity: 0, y: -14, filter: "blur(4px)" }}
            transition={{ duration: 0.28 }}
            className="px-6 pb-5 pt-7 sm:px-10 sm:pt-10 lg:px-12 lg:pt-12"
          >
            {/* Titlul principal. Pentru Google se citește „Liliana Jgheban — Psiholog
                clinician și psihoterapeut integrativ în București" (numele întâi, apoi
                ce și unde); pe ecran rândul mic stă deasupra numelui. */}
            <h1 className="flex flex-col-reverse">
              <motion.span
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.4, ease }}
                className="mt-3 block font-display text-[2.5rem] font-medium leading-[1.05] tracking-tight text-periwinkle sm:text-6xl lg:text-[4rem]"
              >
                {HERO.name}
                <span className="sr-only">, </span>
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease }}
                className="block font-sans text-[0.98rem] font-medium text-ink"
              >
                {HERO.eyebrow}
              </motion.span>
            </h1>



            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.35, ease }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <AntetAna mood={mood} intrebari={intrebari} onClose={inchide} inchideEticheta="Înapoi la prezentare" />
            <div ref={listaRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6" aria-live="polite">
              <AnaMesaje onGo={navigheaza} faraSalut />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bara de scris — mereu la locul ei, ca focusul să nu se piardă când caseta se transformă */}
      {!gata && (
        <div className={chat ? "border-t border-ink/8 px-5 pb-3 pt-3 sm:px-6" : "px-6 pb-7 sm:px-10 sm:pb-10 lg:px-12 lg:pb-12"}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              trimiteDraft();
            }}
            className="glass-btn flex items-center gap-2 p-1.5 pl-2 transition-shadow focus-within:shadow-[0_0_0_3px_rgba(110,133,103,0.25),0_12px_30px_-20px_rgba(54,60,69,0.45)]"
          >
            <AnaFace size={36} mood={mood} />
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => scrie(e.target.value)}
              placeholder={chat ? "Scrie o întrebare…" : "Întreab-o pe Ana: prețuri, online, prima ședință…"}
              aria-label="Întreab-o pe Ana, asistenta virtuală a cabinetului"
              maxLength={500}
              className="min-w-0 flex-1 bg-transparent px-1 py-2 font-sans text-[0.93rem] text-ink placeholder:text-ink-muted focus:outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim() || busy}
              aria-label="Trimite întrebarea"
              className="flex h-10 w-10 shrink-0 items-center justify-center bg-periwinkle text-cream transition-colors hover:bg-ink disabled:opacity-40"
            >
              <IconSend className="h-4.5 w-4.5" />
            </button>
          </form>
          {chat && <NotaAna ramase={ramase} />}
        </div>
      )}
    </motion.div>
  );
}
