"use client";

import { useEffect } from "react";
import { masoaraProgramarea } from "@/lib/masurare";
import { urmareste } from "@/lib/urmarire";

/* Programarea plătită online se încheie aici, după Stripe. Id-ul programării
   ține conversia unică dacă pagina e reîncărcată. */
export function MasoaraProgramarea({ id, valoare }: { id: string; valoare: number }) {
  useEffect(() => {
    masoaraProgramarea(id, valoare);
    urmareste("plata", valoare + " lei");
  }, [id, valoare]);
  return null;
}
