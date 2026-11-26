import "server-only";

import { GHID_CUNOSTINTE } from "@/content/ghid-cunostinte";
import { NIVELURI, areCopiiMinori, calculeaza, raspunsuriText, type Chestionar, type Raspunsuri } from "./chestionare";
import { normalizeazaRaportParte, type RaportParte } from "./raport";
import type { Parte } from "./parti";

/* ----------------------------------------------------------------------------
   Raportul personal care vine cu o parte a ghidului, scris de AI.

   Modelul primește scorurile din chestionar, răspunsurile și principiile din
   partea cumpărată și întoarce raportul pe secțiuni, în JSON. NU pune
   diagnostice și nu dă sfaturi juridice. Scorurile nu depind de AI: dacă
   apelul pică, pagina rămâne utilizabilă și raportul se poate regenera.
   -------------------------------------------------------------------------- */

const CHEIE = process.env.OPENAI_API_KEY;
const MODEL = process.env.KIT_OPENAI_MODEL || "gpt-4.1";

/** Doar concluziile din partea cumpărată (din secțiunile I–VI pe care le
    cuprinde), ca raportul să rămână în subiect. */
function cunostinteParte(p: Parte): string {
  const bucati = p.romane.map((rom) => {
    const start = GHID_CUNOSTINTE.indexOf(`### PARTEA ${rom} `);
    if (start < 0) return "";
    const urm = GHID_CUNOSTINTE.indexOf("### ", start + 4);
    return GHID_CUNOSTINTE.slice(start, urm < 0 ? undefined : urm).trim();
  });
  return bucati.every(Boolean) ? bucati.join("\n\n") : GHID_CUNOSTINTE;
}

function sistem(c: Chestionar, p: Parte, cuCopii: boolean) {
  return `Ești alături de Liliana Jgheban, psihoterapeut integrativ și psiholog clinician, și scrii raportul personal care însoțește „Partea ${p.nr}: ${p.titlu}” din ghidul ei „Ghid practic despre cuplu, divorț și familie”. Persoana a completat un chestionar de 12 afirmații, grupate pe 3 zone (${c.zone.map((z) => z.nume).join(", ")}), cu răspunsuri de la „Deloc” la „Întru totul”. Primești scorurile (0 = liniște, 100 = foarte greu), răspunsurile și, uneori, situația descrisă cu cuvintele ei.

CUM SCRII
- În română, la persoana a doua („tu”), cald, clar și fără judecată, ca un psiholog care a citit cu atenție răspunsurile.
- Personal: leagă fiecare observație de răspunsurile concrete, citând ce a ales (de exemplu „ai spus că certurile se învârt în jurul acelorași teme, dar că știi ce le declanșează”). Folosește contrastele dintre răspunsuri. Evită generalitățile care s-ar potrivi oricui.
- Dacă a descris situația cu cuvintele ei, pornește de acolo și întoarce-te la ea.
- Explică de ce: pentru observațiile importante, spune pe scurt mecanismul psihologic din spate, sprijinit pe principiile de mai jos.
- Rămâi în subiectul acestei părți a ghidului. Poți parafraza principiile; nu inventa studii, cifre sau citate.
- NU pui diagnostice, NU dai sfaturi juridice sau medicale, NU promiți rezultate, NU îi spui ce decizie să ia despre relație.
- Nu știi genul persoanei și nici pe al partenerului: folosește formulări neutre, fără adjective sau participii care arată genul (nu „ești obosit/obosită”, ci „oboseala se simte”). Spune „partenerul” sau „fostul partener”.
- Dacă persoana a spus că îi este frică de partener, începe rezumatul cu siguranța ei: ce înseamnă, că nu e vina ei și că poate suna la 112 sau la 0800 500 333 (linia gratuită pentru victimele violenței domestice).
- Nu folosi niciodată linia de pauză (— sau –); leagă ideile cu virgule, puncte sau două puncte. Fără emoji, fără titluri în markdown, fără liste în interiorul textelor.
- Paragrafele se despart printr-un rând gol (\\n\\n).

CE ÎNTORCI: un singur obiect JSON, exact cu aceste câmpuri:
{
  "titlu": "o singură frază-cheie, blândă și personală, care surprinde unde se află persoana (max 110 caractere)",
  "rezumat": "3 paragrafe, 250-330 de cuvinte: (1) ce arată rezultatul, pe înțelesul ei; (2) ce pare să conteze cel mai mult acum, legat de situația ei; (3) ce ar fi cel mai util să facă mai întâi",
  "zone": [ { "cheie": "${c.zone.map((z) => z.cheie).join("|")}", "text": "3 paragrafe, 170-230 de cuvinte: (1) ce arată cele 4 răspunsuri din zonă, citate concret; (2) ce înseamnă psihologic și de ce contează, legat de principiile părții; (3) ce poate face concret, în viața de zi cu zi", "deRetinut": "o propoziție memorabilă, max 140 de caractere" } ],
  "puncteForte": ["4 resurse concrete, fiecare 2-3 fraze: ce e, din ce răspuns reiese și cum se poate sprijini pe ea"],
  "atentie": ["4 lucruri la care să fie atentă, fiecare 2-3 fraze: ce e, de ce contează și un prim gest concret, formulate blând"],
  "copii": "${cuCopii ? "3 paragrafe, 180-240 de cuvinte, despre cum trăiesc probabil copiii situația (după vârste, dacă le știi), ce semnale să urmărească și ce îi protejează concret" : "șir gol"}",
  "plan": [ { "titlu": "Săptămâna 1: … (un titlu scurt, care spune ținta săptămânii)", "pasi": ["3 pași concreți, mici și realiști, fiecare 1-2 fraze"] } ],
  "reflectie": ["5 întrebări deschise, blânde, legate de rezultatele ei, la care să reflecteze sau pe care să le poarte într-o discuție"],
  "capitole": [ { "titlu": "numele exact al unui capitol din această parte", "deCe": "1-2 fraze: de ce să-l citească, legat de răspunsurile ei" } ],
  "incheiere": "un paragraf cald, 90-130 de cuvinte, care rezumă drumul, încurajează sprijinul de specialitate când e nevoie și se încheie cu o propoziție care spune că acest raport e psihoeducație și nu înlocuiește o ședință de terapie"
}
"zone" are exact ${c.zone.length} elemente, în ordinea: ${c.zone.map((z) => z.cheie).join(", ")}. "plan" are exact 4 săptămâni. "capitole" cuprinde toate capitolele părții (${p.capitole.map((t) => `„${t}”`).join(", ")}), în ordinea în care îi folosesc cel mai mult acum. În total, raportul are în jur de 1.800-2.400 de cuvinte.

PRINCIPIILE DIN ACEASTĂ PARTE A GHIDULUI:
${cunostinteParte(p)}`;
}

