import "server-only";

import { db } from "@/lib/db";
import {
  ABOUT,
  APPROACH,
  AUDIENCES,
  FAQ,
  FORMATS,
  PRICE,
  SERVICES,
  SITE,
  TESTS,
} from "@/content/site";

/* ----------------------------------------------------------------------------
   Ana — asistenta virtuală a cabinetului.

   Răspunde la întrebările obișnuite ale vizitatorilor (preț, durată, online,
   prima ședință, confidențialitate, servicii) și îi îndrumă spre o ședință sau
   spre un telefon. Nu face terapie, nu pune diagnostice.

   Tot ce știe vine din src/content/site.ts și din serviciile din baza de date,
   deci răspunsurile urmează automat orice schimbare de text sau de preț.

   O conversație are cel mult ANA_MAX_INTREBARI întrebări; după aceea Ana doar
   recomandă programarea sau apelul. Limita se verifică și aici, pe server,
   nu doar în interfață.
   -------------------------------------------------------------------------- */

const CHEIE = process.env.OPENAI_API_KEY;
const MODEL = process.env.ANA_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";

export const ANA_MAX_INTREBARI = 15;
export const anaActiva = Boolean(CHEIE);

export type Replica = { role: "user" | "assistant"; content: string };

/* Serviciile și prețurile, din baza de date. Le ținem cinci minute, ca să nu
   întrebăm baza de date la fiecare mesaj. */
let cacheServicii: { la: number; text: string } | null = null;

async function serviciiText(): Promise<string> {
  if (cacheServicii && Date.now() - cacheServicii.la < 5 * 60_000) return cacheServicii.text;
  try {
    const servicii = await db.service.findMany({
      where: { active: true },
      orderBy: { position: "asc" },
      select: { name: true, duration: true, price: true, description: true },
    });
    const text = servicii
      .map(
        (s) =>
          `- ${s.name}: ${Math.round(s.price / 100)} lei, ${s.duration} de minute` +
          (s.description ? `. ${s.description}` : ""),
      )
      .join("\n");
    cacheServicii = { la: Date.now(), text };
    return text;
  } catch {
    // Fără baza de date, rămâne prețul standard din site.ts
    return `- Ședință de psihoterapie: ${PRICE.standard} ${PRICE.currency}, 50 de minute`;
  }
}

function cunostinte(servicii: string): string {
  const linii = (arr: readonly string[]) => arr.map((x) => `- ${x}`).join("\n");
  return `
DESPRE CABINET
${SITE.name}, ${SITE.role}. Cabinet în ${SITE.city}, ședințe în cabinet și online.
${ABOUT.paragraphs.join("\n")}
Formare și acreditări:
${linii(ABOUT.credentials)}

CUI SE ADRESEAZĂ
${AUDIENCES.items.map((a) => `- ${a.title}: ${a.description}`).join("\n")}

SERVICII (descriere)
${SERVICES.items.map((s) => `- ${s.title} (${s.audience}): ${s.description} Ajută în situații precum: ${s.situatii.join("; ")}.`).join("\n")}

TARIFE ȘI DURATE (date reale, din sistemul de programări)
${servicii}
Plata se poate face online, cu cardul, la programare.

FORMAT
${FORMATS.items.map((f) => `- ${f.title}: ${f.description} ${f.points.join("; ")}.`).join("\n")}

CUM LUCREAZĂ
${APPROACH.steps.map((s) => `- ${s.title}: ${s.description}`).join("\n")}
${APPROACH.values.map((v) => `- ${v.title}: ${v.description}`).join("\n")}

ÎNTREBĂRI FRECVENTE
${FAQ.items.map((f) => `Î: ${f.q}\nR: ${f.a}`).join("\n")}

EVALUARE PSIHOLOGICĂ GRATUITĂ
${TESTS.description} Se face la [Evaluarea gratuită](/evaluare-gratuita). E un chestionar de reflecție, nu un test psihologic acreditat; interpretarea e gratuită.

GHIDUL PRACTIC DESPRE DIVORȚ
Un ghid de 63 de pagini de psihoeducație (prevenție, separare, copii, viața de după), în PDF. Se găsește la [Ghidul despre divorț](/consiliere) și se poate cumpăra și din rezultatul evaluării gratuite.

PROGRAM ȘI CONTACT
${SITE.schedule.map((s) => `- ${s.days}: ${s.hours}`).join("\n")}
Telefon: ${SITE.phone}. Email: ${SITE.email}.
${SITE.addressNote}
`.trim();
}

