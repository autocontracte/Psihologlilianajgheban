"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { KIND_LABEL, PALETTE, ZILE, daysLabel, type Kind, type Room } from "@/lib/programator/reguli";
import type { PersonAdmin } from "@/lib/programator/oameni";
import { butonPlin, butonSimplu, camp, cere, eticheta } from "./comun";

type PersonDraft = {
  name: string;
  kind: Kind;
  color: string;
  username: string;
  password: string;
  manager: boolean;
  active: boolean;
};

function PersonForm({
  person,
  isMe,
  onDone,
  onCancel,
}: {
  person: PersonAdmin | null;
  isMe: boolean;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [d, setD] = useState<PersonDraft>({
    name: person?.name ?? "",
    kind: person?.kind ?? "CHIRIAS",
    color: person?.color ?? PALETTE[0],
    username: person?.username ?? "",
    password: "",
    manager: person?.manager ?? false,
    active: person?.active ?? true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof PersonDraft>(k: K, v: PersonDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  const uid = person?.id ?? "nou";

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      // drepturile proprii nu se trimit: nu și le poate retrage nimeni singur
      const { manager, active, ...rest } = d;
      const body = isMe ? rest : { ...rest, manager, active };
      if (person) await cere(`/api/programator/oameni/${person.id}`, "PATCH", body);
      else await cere("/api/programator/oameni", "POST", body);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 bg-cream-warm p-5 sm:grid-cols-2">
      <div>
        <label htmlFor={`nume-${uid}`} className={eticheta}>
          Nume
        </label>
        <input id={`nume-${uid}`} value={d.name} onChange={(e) => set("name", e.target.value)} required className={camp} />
      </div>
      <div>
        <label htmlFor={`tip-${uid}`} className={eticheta}>
          Tip
        </label>
        <select id={`tip-${uid}`} value={d.kind} onChange={(e) => set("kind", e.target.value as Kind)} className={camp}>
          <option value="CENTRU">Therapy Home (psiholog al centrului)</option>
          <option value="CHIRIAS">Chiriaș (închiriază cabinetul)</option>
          <option value="ADMIN">Administrator (doar administrează, nu apare în grilă)</option>
        </select>
      </div>
      <div>
        <label htmlFor={`user-${uid}`} className={eticheta}>
          Utilizator (pentru autentificare)
        </label>
        <input
          id={`user-${uid}`}
          value={d.username}
          onChange={(e) => set("username", e.target.value)}
          autoCapitalize="none"
          autoComplete="off"
          placeholder="ex. elena.praz"
          className={camp}
        />
      </div>
      <div>
        <label htmlFor={`parola-${uid}`} className={eticheta}>
          {person?.hasPassword ? "Parolă nouă (gol = rămâne cea veche)" : "Parolă"}
        </label>
        <input
          id={`parola-${uid}`}
          type="text"
          value={d.password}
          onChange={(e) => set("password", e.target.value)}
          autoComplete="off"
          placeholder="minimum 8 caractere, o literă și o cifră"
          className={camp}
        />
      </div>
      <div className="sm:col-span-2">
        <span className={eticheta}>Culoare în grilă</span>
        <div className="flex flex-wrap gap-2">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Culoarea ${c}`}
              aria-pressed={d.color === c}
              onClick={() => set("color", c)}
              className={`h-9 w-9 border-2 ${d.color === c ? "border-ink" : "border-transparent"}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
      {!isMe && (
        <div className="flex flex-wrap gap-x-8 gap-y-2 font-sans text-[0.92rem] sm:col-span-2">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={d.manager || d.kind === "ADMIN"}
              disabled={d.kind === "ADMIN"}
              onChange={(e) => set("manager", e.target.checked)}
              className="h-4 w-4 accent-periwinkle"
            />
            Administrator (modifică orice rezervare, oamenii și cabinetele)
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={d.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 accent-periwinkle" />
            Activ
          </label>
        </div>
      )}
      {error && (
        <p role="alert" className="bg-clay-pale px-4 py-3 font-sans text-[0.9rem] text-clay sm:col-span-2">
          {error}
        </p>
      )}
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" disabled={busy} className={butonPlin}>
          {busy ? "Se salvează…" : "Salvează"}
        </button>
        <button type="button" disabled={busy} onClick={onCancel} className={butonSimplu}>
          Renunță
        </button>
      </div>
    </form>
  );
}

function RoomForm({ room, people, onDone }: { room: Room; people: PersonAdmin[]; onDone: () => void }) {
  const [name, setName] = useState(room.name);
  const [ownerId, setOwnerId] = useState(room.ownerId ?? "");
  const [days, setDays] = useState<number[]>(room.ownerDays);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await cere(`/api/programator/cabinete/${room.id}`, "PATCH", { name, ownerId, ownerDays: ownerId ? days : [] });
      setSaved(true);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
    } finally {
      setBusy(false);
    }
  }

  const free = ownerId ? [1, 2, 3, 4, 5, 6, 7].filter((n) => !days.includes(n)) : [];

  return (
    <form onSubmit={submit} className="space-y-4 bg-cream-warm p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`cab-${room.id}`} className={eticheta}>
            Nume
          </label>
          <input id={`cab-${room.id}`} value={name} onChange={(e) => setName(e.target.value)} required className={camp} />
        </div>
        <div>
          <label htmlFor={`prop-${room.id}`} className={eticheta}>
            Al cui este
          </label>
          <select id={`prop-${room.id}`} value={ownerId} onChange={(e) => setOwnerId(e.target.value)} className={camp}>
            <option value="">Al nimănui — liber toată săptămâna</option>
            {people
              .filter((p) => p.active && p.kind !== "ADMIN")
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </div>
      </div>
      {ownerId && (
        <div>
          <span className={eticheta}>Zilele în care e ocupat de proprietar (în rest e liber pentru rezervări)</span>
          <div className="flex flex-wrap gap-1.5">
            {ZILE.map((z, i) => {
              const n = i + 1;
              const on = days.includes(n);
              return (
                <button
                  key={z}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setDays(on ? days.filter((x) => x !== n) : [...days, n].sort())}
                  className={`border px-3 py-2 font-sans text-[0.88rem] transition-colors ${
                    on ? "border-periwinkle bg-periwinkle text-cream" : "border-ink/20 bg-cream text-ink hover:border-ink/50"
                  }`}
                >
                  {z}
                </button>
              );
            })}
          </div>
          <p className="mt-2 font-sans text-[0.85rem] text-ink-soft">
            {free.length ? `Liber: ${daysLabel(free)}.` : "Nu rămâne nicio zi liberă."}
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="bg-clay-pale px-4 py-3 font-sans text-[0.9rem] text-clay">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className={butonPlin}>
          {busy ? "Se salvează…" : "Salvează"}
        </button>
        {saved && <span className="font-sans text-[0.88rem] text-periwinkle">Salvat.</span>}
      </div>
    </form>
  );
}

export function OameniSiCabinete({
  people,
  rooms,
  myId,
}: {
  people: PersonAdmin[];
  rooms: Room[];
  myId: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);

  const done = () => {
    setEditing(null);
    router.refresh();
  };

  return (
    <div className="mt-8 space-y-12">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-ink">Oameni</h2>
            <p className="mt-1 max-w-2xl font-sans text-[0.92rem] leading-relaxed text-ink-soft">
              Cine are utilizator și parolă poate intra și își poate face singur rezervările. Ceilalți apar doar în
              grilă, iar rezervările lor le face un administrator.
            </p>
          </div>
          {editing !== "nou" && (
            <button type="button" onClick={() => setEditing("nou")} className={butonPlin}>
              <Plus className="h-4 w-4" />
              Adaugă
            </button>
          )}
        </div>

        {editing === "nou" && (
          <div className="mt-5">
            <PersonForm person={null} isMe={false} onDone={done} onCancel={() => setEditing(null)} />
          </div>
        )}

        <ul className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
          {people.map((p) => (
            <li key={p.id} className="py-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="inline-block h-5 w-5 shrink-0" style={{ background: p.color }} />
                <span className={`font-sans text-[1rem] font-semibold ${p.active ? "text-ink" : "text-ink-muted line-through"}`}>
                  {p.name}
                </span>
                <span className="font-sans text-[0.85rem] text-ink-soft">{KIND_LABEL[p.kind]}</span>
                {p.manager && p.kind !== "ADMIN" && (
                  <span className="bg-periwinkle-pale px-2 py-0.5 font-sans text-[0.75rem] text-ink">administrator</span>
                )}
                <span className="font-sans text-[0.85rem] text-ink-muted">
                  {p.username && p.hasPassword ? `intră cu „${p.username}”` : "fără cont"}
                  {!p.active && " · inactiv"}
                </span>
                {editing !== p.id && (
                  <button
                    type="button"
                    onClick={() => setEditing(p.id)}
                    className="ml-auto font-sans text-[0.88rem] text-periwinkle underline underline-offset-4 hover:text-ink"
                  >
                    Modifică
                  </button>
                )}
              </div>
              {editing === p.id && (
                <div className="mt-3">
                  <PersonForm person={p} isMe={p.id === myId} onDone={done} onCancel={() => setEditing(null)} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Cabinete</h2>
        <p className="mt-1 max-w-2xl font-sans text-[0.92rem] leading-relaxed text-ink-soft">
          Un cabinet care e al cuiva apare ocupat în zilele alese și nu se poate rezerva; în celelalte zile e liber.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {rooms.map((r) => (
            <RoomForm key={r.id} room={r} people={people} onDone={() => router.refresh()} />
          ))}
        </div>
      </section>
    </div>
  );
}
