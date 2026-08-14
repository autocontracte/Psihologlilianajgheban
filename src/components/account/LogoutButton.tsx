"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className={
        className ||
        "font-sans text-[0.7rem] uppercase tracking-[0.14em] text-ink-muted transition-colors duration-300 hover:text-clay disabled:opacity-60"
      }
    >
      {busy ? "Se iese…" : "Ieși din cont"}
    </button>
  );
}
