import { redirect } from "next/navigation";
import { IntraForm } from "@/components/programator/IntraForm";
import { getProgUser } from "@/lib/programator/auth";

export default async function IntraPage() {
  if (await getProgUser()) redirect("/");

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <p className="font-sans text-[0.8rem] text-periwinkle">Therapy Home · intern</p>
        <h1 className="mt-2 font-display text-4xl text-ink">Programator cabinete</h1>
        <p className="mt-3 font-sans text-[0.95rem] leading-relaxed text-ink-soft">
          Intră cu utilizatorul și parola primite de la administrator.
        </p>
        <div className="mt-8 bg-cream-warm p-7 shadow-[0_30px_70px_-40px_rgba(56,62,82,0.45)]">
          <IntraForm />
        </div>
      </div>
    </main>
  );
}
