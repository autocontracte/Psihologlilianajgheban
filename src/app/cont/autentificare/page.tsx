import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Autentificare",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/cont");

  return (
    <AuthShell
      eyebrow="Contul tău"
      title="Bine ai revenit"
      subtitle="Intră în cont ca să îți vezi programările sau ca să stabilești o întâlnire nouă."
      footer={
        <>
          Nu ai încă un cont?{" "}
          <Link
            href="/cont/inregistrare"
            className="text-periwinkle underline decoration-periwinkle/30 underline-offset-4 transition-colors hover:text-ink"
          >
            Creează unul
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
