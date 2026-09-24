"use client";

import { useRouter } from "next/navigation";

/**
 * Deschide linkurile din răspunsurile Anei. O ancoră de pe pagina curentă
 * (/#servicii când ești deja pe prima pagină) doar derulează până acolo.
 */
export function useNavigheaza() {
  const router = useRouter();
  return (href: string) => {
    const url = new URL(href, window.location.href);
    if (url.pathname === window.location.pathname && url.hash) {
      const tinta = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (tinta) {
        tinta.scrollIntoView({ behavior: "smooth" });
        history.replaceState(null, "", url.hash);
        return;
      }
    }
    router.push(url.pathname + url.search + url.hash);
  };
}
