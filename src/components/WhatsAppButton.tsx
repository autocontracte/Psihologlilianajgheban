"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SITE } from "@/content/site";

const waHref = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
  SITE.whatsappMessage,
)}`;

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.18 8.18 0 0 1 5.82 2.42 8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23z" />
    </svg>
  );
}

export function WhatsAppButton() {
  const [visible, setVisible] = useState(false);
  const [hinted, setHinted] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Arată o dată eticheta, la scurt timp după ce butonul apare
  useEffect(() => {
    if (!visible || hinted) return;
    const show = setTimeout(() => setHinted(true), 900);
    return () => clearTimeout(show);
  }, [visible, hinted]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 lg:bottom-8 lg:right-8"
        >
          <AnimatePresence>
            {hinted && (
              <motion.span
                initial={{ opacity: 0, x: 12, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 12, scale: 0.9 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="hidden rounded-pill bg-cream px-4 py-2.5 font-sans text-[0.72rem] text-ink shadow-[0_14px_34px_-16px_rgba(56,62,82,0.55)] sm:block"
              >
                Scrie-mi pe WhatsApp
              </motion.span>
            )}
          </AnimatePresence>

          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            aria-label="Scrie-mi pe WhatsApp"
            onMouseEnter={() => setHinted(true)}
            className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_16px_36px_-12px_rgba(37,211,102,0.75)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110"
          >
            {/* Undă discretă în jurul butonului */}
            <span
              aria-hidden
              className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20 [animation-duration:2.5s]"
            />
            <IconWhatsApp className="relative h-7 w-7" />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
