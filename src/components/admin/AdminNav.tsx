"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Prezentare" },
  { href: "/admin/programari", label: "Programări" },
  { href: "/admin/program", label: "Program și zile libere" },
  { href: "/admin/clienti", label: "Clienți" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto max-w-7xl px-6 lg:px-10">
      <ul className="-mb-px flex gap-1 overflow-x-auto">
        {LINKS.map((l) => {
          const active =
            l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);

          return (
            <li key={l.href}>
              <Link
                href={l.href}
                className={[
                  "block whitespace-nowrap border-b-2 px-4 py-3 font-sans text-[0.75rem] transition-colors duration-300",
                  active
                    ? "border-periwinkle text-ink"
                    : "border-transparent text-ink-muted hover:text-ink",
                ].join(" ")}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