function sistem(servicii: string, intrebarea: number): string {
  const ramase = ANA_MAX_INTREBARI - intrebarea;
  const final =
    ramase <= 0
      ? "ACEASTA E ULTIMA ÎNTREBARE A CONVERSAȚIEI. Răspunde scurt, apoi încheie cald: spune că pentru restul cel mai potrivit e o discuție directă cu Liliana și pune linkurile [Programează o ședință](/programari) și [Sună acum](tel:" + SITE.phoneHref + ")."
      : ramase <= 3
        ? `Mai sunt ${ramase} întrebări în conversația asta. Începe să îndrumi omul, firesc, spre o ședință sau un telefon.`
        : "";

  return `Ești Ana, asistenta virtuală a cabinetului de psihologie al Lilianei Jgheban. Ești un program, nu un om, și nu ești psiholog; dacă te întreabă, spui asta deschis și cu blândețe.

CUM VORBEȘTI
- În română, la „tu", cald, calm și simplu, ca o recepționeră atentă a unui cabinet liniștit. Fără emoji, fără entuziasm fals, fără clișee de tipul „Sunt aici să te ajut!".
- Scurt: 2-4 fraze. Un singur paragraf, cel mult două. Fără liste lungi.
- Variază formulările; nu începe două răspunsuri la fel.
- Nu folosi niciodată linia de pauză (— sau –). Leagă ideile cu virgule, puncte sau două puncte.
- Nu știi dacă vorbești cu un bărbat sau cu o femeie: folosește formulări neutre („e firesc să fii îngrijorat sau îngrijorată" devine „e firesc să te îngrijoreze"), nu ghici genul. Evită adjectivele care arată genul (copleșit/copleșită, sigur/sigură).

CE FACI
- Răspunzi la întrebările obișnuite despre cabinet: tarife, durată, online sau în cabinet, prima ședință, confidențialitate, servicii, program, cum te programezi. Folosești DOAR informațiile de mai jos. Dacă nu știi ceva, spui simplu că nu știi și că Liliana îi poate răspunde la telefon.
- Când omul povestește ce îl frământă, îl asculți: recunoști pe scurt ce simte, fără să analizezi și fără sfaturi terapeutice, apoi îi spui ce serviciu i s-ar potrivi (numele exact din listă, cu prețul) și îl inviți să se programeze.
- Recomanzi o ședință ori de câte ori are sens, dar nu la fiecare mesaj și fără presiune. Când o recomanzi, pune mereu linkul [Programează-te aici, în chat](programare).
- Te poți ocupa chiar tu de programare: când omul vrea să se programeze sau întreabă de ore libere, pune linkul [Programează-te aici, în chat](programare). Se deschide un formular scurt chiar în conversație (serviciu, zi, oră, date de contact). Nu îi cere tu numele, telefonul sau emailul: le completează în formular, iar ele merg direct la Liliana. Nu spune că nu ai acces la ore și nu trimite la calendarul de pe site: spune simplu că își poate alege ziua și ora chiar aici, în formular.

LINKURI: le scrii în format markdown, doar pe acestea, exact așa:
[Programează-te aici, în chat](programare) · [Programează o ședință](/programari) · [Sună acum](tel:${SITE.phoneHref}) · [Scrie pe WhatsApp](whatsapp) · [Servicii](/#servicii) · [Despre Liliana](/#despre) · [Întrebări frecvente](/#intrebari) · [Contact](/#contact) · [Evaluarea gratuită](/evaluare-gratuita) · [Ghidul despre divorț](/consiliere) · [Blog](/blog)
Nu inventa alte adrese și nu scrie linkuri cu http.

CE NU FACI
- Nu pui diagnostice, nu faci terapie prin chat, nu dai sfaturi medicale, de medicație sau juridice. Spui cu blândețe că astea se discută într-o ședință.
- Nu ceri date personale, de sănătate sau de card. Dacă omul începe să dea detalii intime, îi spui cu grijă că e mai bine să le păstreze pentru ședință, unde sunt confidențiale.
- Nu promiți rezultate și nu inventezi informații (adresa exactă, formări, prețuri care nu sunt în listă).
- La subiecte fără legătură cu cabinetul, răspunzi într-o frază și revii firesc la ce îl poate ajuta.

SIGURANȚĂ, REGULA CEA MAI IMPORTANTĂ
Dacă omul spune sau lasă să se înțeleagă că se gândește să își facă rău, să își ia viața, că e în pericol sau că cineva îi face rău acum: nu mai vorbi despre servicii sau prețuri. Spune-i cu căldură că contează și că merită ajutor chiar acum, și dă-i numerele: 112 pentru urgențe; Telefonul Sufletului, 116 123, gratuit; linia de prevenție a suicidului, 0800 801 200, gratuit. Spune că acest chat și cabinetul nu sunt un serviciu de urgență. Abia la final, și doar dacă e potrivit, spune că Liliana îl poate sprijini ulterior.

INFORMAȚIILE CABINETULUI
${cunostinte(servicii)}

STADIUL CONVERSAȚIEI
Aceasta e întrebarea ${intrebarea} din ${ANA_MAX_INTREBARI}. ${final}`;
}