export type RezultatAI = { ok: true; raport: RaportParte } | { ok: false; error: string };

export async function genereazaRaportParte(c: Chestionar, p: Parte, r: Raspunsuri): Promise<RezultatAI> {
  if (!CHEIE) return { ok: false, error: "Interpretarea AI nu e activată (lipsește cheia)." };
  const rez = calculeaza(c, r);
  if (!rez) return { ok: false, error: "Chestionarul nu e complet." };

  const cuCopii = areCopiiMinori(r) || p.nr === 4 || p.nr === 5;
  const scoruri = rez.zone.map((z) => `- ${z.nume}: ${z.pct}/100 (${NIVELURI[z.nivel].nume})`).join("\n");

  const mesaj = `REZULTATUL CALCULAT
Cât de greu e acum, în total: ${rez.indice}/100 (${NIVELURI[rez.nivel].nume})
Pe zone (0 = liniște, 100 = foarte greu):
${scoruri}
${rez.siguranta ? "\nATENȚIE: persoana a spus că i-a fost frică de partener sau de fostul partener.\n" : ""}${
    p.nr !== c.parte ? `\nA pornit de la chestionarul pentru partea ${c.parte}, dar a ales partea ${p.nr}. Leagă rezultatele de partea aleasă.\n` : ""
  }
RĂSPUNSURILE EI
(Afirmațiile marcate „despre o resursă” descriu ceva bun: la ele, „Întru totul” e o resursă, nu o problemă.)
${raspunsuriText(c, r)}

Scrie raportul, ca obiect JSON.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${CHEIE}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.7,
        max_tokens: 12000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: sistem(c, p, cuCopii) },
          { role: "user", content: mesaj },
        ],
      }),
      signal: AbortSignal.timeout(170_000),
    });

    if (!res.ok) {
      const detaliu = await res.text().catch(() => "");
      return { ok: false, error: `OpenAI a răspuns ${res.status}. ${detaliu.slice(0, 200)}` };
    }

    const data = await res.json();
    const continut = data?.choices?.[0]?.message?.content;
    const motiv = data?.choices?.[0]?.finish_reason;
    if (!continut) return { ok: false, error: "Răspuns gol de la model." };
    if (motiv === "length") return { ok: false, error: "Raportul a depășit lungimea maximă și a fost tăiat." };

    let brut: unknown;
    try {
      brut = JSON.parse(continut);
    } catch {
      return { ok: false, error: `Modelul nu a întors JSON valid (${motiv}).` };
    }
    const raport = normalizeazaRaportParte(brut, c.zone.map((z) => z.cheie));
    if (!raport) return { ok: false, error: "Raportul primit e incomplet." };
    if (!cuCopii) raport.copii = "";

    const curata = (s: string) => s.replace(/\s+[—–]\s+/g, ", ").replace(/\s*—\s*/g, ", ");
    return { ok: true, raport: JSON.parse(JSON.stringify(raport), (_k, v) => (typeof v === "string" ? curata(v) : v)) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Eroare la apelul AI." };
  }
}
