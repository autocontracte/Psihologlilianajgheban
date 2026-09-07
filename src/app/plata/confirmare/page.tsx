import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { IconCheck } from "@/components/ui/Icons";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Plata a fost primită",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ConfirmarePlata({
  searchParams,
}: {
  searchParams: Promise<{ sesiune?: string }>;
}) {
  const { sesiune } = await searchParams;

  /* Confirmarea reală vine prin webhook, nu de aici — omul poate închide
     pagina imediat după plată. Aici doar arătăm ce știm deja. */
  const payment = sesiune
    ? await db.payment.findUnique({
        where: { externalId: sesiune },
        include: { appointment: { include: { service: true } } },
      })
    : null;

  const platit = payment?.status === "PAID";

  return (
    <>
      <Nav />
      <main className="flex min-h-screen items-center bg-cream-deep px-6 py-32">
        <div className="mx-auto max-w-lg bg-cream p-10 text-center sm:p-14">
          <div className="mx-auto flex h-16 w-16 items-center justify-center bg-periwinkle-pale text-periwinkle">
            <IconCheck className="h-8 w-8" />
          </div>

          <h1 className="mt-7 font-display text-3xl text-ink">
            {platit ? "Plata a fost primită" : "Îți mulțumesc"}
          </h1>

          <p className="mt-4 font-sans text-[0.95rem] leading-[1.9] text-ink-soft">
            {payment ? (
              <>
                {payment.appointment.service.name} —{" "}
                {(payment.amount / 100).toFixed(0)} lei.{" "}
                {platit
                  ? "Primești factura pe email."
                  : "Confirmarea de la bancă poate întârzia câteva momente. Îți trimit factura de îndată ce ajunge."}
              </>
            ) : (
              "Dacă plata a reușit, primești confirmarea pe email în câteva momente."
            )}
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/cont"
              className="inline-flex items-center justify-center bg-periwinkle px-7 py-3.5 font-sans text-[0.95rem] text-cream transition-colors hover:bg-ink"
            >
              Vezi programările mele
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center border border-ink/25 px-7 py-3.5 font-sans text-[0.95rem] text-ink transition-colors hover:bg-ink hover:text-cream"
            >
              Înapoi la site
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