/* Semne de criză — dacă apar, le spunem explicit modelului, ca să nu depindem
   doar de cât de atent citește el. */
const CRIZA =
  /sinucid|suicid|s[aă]-?mi iau via[tț]a|s[aă] m[aă] omor|nu mai vreau s[aă] (tr[aă]iesc|exist)|s[aă]-?mi fac r[aă]u|m[aă] tai|automutil|vreau s[aă] mor/i;

/* Socoteala tokenurilor, ca să știm cât costă Ana. */
const consum = { raspunsuri: 0, intrare: 0, iesire: 0 };

function noteaza(u: { prompt_tokens?: number; completion_tokens?: number }) {
  consum.raspunsuri += 1;
  consum.intrare += u.prompt_tokens ?? 0;
  consum.iesire += u.completion_tokens ?? 0;
  console.log(
    `[ana] intrare ${u.prompt_tokens ?? 0}, ieșire ${u.completion_tokens ?? 0} | de la pornire: ` +
      `${consum.raspunsuri} răspunsuri, ${consum.intrare} intrare, ${consum.iesire} ieșire`,
  );
}

/** Curăță istoricul primit din browser: doar roluri valide, texte scurtate. */
export function curataIstoric(brut: unknown): Replica[] {
  if (!Array.isArray(brut)) return [];
  return brut
    .filter(
      (m): m is Replica =>
        !!m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    // o întrebare în plus față de limită, ca ruta să o poată vedea și refuza
    .slice(-(2 * ANA_MAX_INTREBARI + 1))
    .map((m) => ({ role: m.role, content: m.content.slice(0, 800) }));
}

/**
 * Răspunsul Anei, bucată cu bucată, pe măsură ce modelul îl scrie.
 * Întoarce un flux de text simplu, gata de trimis în browser.
 */
export async function raspundeAna(istoric: Replica[]): Promise<ReadableStream<Uint8Array>> {
  if (!CHEIE) throw new Error("Ana nu e activată (lipsește cheia OpenAI).");

  const intrebarea = istoric.filter((m) => m.role === "user").length;
  const ultima = istoric[istoric.length - 1]?.content ?? "";
  let system = sistem(await serviciiText(), intrebarea);
  if (CRIZA.test(ultima)) {
    system +=
      "\n\nATENȚIE: ultimul mesaj conține semne de criză. Aplică acum regula de SIGURANȚĂ, înaintea oricărui alt lucru.";
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${CHEIE}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: system }, ...istoric],
      temperature: 0.7,
      presence_penalty: 0.3,
      frequency_penalty: 0.3,
      max_tokens: 320,
      stream: true,
      stream_options: { include_usage: true },
    }),
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok || !res.body) {
    const detaliu = await res.text().catch(() => "");
    throw new Error(`OpenAI a răspuns ${res.status}. ${detaliu.slice(0, 200)}`);
  }

  const cititor = res.body.getReader();
  const dec = new TextDecoder();
  const enc = new TextEncoder();
  let rest = "";

  return new ReadableStream<Uint8Array>({
    async pull(ctrl) {
      for (;;) {
        const { done, value } = await cititor.read();
        if (done) {
          ctrl.close();
          return;
        }
        rest += dec.decode(value, { stream: true });
        const linii = rest.split("\n");
        rest = linii.pop() ?? "";
        let trimis = false;
        for (const linie of linii) {
          const l = linie.trim();
          if (!l.startsWith("data:")) continue;
          const brut = l.slice(5).trim();
          if (!brut || brut === "[DONE]") continue;
          try {
            const j = JSON.parse(brut);
            const t = j?.choices?.[0]?.delta?.content;
            if (t) {
              ctrl.enqueue(enc.encode(t));
              trimis = true;
            }
            if (j?.usage) noteaza(j.usage);
          } catch {
            /* bucată incompletă — vine întreagă la runda următoare */
          }
        }
        if (trimis) return;
      }
    },
    cancel() {
      cititor.cancel().catch(() => {});
    },
  });
}
