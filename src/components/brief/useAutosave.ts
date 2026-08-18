"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Salvează un răspuns de îndată ce se schimbă.
 *
 * Nu există buton de trimitere: chestionarul se poate completa în mai multe
 * reprize, iar fiecare răspuns rămâne salvat separat. Câmpurile de text se
 * salvează cu întârziere, ca să nu trimitem o cerere la fiecare tastă.
 */
export function useAutosave() {
  const [states, setStates] = useState<Record<string, SaveState>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const clearers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const t = timers.current;
    const c = clearers.current;
    return () => {
      Object.values(t).forEach(clearTimeout);
      Object.values(c).forEach(clearTimeout);
    };
  }, []);

  const send = useCallback(async (key: string, value: string) => {
    setStates((s) => ({ ...s, [key]: "saving" }));
    try {
      const res = await fetch("/api/chestionar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error();
      setStates((s) => ({ ...s, [key]: "saved" }));

      // „Salvat" dispare după câteva secunde, ca să nu rămână permanent pe ecran
      clearTimeout(clearers.current[key]);
      clearers.current[key] = setTimeout(
        () => setStates((s) => ({ ...s, [key]: "idle" })),
        2600,
      );
    } catch {
      setStates((s) => ({ ...s, [key]: "error" }));
    }
  }, []);

  /** Pentru butoane și alegeri — salvează imediat. */
  const saveNow = useCallback(
    (key: string, value: string) => {
      clearTimeout(timers.current[key]);
      void send(key, value);
    },
    [send],
  );

  /** Pentru câmpurile de text — salvează la scurt timp după ce s-a oprit din scris. */
  const saveSoon = useCallback(
    (key: string, value: string, delay = 700) => {
      clearTimeout(timers.current[key]);
      timers.current[key] = setTimeout(() => void send(key, value), delay);
    },
    [send],
  );

  return { states, saveNow, saveSoon };
}
