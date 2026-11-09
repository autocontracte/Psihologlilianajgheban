import Link from "next/link";

import { UrmarireAdmin } from "@/components/admin/UrmarireAdmin";
import { TZ } from "@/lib/tz";
import { durata, formateazaDurata, incarcaVizite, sinteza, sursa } from "@/lib/vizite";
import { TRACK_LABELS, type TrackType } from "@/lib/urmarireTipuri";

export const metadata = { title: "Vizite" };

const PERIOADE = [
  { zile: 1, eticheta: "Azi" },
  { zile: 7, eticheta: "7 zile" },
  { zile: 30, eticheta: "30 de zile" },
  { zile: 90, eticheta: "90 de zile" },
];

const ora = new Intl.DateTimeFormat("ro-RO", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
});
const ziOra = new Intl.DateTimeFormat("ro-RO", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const ziScurt = new Intl.DateTimeFormat("ro-RO", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
});

/** Începutul zilei de azi, în ora României. */
function inceputulZilei(acum: number) {
  const local = new Date(new Date(acum).toLocaleString("en-US", { timeZone: TZ }));
  return (
    acum -
    (local.getHours() * 3600 + local.getMinutes() * 60 + local.getSeconds()) * 1000
  );
}

const procent = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "–");

function Cifra({
  eticheta,
  valoare,
  nota,
  accent = "text-ink",
}: {
  eticheta: string;
  valoare: string | number;
  nota?: string;
  accent?: string;
}) {
  return (
    <div className="bg-cream p-5">
      <p className="font-sans text-[0.74rem] tracking-[0.02em] text-ink-muted">
        {eticheta}
      </p>
      <p className={`mt-2 font-display text-3xl ${accent}`}>{valoare}</p>
      {nota && <p className="mt-1.5 font-sans text-[0.72rem] text-ink-muted">{nota}</p>}
    </div>
  );
}

