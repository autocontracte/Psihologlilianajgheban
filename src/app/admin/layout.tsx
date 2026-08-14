import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/account/LogoutButton";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: { default: "Administrare", template: "%s — Administrare" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  // Poarta de acces pentru tot ce e sub /admin
  if (!user) redirect("/cont/autentificare?redirect=/admin");
  if (user.role !== "ADMIN") redirect("/cont");

  return (
    <div className="min-h-screen bg-cream-deep">
      {/* Bară de sus */}
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-10">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex flex-col leading-none">
              <span className="font-display text-lg text-ink">
                Panou de administrare
              </span>
              <span className="mt-1 font-sans text-[0.55rem] uppercase tracking-[0.24em] text-ink-muted">
                Liliana Jgheban
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-5">
            <Link
              href="/"
              target="_blank"
              className="hidden font-sans text-[0.7rem] uppercase tracking-[0.14em] text-ink-soft transition-colors duration-300 hover:text-periwinkle sm:block"
            >
              Vezi site-ul ↗
            </Link>
            <LogoutButton />
          </div>
        </div>

        <AdminNav />
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        {children}
      </main>
    </div>
  );
}
