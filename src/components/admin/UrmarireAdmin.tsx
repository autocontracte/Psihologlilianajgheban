"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { nuMaUrmari } from "@/lib/urmarire";

/* În panoul de vizite: reîmprospătează datele la 20 de secunde (ca să se vadă
   în direct cine e pe site) și pune semnul „nu mă urmări” pe acest browser, ca
   vizitele proprii să nu intre în statistici. */
export function UrmarireAdmin() {
  const router = useRouter();

  useEffect(() => {
    nuMaUrmari();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 20_000);
    return () => clearInterval(t);
  }, [router]);

  return null;
}
