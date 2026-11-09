import Link from "next/link";

import { UrmarireAdmin } from "@/components/admin/UrmarireAdmin";
import { TZ } from "@/lib/tz";
import {
  durata,
  formateazaDurata,
  incarcaVizite,
  sinteza,
  sursa,
  sursaOmului,
} from "@/lib/vizite";
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

/** Verdict scurt pentru vitezele Core Web Vitals. */
function viteza(nume: "lcp" | "inp" | "cls", v: number) {
  const praguri = { lcp: [2500, 4000], inp: [200, 500], cls: [100, 250] }[nume];
  if (!v) return { text: "—", clasa: "text-ink-muted" };
  const valoare = nume === "cls" ? (v / 1000).toFixed(2) : `${(v / 1000).toFixed(2)}s`;
  if (v <= praguri[0]) return { text: valoare, clasa: "text-periwinkle" };
  if (v <= praguri[1]) return { text: valoare, clasa: "text-sage" };
  return { text: valoare, clasa: "text-clay" };
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

  const { vizite, evenimente, oameni, conturi } = await incarcaVizite(new Date(de));
  const s = sinteza(vizite, evenimente, oameni, acum);
  const maxZi = Math.max(1, ...s.peZile.map(([, n]) => n));
  const palnieMax = s.palnie[0]?.n || 1;

  /* Oamenii care s-au întors, cei mai activi întâi. */
  const revenitii = [...oameni].filter((o) => o.visits > 1).sort((a, b) => b.visits - a.visits);

  return (
    <div>
      <UrmarireAdmin />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink lg:text-4xl">Vizite</h1>
          <p className="mt-2.5 max-w-2xl font-sans text-[0.88rem] text-ink-soft">
            Statistici proprii, ținute pe serverul nostru. Cine acceptă cookie-urile e
            recunoscut când se întoarce; cine refuză rămâne o vizită anonimă, fără cookie
            și fără adresă IP. Pagina se reîmprospătează singură la 20 de secunde, iar
            vizitele făcute din acest browser nu se mai numără.
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
              {v.visitNo > 1 ? ` · a ${v.visitNo}-a vizită` : ""}
            </span>
          );
        })}
      </div>

      {/* Cifrele perioadei */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <Cifra
          eticheta="Vizite"
          valoare={s.total}
          nota={`${s.reveniri} ${s.reveniri === 1 ? "revenire" : "reveniri"} · ${procent(
            s.cuInteres,
            s.total,
          )} au stat peste 10s`}
        />
        <Cifra
          eticheta="Timp activ mediu"
          valoare={formateazaDurata(s.timpActivMediu)}
          nota={`din ${formateazaDurata(s.durataMedie)} cu fila deschisă`}
        />
        <Cifra
          eticheta="Programări trimise"
          valoare={s.programari}
          accent="text-periwinkle"
          nota={`${procent(s.programari, s.total)} din vizite · ${s.programariIncepute} au început`}
        />
        <Cifra
          eticheta="Telefon și WhatsApp"
          valoare={s.telefon + s.whatsapp}
          accent="text-clay"
          nota={`${s.telefon} apel, ${s.whatsapp} WhatsApp, ${s.email + s.formulare} email`}
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

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <Cifra
          eticheta="Au acceptat cookie-urile"
          valoare={procent(s.acordAcceptat, s.total)}
          nota={`${s.acordAcceptat} da · ${s.acordRefuzat} nu · ${s.acordFara} n-au ales`}
        />
        <Cifra
          eticheta="Oameni recunoscuți"
          valoare={s.oameni}
          nota={`${s.oameniCuProgramare} s-au programat${
            s.vizitePanaLaProgramare
              ? ` · după ${s.vizitePanaLaProgramare.toFixed(1)} vizite`
              : ""
          }`}
        />
        <Cifra
          eticheta="Derulare medie"
          valoare={`${Math.round(s.derulareMedie)}%`}
          nota={`${s.clicuriMedii.toFixed(1)} clicuri pe vizită`}
        />
        <Cifra
          eticheta="Programări lăsate"
          valoare={s.abandonuri}
          accent={s.abandonuri ? "text-clay" : "text-ink"}
          nota="au început și n-au terminat"
        />
        <Cifra
          eticheta="Viteza paginii"
          valoare={viteza("lcp", s.lcp).text}
          accent={viteza("lcp", s.lcp).clasa}
          nota={`răspuns ${viteza("inp", s.inp).text} · sărituri ${viteza("cls", s.cls).text}`}
        />
        <Cifra
          eticheta="Erori în pagină"
          valoare={s.erori}
          accent={s.erori ? "text-clay" : "text-ink"}
          nota={`${s.nervoase.length} locuri cu clicuri nervoase`}
        />
      </div>

      {/* Pâlnia */}
      <div className="mt-4 bg-cream p-5">
        <h2 className="font-display text-lg text-ink">De la vizită la programare</h2>
        <ul className="mt-4 space-y-2">
          {s.palnie.map((p, i) => (
            <li key={p.eticheta} className="relative overflow-hidden px-4 py-2.5">
              <span
                className="absolute inset-y-0 left-0 bg-periwinkle-pale"
                style={{ width: `${(p.n / palnieMax) * 100}%` }}
              />
              <span className="relative flex items-center justify-between gap-4 font-sans text-[0.8rem]">
                <span className="text-ink">{p.eticheta}</span>
                <span className="shrink-0 text-ink-muted">
                  {p.n}
                  {i > 0 && s.palnie[i - 1].n > 0 && (
                    <span className="ml-2 text-periwinkle">
                      {procent(p.n, s.palnie[i - 1].n)} din pasul dinainte
                    </span>
                  )}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Din reclame */}
      <div className="mt-4 bg-cream p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-lg text-ink">Cât vine din reclame</h2>
          <p className="font-sans text-[0.72rem] text-ink-muted">
            vizite venite dintr-un clic pe reclamă (gclid sau cpc)
          </p>
        </div>

        {s.reclame.vizite === 0 ? (
          <p className="mt-3 font-sans text-[0.8rem] text-ink-muted">
            Nicio vizită din reclame în perioada aleasă. Dacă tocmai au pornit
            anunțurile, primele clicuri apar aici în câteva minute.
          </p>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Cifra
                eticheta="Vizite din reclame"
                valoare={s.reclame.vizite}
                accent="text-clay"
                nota={`${s.reclame.procentDinTot}% din tot traficul`}
              />
              <Cifra
                eticheta="Programări din reclame"
                valoare={s.reclame.programari}
                accent="text-periwinkle"
                nota={`${procent(s.reclame.programari, s.reclame.vizite)} din ele · ${
                  s.reclame.programariIncepute
                } au început`}
              />
              <Cifra
                eticheta="Apeluri și WhatsApp"
                valoare={s.reclame.telefon}
                nota={`${s.reclame.ana} i-au scris Anei`}
              />
              <Cifra
                eticheta="Stau în medie"
                valoare={formateazaDurata(s.reclame.timpActiv)}
                nota={`restul site-ului: ${formateazaDurata(s.reclame.timpActivOrganic)}`}
              />
            </div>

            <p className="mt-3 font-sans text-[0.78rem] text-ink-soft">
              Pentru comparație, restul traficului (căutări, direct, recomandări):{" "}
              <strong className="font-medium text-ink">
                {s.reclame.viziteOrganice} vizite
              </strong>{" "}
              și{" "}
              <strong className="font-medium text-ink">
                {s.reclame.programariOrganice} programări
              </strong>{" "}
              ({procent(s.reclame.programariOrganice, s.reclame.viziteOrganice)}).
            </p>

            <div className="mt-4 grid gap-3 lg:grid-cols-4">
              <Clasament
                titlu="Campanii"
                rows={s.reclame.campanii}
                gol="Fără nume de campanie — vezi nota de mai jos."
                cate={8}
              />
              <Clasament
                titlu="Cuvinte căutate"
                rows={s.reclame.cuvinte}
                gol="Fără cuvinte — vezi nota de mai jos."
                cate={8}
              />
              <Clasament
                titlu="Anunțul pe care s-a dat clic"
                rows={s.reclame.anunturi}
                gol="Fără anunț — vezi nota de mai jos."
                cate={8}
              />
              <Clasament
                titlu="Pe ce pagină intră"
                rows={s.reclame.pagini}
                gol="—"
                cate={8}
              />
            </div>

            {s.reclame.campanii.length === 0 && (
              <p className="mt-3 font-sans text-[0.72rem] text-ink-muted">
                Google trimite singur doar „a venit dintr-o reclamă". Ca să apară și
                campania, cuvântul căutat și anunțul, în contul Google Ads trebuie pus
                sufixul de urmărire:{" "}
                <code className="text-ink-soft">
                  utm_source=google&amp;utm_medium=cpc&amp;utm_campaign=
                  {"{campaignid}"}&amp;utm_term={"{keyword}"}&amp;utm_content=
                  {"{creative}"}
                </code>
              </p>
            )}
          </>
        )}
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
          titlu="Ultima pagină înainte de plecare"
          rows={s.ultimaPagina}
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

      {/* Oamenii care se întorc */}
      <div className="mt-4 bg-cream p-5">
        <h2 className="font-display text-lg text-ink">Oameni care se întorc</h2>
        <p className="mt-1.5 font-sans text-[0.78rem] text-ink-muted">
          Doar cei care au acceptat cookie-urile. „Prima sursă" e reclama sau linkul
          care i-a adus întâia oară, chiar dacă pe urmă au venit direct.
        </p>
        {revenitii.length === 0 ? (
          <p className="mt-4 font-sans text-[0.8rem] text-ink-muted">
            Încă nu s-a întors nimeni (sau nimeni n-a acceptat cookie-urile).
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[34rem]">
              <thead>
                <tr className="border-b border-ink/10">
                  {["Vizite", "Prima sursă", "Prima pagină", "Prima dată", "Ultima dată", "Programare"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`px-3 py-2.5 font-sans text-[0.74rem] tracking-[0.02em] text-ink-muted ${
                          i === 0 ? "text-left" : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {revenitii.slice(0, 40).map((o) => {
                  const cont = o.userId ? conturi.get(o.userId) : null;
                  return (
                    <tr key={o.id} className="border-b border-ink/5 last:border-0">
                      <td className="px-3 py-2.5 font-sans text-[0.8rem] font-medium text-ink">
                        {o.visits}
                      </td>
                      <td className="px-3 py-2.5 font-sans text-[0.8rem] text-ink-soft">
                        {sursaOmului(o)}
                        {o.firstCampaign ? ` · ${o.firstCampaign}` : ""}
                      </td>
                      <td className="px-3 py-2.5 font-sans text-[0.8rem] text-ink-soft">
                        {o.firstLanding}
                      </td>
                      <td className="px-3 py-2.5 font-sans text-[0.78rem] text-ink-muted">
                        {ziScurt.format(o.firstSeenAt)}
                      </td>
                      <td className="px-3 py-2.5 font-sans text-[0.78rem] text-ink-muted">
                        {ziOra.format(o.lastSeenAt)}
                      </td>
                      <td className="px-3 py-2.5 font-sans text-[0.78rem]">
                        {o.booked ? (
                          <span className="text-periwinkle">
                            da{o.visitsToBook ? `, la vizita ${o.visitsToBook}` : ""}
                          </span>
                        ) : (
                          <span className="text-ink-muted">—</span>
                        )}
                        {cont ? ` · ${cont.name}` : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tehnic */}
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <Clasament
          titlu="Dispozitiv și sistem"
          rows={[...s.dispozitive, ...s.sisteme]}
          gol="Nicio vizită încă."
        />
        <Clasament titlu="De unde sunt" rows={s.orase} gol="Nicio vizită încă." />
        <div className="space-y-3">
          <Clasament titlu="Limba browserului" rows={s.limbi} gol="—" cate={5} />
          <Clasament titlu="Conexiune" rows={s.conexiuni} gol="—" cate={5} />
        </div>
      </div>

      {/* Ce nu merge */}
      {(s.nervoase.length > 0 ||
        s.pagini404.length > 0 ||
        s.eroriLista.length > 0 ||
        s.abandonLista.length > 0) && (
        <div className="mt-4 grid gap-3 lg:grid-cols-4">
          <Clasament
            titlu="Clicuri nervoase"
            rows={s.nervoase}
            gol="—"
            cate={6}
          />
          <Clasament titlu="Pagini inexistente" rows={s.pagini404} gol="—" cate={6} />
          <Clasament titlu="Erori în pagină" rows={s.eroriLista} gol="—" cate={6} />
          <Clasament
            titlu="Unde lasă programarea"
            rows={s.abandonLista}
            gol="—"
            cate={6}
          />
        </div>
      )}

      {(s.campanii.length > 0 || s.copieri.length > 0) && (
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {s.campanii.length > 0 && (
            <Clasament titlu="Campanii" rows={s.campanii} gol="—" />
          )}
          {s.copieri.length > 0 && (
            <Clasament titlu="De unde copiază text" rows={s.copieri} gol="—" />
          )}
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
                        {formateazaDurata(v.activeSec || durata(v))}
                      </span>
                      {v.visitNo > 1 && (
                        <span className="border border-ink/15 px-2 py-0.5 text-[0.68rem] text-ink-soft">
                          a {v.visitNo}-a vizită
                        </span>
                      )}
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
                        const esteProblema = ["rage", "eroare", "abandon", "p404"].includes(
                          e.type,
                        );
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
                                  : esteProblema
                                    ? "text-clay"
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

                      <li className="mt-2 border-t border-ink/10 pt-2 font-sans text-[0.72rem] text-ink-muted">
                        {v.referrer ? `Venit de pe ${v.referrer}` : "Venit direct"}
                        {v.campaign ? ` · campania ${v.campaign}` : ""}
                        {` · ${[v.browser, v.os].filter(Boolean).join(" pe ") || "browser necunoscut"}`}
                        {v.viewW ? ` · ecran ${v.viewW}px` : ""}
                        {v.lang ? ` · ${v.lang}` : ""}
                        {v.connection ? ` · ${v.connection}` : ""}
                        {v.maxScroll ? ` · a derulat ${v.maxScroll}%` : ""}
                        {v.clicks ? ` · ${v.clicks} clicuri` : ""}
                        {v.exitPath ? ` · a plecat de pe ${v.exitPath}` : ""}
                        {v.consent
                          ? ` · cookie-uri: ${v.consent}`
                          : " · n-a ales la cookie-uri"}
                        {v.ip ? ` · ${v.ip}` : ""}
                      </li>
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
