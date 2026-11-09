"use client";

import { useEffect } from "react";

import { urmareste } from "@/lib/urmarire";

/* Pe pagina 404: notează ce adresă a fost cerută, ca legăturile stricate (ale
   noastre sau de pe alte site-uri) să se vadă în panoul de vizite. */
export function Pagina404() {
  useEffect(() => {
    urmareste("p404", location.pathname + location.search);
  }, []);

  return null;
}
