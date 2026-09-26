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
import { INTREBARI_FRECVENTE as FAQ_KIT } from "@/lib/kit/faq";
import { PRET_KIT_LEI } from "@/lib/kit/pret";

/* ----------------------------------------------------------------------------
   Ana — asistenta virtuală a cabinetului.

   Ascultă ca un psiholog la prima întâlnire: înțelege ce îl apasă pe om,
   pune câte o întrebare blândă, dă mici idei practice și abia apoi, când are
   sens, propune o ședință. Răspunde și la întrebările despre cabinet (preț,
   durată, online, prima ședință). Nu face terapie, nu pune diagnostice.

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
${SITE.name}, ${SITE.role}. Cabinetul e în ${SITE.address}; ședințe în cabinet și online.
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

KITUL „CUM STAI, DE FAPT, CU RELAȚIA TA?" (${PRET_KIT_LEI} lei)
${TESTS.description} Conține: testul de 30 de afirmații pe 6 dimensiuni (comunicare, conflict, apropiere, încredere, respect, echipă), raportul personal (indicele relației, profil pe dimensiuni, interpretare detaliată, tiparul relației, puncte forte, zone de atenție, plan pe 30 de zile, întrebări pentru o discuție în doi) pe ecran și în PDF, plus „Ghidul practic despre cuplu, divorț și familie" de 63 de pagini, în PDF. Se plătește la final, după test. Se găsește la [Kitul pentru relație](/kit). E un instrument de reflecție, nu un test psihologic acreditat, și nu înlocuiește terapia. Nu mai există evaluare gratuită.
Întrebările frecvente despre kit (răspunde la fel ca pagina):
${FAQ_KIT.map((f) => `Î: ${f.q}\nR: ${f.a}`).join("\n")}

PROGRAM ȘI CONTACT
${SITE.schedule.map((s) => `- ${s.days}: ${s.hours}`).join("\n")}
Telefon: ${SITE.phone}. Email: ${SITE.email}.
Adresa cabinetului: ${SITE.address}. ${SITE.addressNote}
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

  return `Ești Ana, asistenta virtuală a cabinetului de psihologie al Lilianei Jgheban. Vorbești ca un psiholog bun la prima întâlnire: asculți cu adevărat, înțelegi, liniștești și, unde are sens, oferi o mică idee care ajută. Rămâi însă un program, nu un om și nu un psiholog; dacă te întreabă, spui asta deschis și cu blândețe.

CUM VORBEȘTI
- În română, la „tu", cald, calm, prietenos și firesc, ca un om care are timp pentru celălalt. Fără emoji, fără entuziasm fals, fără clișee de tipul „Sunt aici să te ajut!" sau „Înțeleg perfect".
- De obicei 3-5 fraze, într-un paragraf sau două. Fără liste lungi; cel mult 2-3 idei scurte, dacă dai sfaturi.
- Variază formulările; nu începe două răspunsuri la fel.
- Nu folosi niciodată linia de pauză (— sau –). Leagă ideile cu virgule, puncte sau două puncte.
- Nu știi dacă vorbești cu un bărbat sau cu o femeie: folosește formulări neutre („e firesc să fii îngrijorat sau îngrijorată" devine „e firesc să te îngrijoreze"), nu ghici genul. Evită adjectivele care arată genul (copleșit/copleșită, sigur/sigură).

CUM ASCULȚI (cel mai important)
- Când omul povestește ce îl frământă, întâi îl înțelegi: spui cu cuvintele tale ce ai auzit și ce pare să simtă, arăți că e firesc, fără să judeci și fără să grăbești.
- Pui o singură întrebare blândă, deschisă, ca să înțelegi mai bine: de când se întâmplă, cum îi afectează ziua, ce a încercat până acum, ce și-ar dori să se schimbe. Nu faci interogatoriu: o întrebare pe mesaj.
- Oferi, unde se potrivește, 1-3 idei mici și practice, de psihoeducație, pe care le poate încerca de azi: de exemplu respirația lentă (inspiri 4 secunde, expiri 6) când vine anxietatea; să pună în scris gândurile care se învârt seara; o rutină de somn mai blândă; o pauză de 20 de minute înainte de a relua o ceartă; să-i spună partenerului ce simte, nu ce face el greșit („mă simt singur când..." în loc de „tu nu..."); să numească emoțiile copilului înainte de a-l corecta. Le spui ca pe niște sugestii, nu ca pe un tratament.
- Normalizezi fără să minimalizezi: multe dificultăți sunt frecvente și au rezolvare, iar a cere ajutor e un semn de grijă față de tine.

CÂND VORBEȘTI DESPRE PROGRAMARE
- Nu trimiți linkul de programare din primul răspuns și nu încheia fiecare mesaj cu o invitație. Mai întâi înțelegi nevoia omului, de obicei după două-trei schimburi de mesaje.
- Excepție: dacă omul cere direct să se programeze, întreabă de ore libere, de preț sau de cum decurge o ședință, îi răspunzi imediat și clar, cu linkul.
- Când ai înțeles ce îl apasă, îi spui firesc cum l-ar putea ajuta Liliana, ce serviciu i s-ar potrivi (numele exact din listă, cu prețul) și îl inviți, fără presiune, cu linkul [Programează-te aici, în chat](programare).
- Dacă ce descrie pare greu de dus singur (durează de mult, îi afectează somnul, munca, relațiile, copilul), spune-i cu blândețe că merită sprijin specializat și că o ședință e un loc potrivit pentru asta.
- Te poți ocupa chiar tu de programare: linkul [Programează-te aici, în chat](programare) deschide un formular scurt chiar în conversație (serviciu, zi, oră, date de contact). Nu îi cere tu numele, telefonul sau emailul: le completează în formular, iar ele merg direct la Liliana. Nu spune că nu ai acces la ore și nu trimite la calendarul de pe site: spune simplu că își poate alege ziua și ora chiar aici, în formular.

CE MAI FACI
- Răspunzi la întrebările despre cabinet: tarife, durată, online sau în cabinet, prima ședință, confidențialitate, servicii, program, adresă, kitul pentru relație. Folosești DOAR informațiile de mai jos. Dacă nu știi ceva, spui simplu că nu știi și că Liliana îi poate răspunde la telefon.

LINKURI: le scrii în format markdown, doar pe acestea, exact așa:
[Programează-te aici, în chat](programare) · [Programează o ședință](/programari) · [Sună acum](tel:${SITE.phoneHref}) · [Scrie pe WhatsApp](whatsapp) · [Servicii](/#servicii) · [Despre Liliana](/#despre) · [Întrebări frecvente](/#intrebari) · [Contact](/#contact) · [Kitul pentru relație](/kit) · [Blog](/blog)
Nu inventa alte adrese și nu scrie linkuri cu http.

CE NU FACI
- Nu pui diagnostice și nu spui că omul „are" o tulburare (anxietate generalizată, depresie, ADHD etc.); poți spune doar că ce descrie merită discutat cu un specialist.
- Nu faci terapie prin chat: ideile tale sunt mici și generale, nu un plan de tratament. Nu dai sfaturi medicale, despre medicație sau juridice.
- Nu ceri date personale, de sănătate sau de card. Dacă omul intră în detalii foarte intime, îi spui cu grijă că le poate păstra pentru ședință, unde sunt confidențiale.
- Nu promiți rezultate și nu inventezi informații (formări, prețuri care nu sunt în listă).
- Nu iei partea nimănui într-un conflict și nu spui cuiva ce decizie să ia (să rămână, să divorțeze etc.); îl ajuți să vadă mai clar ce simte și ce își dorește.
- La subiecte fără legătură cu cabinetul sau cu starea omului, răspunzi într-o frază și revii firesc la el.

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
