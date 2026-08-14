import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Creează cont",
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/cont");

  return (
    <AuthShell
      eyebrow="Cont nou"
      title="Hai să începem"
      subtitle="Contul îți permite să te programezi online și să îți urmărești ședințele într-un singur loc."
      footer={
        <>
          Ai deja un cont?{" "}
          <Link
            href="/cont/autentificare"
            className="text-periwinkle underline decoration-periwinkle/30 underline-offset-4 transition-colors hover:text-ink"
          >
            Autentifică-te
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
