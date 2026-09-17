"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EditorArticol } from "./EditorArticol";

/* ----------------------------------------------------------------------------
   Formularul complet de articol — titlu, adresă, copertă, rezumat și conținut.
   Același formular creează un articol nou sau îl modifică pe unul existent.
   -------------------------------------------------------------------------- */

const stilCamp =
  "w-full rounded-none border border-ink/15 bg-cream-warm px-4 py-3 font-sans text-[0.9rem] text-ink placeholder:text-ink-muted focus:border-periwinkle focus:outline-none focus:ring-4 focus:ring-periwinkle/12";

function facSlug(t: string) {
  const d: Record<string, string> = { ă: "a", â: "a", î: "i", ș: "s", ş: "s", ț: "t", ţ: "t" };
  return t
    .toLowerCase()
    .replace(/[ăâîșşțţ]/g, (c) => d[c] ?? c)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

type Articol = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  status: string;
};

export function FormularArticol({ articol }: { articol: Articol }) {
  const router = useRouter();
  const esteNou = !articol.id;

  const [title, setTitle] = useState(articol.title);
  const [slug, setSlug] = useState(articol.slug);
  const [slugAtins, setSlugAtins] = useState(!esteNou);
  const [excerpt, setExcerpt] = useState(articol.excerpt);
  const [content, setContent] = useState(articol.content);
  const [cover, setCover] = useState<string | null>(articol.coverImage);
  const [lucrez, setLucrez] = useState(false);
  const [eroare, setEroare] = useState("");
  const [urcCover, setUrcCover] = useState(false);
  const contentRef = useRef(articol.content);

  function schimbaTitlu(v: string) {
    setTitle(v);
    if (!slugAtins) setSlug(facSlug(v));
  }

  async function urcaCover(file: File) {
    setUrcCover(true);
    setEroare("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/blog/imagine", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Încărcarea a eșuat.");
      setCover(json.url);
    } catch (err) {
      setEroare(err instanceof Error ? err.message : "Eroare la încărcare.");
    } finally {
      setUrcCover(false);
    }
  }

  async function salveaza(status: "DRAFT" | "PUBLISHED") {
    setEroare("");
    if (title.trim().length < 3) {
      setEroare("Scrie un titlu (cel puțin 3 litere).");
      return;
    }
    setLucrez(true);
    try {
      const payload = {
        title,
        slug,
        excerpt,
        content: contentRef.current,
        coverImage: cover,
        status,
      };
      const res = await fetch(
        esteNou ? "/api/admin/blog" : `/api/admin/blog/${articol.id}`,
        {
          method: esteNou ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Nu am putut salva.");
      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      setEroare(err instanceof Error ? err.message : "A apărut o eroare.");
      setLucrez(false);
    }
  }

  async function sterge() {
    if (!articol.id) return;
    if (!confirm("Sigur ștergi articolul? Nu se mai poate recupera.")) return;
    setLucrez(true);
    await fetch(`/api/admin/blog/${articol.id}`, { method: "DELETE" });
    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      {/* Coloana principală */}
      <div className="min-w-0">
        <input
          value={title}
          onChange={(e) => schimbaTitlu(e.target.value)}
          placeholder="Titlul articolului"
          className="w-full rounded-none border-0 border-b border-ink/15 bg-transparent pb-3 font-display text-[1.9rem] text-ink placeholder:text-ink-muted focus:border-periwinkle focus:outline-none"
        />

        <div className="mt-6">
          <EditorArticol
            valoareInitiala={content}
            onChange={(html) => {
              contentRef.current = html;
              setContent(html);
            }}
          />
        </div>
      </div>

      {/* Bara laterală */}
      <aside className="space-y-6">
        <div className="border border-ink/10 bg-cream p-5">
          <p className="font-sans text-[0.8rem] text-ink-soft">Adresa articolului</p>
          <div className="mt-2 flex items-center gap-1 font-mono text-[0.75rem] text-ink-muted">
            <span>/blog/</span>
            <input
              value={slug}
              onChange={(e) => { setSlug(facSlug(e.target.value)); setSlugAtins(true); }}
              className="min-w-0 flex-1 border-b border-ink/15 bg-transparent py-1 text-ink focus:border-periwinkle focus:outline-none"
            />
          </div>
        </div>

        <div className="border border-ink/10 bg-cream p-5">
          <p className="font-sans text-[0.8rem] text-ink-soft">Imagine de copertă</p>
          {cover ? (
            <div className="mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt="" className="w-full border border-ink/10 object-cover" />
              <button
                type="button"
                onClick={() => setCover(null)}
                className="mt-2 font-sans text-[0.78rem] text-ink-muted underline underline-offset-4 hover:text-clay"
              >
                Elimină
              </button>
            </div>
          ) : (
            <label className="mt-3 flex cursor-pointer items-center justify-center border border-dashed border-ink/25 py-6 font-sans text-[0.82rem] text-ink-soft hover:border-periwinkle hover:text-periwinkle">
              {urcCover ? "Se încarcă…" : "Alege o imagine"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) urcaCover(f); e.target.value = ""; }}
              />
            </label>
          )}
        </div>

        <div className="border border-ink/10 bg-cream p-5">
          <p className="font-sans text-[0.8rem] text-ink-soft">Rezumat (opțional)</p>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            placeholder="Dacă îl lași gol, se ia automat din text."
            className={`${stilCamp} mt-2 resize-none text-[0.85rem]`}
          />
        </div>

        {eroare && (
          <p className="border-l-2 border-clay bg-clay-pale px-4 py-3 font-sans text-[0.85rem] text-clay">
            {eroare}
          </p>
        )}

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => salveaza("PUBLISHED")}
            disabled={lucrez}
            className="w-full bg-periwinkle px-6 py-3.5 font-sans text-[0.9rem] text-cream transition-colors hover:bg-ink disabled:opacity-60"
          >
            {articol.status === "PUBLISHED" ? "Salvează (publicat)" : "Publică"}
          </button>
          <button
            type="button"
            onClick={() => salveaza("DRAFT")}
            disabled={lucrez}
            className="w-full border border-ink/20 px-6 py-3 font-sans text-[0.88rem] text-ink transition-colors hover:border-ink/50 disabled:opacity-60"
          >
            Salvează ca ciornă
          </button>
          {!esteNou && (
            <div className="flex items-center justify-between pt-1">
              <a
                href={`/blog/${slug}`}
                target="_blank"
                rel="noreferrer"
                className="font-sans text-[0.8rem] text-periwinkle underline underline-offset-4 hover:text-ink"
              >
                Vezi pe site
              </a>
              <button
                type="button"
                onClick={sterge}
                disabled={lucrez}
                className="font-sans text-[0.8rem] text-ink-muted underline underline-offset-4 hover:text-clay"
              >
                Șterge
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