function Clasament({
  titlu,
  rows,
  gol,
  cate = 12,
}: {
  titlu: string;
  rows: [string, number][];
  gol: string;
  cate?: number;
}) {
  const max = rows[0]?.[1] ?? 1;
  return (
    <div className="bg-cream p-5">
      <h2 className="font-display text-lg text-ink">{titlu}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 font-sans text-[0.8rem] text-ink-muted">{gol}</p>
      ) : (
        <ul className="mt-3 space-y-1">
          {rows.slice(0, cate).map(([k, n]) => (
            <li key={k} className="relative overflow-hidden px-3 py-1.5">
              <span
                className="absolute inset-y-0 left-0 bg-periwinkle-pale"
                style={{ width: `${(n / max) * 100}%` }}
              />
              <span className="relative flex items-center justify-between gap-3 font-sans text-[0.78rem]">
                <span className="min-w-0 truncate text-ink" title={k}>
                  {k}
                </span>
                <span className="shrink-0 font-medium text-periwinkle">{n}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function AdminVizitePage({
  searchParams,
}: {
  searchParams: Promise<{ zile?: string }>;
}) {
  const { zile } = await searchParams;
  const perioada = PERIOADE.find((p) => String(p.zile) === zile)?.zile ?? 7;
  const acum = Date.now();
  const de = perioada === 1 ? inceputulZilei(acum) : acum - perioada * 86_400_000;

  const { vizite, evenimente, conturi } = await incarcaVizite(new Date(de));
  const s = sinteza(vizite, evenimente, acum);
  const maxZi = Math.max(1, ...s.peZile.map(([, n]) => n));

  return (
    <div>
      <UrmarireAdmin />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink lg:text-4xl">Vizite</h1>
          <p className="mt-2.5 max-w-2xl font-sans text-[0.88rem] text-ink-soft">
            Statistici proprii, fără cookie-uri și fără adrese IP salvate. O vizită este
            o filă deschisă pe site. Pagina se reîmprospătează singură la 20 de secunde,
            iar vizitele făcute din acest browser nu se mai numără.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {PERIOADE.map((p) => (
            <Link
              key={p.zile}
              href={`/admin/vizite?zile=${p.zile}`}
              className={[
                "px-4 py-2 font-sans text-[0.75rem] transition-colors duration-300",
                p.zile === perioada
                  ? "bg-ink text-cream"
                  : "bg-cream text-ink-soft hover:text-ink",
              ].join(" ")}
            >
              {p.eticheta}
            </Link>
          ))}
        </div>
      </div>

      {/* Cine e pe site chiar acum */}
      <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3 bg-cream p-5">
        <span className="flex items-center gap-2.5 font-sans text-[0.88rem] text-ink">
          <span className="relative flex h-2.5 w-2.5">
            {s.live.length > 0 && (
              <span className="absolute inset-0 animate-ping rounded-full bg-periwinkle/60" />
            )}
            <span
              className={`relative h-2.5 w-2.5 rounded-full ${
                s.live.length ? "bg-periwinkle" : "bg-ink/20"
              }`}
            />
          </span>
          {s.live.length} {s.live.length === 1 ? "vizitator acum" : "vizitatori acum"}
        </span>
        {s.live.map((v) => {
          const ultima = [...(s.peVizita.get(v.id) ?? [])]
            .reverse()
            .find((e) => e.type === "pagina");
          return (
            <span
              key={v.id}
              className="border border-ink/10 px-3 py-1 font-sans text-[0.72rem] text-ink-soft"
            >
              {ultima?.path ?? v.landing} · {v.device} · {sursa(v)}
            </span>
          );
        })}
      </div>

      {/* Cifrele perioadei */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <Cifra
          eticheta="Vizite"
          valoare={s.total}
          nota={`${procent(s.cuInteres, s.total)} au stat mai mult de 10 secunde`}
        />
        <Cifra
          eticheta="Durata medie"
          valoare={formateazaDurata(s.durataMedie)}
          nota={`${s.paginiPeVizita.toFixed(1)} pagini pe vizită`}
        />
        <Cifra
          eticheta="Programări trimise"
          valoare={s.programari}
          accent="text-periwinkle"
          nota={`${procent(s.programari, s.total)} din vizite · ${
            s.programariIncepute
          } au început`}
        />
        <Cifra
          eticheta="Telefon și WhatsApp"
          valoare={s.telefon + s.whatsapp}
          accent="text-clay"
          nota={`${s.telefon} apel, ${s.whatsapp} WhatsApp, ${
            s.email + s.formulare
          } email`}
        />
        <Cifra
          eticheta="Conversații cu Ana"
          valoare={s.ana}
          nota="vizitatori care i-au scris"
        />
        <Cifra
          eticheta="Trusa de ajutor"
          valoare={s.kitGata}
          nota={`terminată · ${s.kitIncepute} au început`}
        />
      </div>

      {/* Vizitele pe zile */}
      {s.peZile.length > 1 && (
        <div className="mt-4 bg-cream p-5">
          <h2 className="font-display text-lg text-ink">Vizite pe zile</h2>
          <div className="mt-4 flex h-28 items-end gap-1">
            {s.peZile.map(([z, n]) => (
              <div
                key={z}
                className="group flex min-w-0 flex-1 flex-col items-center gap-1.5"
              >
                <span className="font-sans text-[0.68rem] text-ink-muted">{n}</span>
                <div
                  className="w-full bg-periwinkle-pale transition-colors group-hover:bg-periwinkle-light"
                  style={{ height: `${Math.max(3, (n / maxZi) * 100)}%` }}
                  title={`${z}: ${n}`}
                />
                <span className="truncate font-sans text-[0.62rem] text-ink-muted">
                  {ziScurt.format(new Date(`${z}T12:00:00`))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <Clasament titlu="De unde vin" rows={s.surse} gol="Nicio vizită încă." />
        <Clasament titlu="Prima pagină" rows={s.primaPagina} gol="Nicio vizită încă." />
        <Clasament
          titlu="Dispozitiv și loc"
          rows={[...s.dispozitive, ...s.orase]}
          gol="Nicio vizită încă."
        />
      </div>

      {/* Paginile, cu timpul mediu petrecut pe fiecare */}
      <div className="mt-4 overflow-x-auto bg-cream p-5">
        <h2 className="font-display text-lg text-ink">Pagini și timp pe pagină</h2>
        {s.pagini.length === 0 ? (
          <p className="mt-3 font-sans text-[0.8rem] text-ink-muted">
            Nicio pagină deschisă încă.
          </p>
        ) : (
          <table className="mt-4 w-full min-w-[30rem]">
            <thead>
              <tr className="border-b border-ink/10">
                {["Pagina", "Deschideri", "Timp mediu"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-3 py-2.5 font-sans text-[0.74rem] tracking-[0.02em] text-ink-muted ${
                      i === 0 ? "text-left" : "text-right"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.pagini.slice(0, 30).map((p) => (
                <tr key={p.cale} className="border-b border-ink/5 last:border-0">
                  <td className="px-3 py-2.5 font-sans text-[0.8rem] text-ink">
                    {p.cale}
                  </td>
                  <td className="px-3 py-2.5 text-right font-sans text-[0.8rem] text-ink-soft">
                    {p.afisari}
                  </td>
                  <td className="px-3 py-2.5 text-right font-sans text-[0.8rem] font-medium text-periwinkle">
                    {formateazaDurata(p.mediu)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <Clasament titlu="Pe ce apasă" rows={s.clicuri} gol="Niciun clic încă." />
        <Clasament
          titlu="Până unde citesc (secțiuni)"
          rows={s.sectiuni}
          gol="Nicio secțiune văzută încă."
        />
        <div className="space-y-3">
          <Clasament
            titlu="Cât derulează"
            rows={s.derulare}
            gol="Nimeni nu a derulat încă."
            cate={4}
          />
          <Clasament
            titlu="Întrebări frecvente deschise"
            rows={s.intrebari}
            gol="Nicio întrebare deschisă încă."
            cate={6}
          />
        </div>
      </div>

      {s.campanii.length > 0 && (
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <Clasament titlu="Campanii" rows={s.campanii} gol="—" />
        </div>
      )}

      {/* Fiecare vizită, cu traseul complet */}
      <div className="mt-4 bg-cream p-5">
        <h2 className="font-display text-lg text-ink">Vizitele, una câte una</h2>
        <p className="mt-1.5 font-sans text-[0.78rem] text-ink-muted">
          Apasă pe o vizită ca să vezi tot traseul: paginile, secțiunile prin care a
          trecut, pe ce a apăsat și la ce minut.
        </p>

        {vizite.length === 0 ? (
          <p className="mt-4 font-sans text-[0.8rem] text-ink-muted">
            Nicio vizită în perioada aleasă. Dacă site-ul a fost deschis chiar acum,
            așteaptă câteva secunde — datele vin în loturi.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {vizite.slice(0, 120).map((v) => {
              const traseu = s.peVizita.get(v.id) ?? [];
              const start = v.startedAt.getTime();
              const live = acum - v.lastSeenAt.getTime() < 60_000;
              const cont = v.userId ? conturi.get(v.userId) : null;

              return (
                <li key={v.id}>
                  <details className="border border-ink/10 bg-cream-warm">
                    <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 font-sans text-[0.78rem]">
                      <span className="w-[7.5rem] shrink-0 text-ink-muted">
                        {ziOra.format(v.startedAt)}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium text-ink">
                        {v.landing}
                      </span>
                      <span className="text-ink-soft">{sursa(v)}</span>
                      <span className="text-ink-soft">
                        {v.device}
                        {v.city ? ` · ${v.city}` : ""}
                      </span>
                      <span className="text-ink-soft">
                        {v.pages} {v.pages === 1 ? "pagină" : "pagini"} ·{" "}
                        {formateazaDurata(durata(v))}
                      </span>
                      {v.booked && (
                        <span className="bg-periwinkle px-2 py-0.5 text-[0.68rem] text-cream">
                          Programare
                        </span>
                      )}
                      {cont && (
                        <span className="border border-sage/40 px-2 py-0.5 text-[0.68rem] text-sage">
                          {cont.name}
                        </span>
                      )}
                      {live && (
                        <span className="border border-periwinkle/40 px-2 py-0.5 text-[0.68rem] text-periwinkle">
                          În direct
                        </span>
                      )}
                    </summary>

                    <ol className="space-y-1 border-t border-ink/10 px-4 py-3">
                      {traseu.length === 0 && (
                        <li className="font-sans text-[0.75rem] text-ink-muted">
                          Niciun pas înregistrat.
                        </li>
                      )}
                      {traseu.map((e, i) => {
                        const dupa = (e.at.getTime() - start) / 1000;
                        const estePagina = e.type === "pagina";
                        return (
                          <li
                            key={i}
                            className={`flex flex-wrap gap-x-3 font-sans text-[0.75rem] ${
                              estePagina ? "pt-2" : ""
                            }`}
                          >
                            <span className="w-[6.5rem] shrink-0 tabular-nums text-ink-muted">
                              {ora.format(e.at)} · +{formateazaDurata(dupa)}
                            </span>
                            <span
                              className={`w-[9.5rem] shrink-0 ${
                                estePagina
                                  ? "font-medium text-periwinkle"
                                  : "text-ink-muted"
                              }`}
                            >
                              {TRACK_LABELS[e.type as TrackType] ?? e.type}
                            </span>
                            <span
                              className={`min-w-0 break-words ${
                                estePagina ? "font-medium text-ink" : "text-ink-soft"
                              }`}
                            >
                              {estePagina
                                ? `${e.path}${e.detail ? ` · ${e.detail}` : ""}`
                                : e.detail}
                            </span>
                          </li>
                        );
                      })}
                      {(v.referrer || v.campaign || v.browser) && (
                        <li className="pt-2 font-sans text-[0.72rem] text-ink-muted">
                          {v.referrer ? `Venit de pe ${v.referrer}` : "Venit direct"}
                          {v.campaign ? ` · campania ${v.campaign}` : ""}
                          {v.browser ? ` · ${v.browser}` : ""}
                          {v.country ? ` · ${v.country}` : ""}
                        </li>
                      )}
                    </ol>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
