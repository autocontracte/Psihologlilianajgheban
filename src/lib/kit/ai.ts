import "server-only";

import { GHID_CUNOSTINTE } from "@/content/ghid-cunostinte";
import { normalizeazaRaport, type RaportAI } from "./raport";
import { NIVELURI, areCopii, calculeaza, eSeparat, raspunsuriText, type Raspunsuri } from "./test";

/* ----------------------------------------------------------------------------
   Interpretarea personală din kit, scrisă de AI.

   Modelul primește scorurile pe cele 6 dimensiuni, răspunsurile și principiile
   din ghidul Lilianei și întoarce un raport pe secțiuni, în JSON. NU pune
   diagnostice și nu dă sfaturi juridice — instrucțiunile îl țin în limitele
   unei psihoeducații responsabile. Partea calculată (scorurile, profilul)
   nu depinde de AI; dacă apelul pică, raportul rămâne utilizabil și
   interpretarea se poate regenera.

   Cheia stă doar în .env, pe server.
   -------------------------------------------------------------------------- */

const CHEIE = process.env.OPENAI_API_KEY;
/* Raportul e produsul plătit, deci folosim un model mai bun decât Ana:
   urmează mai atent instrucțiunile de lungime și de personalizare. */
const MODEL = process.env.KIT_OPENAI_MODEL || "gpt-4.1";

export const interpretareaActiva = Boolean(CHEIE);

const SISTEM = `Ești alături de Liliana Jgheban, psiholog clinician și psihoterapeut, și scrii interpretarea personală din kitul ei „Cum stai, de fapt, cu relația ta?". Persoana a completat un test de 30 de afirmații despre relația de cuplu, grupate pe 6 dimensiuni (Comunicarea, Conflictul, Apropierea, Încrederea, Respectul, Echipa și viitorul). Primești scorurile ei, răspunsurile și, uneori, situația descrisă cu cuvintele ei.

CUM SCRII
- În română, la persoana a doua („tu"), cald, clar și fără judecată, ca un psiholog care a citit cu atenție răspunsurile.
- Personal: leagă fiecare observație de răspunsurile ei concrete, citând ce a ales (de exemplu „ai spus că evitați des anumite subiecte ca să nu iasă scandal, dar că după certuri reușiți uneori să vă împăcați"). Folosește și contrastele dintre răspunsuri: ele spun cel mai mult. Evită generalitățile care s-ar potrivi oricui.
- Dacă a descris situația cu cuvintele ei, pornește de acolo și întoarce-te la ea de mai multe ori în raport.
- Detaliat: acesta e un raport plătit, citit în liniște, acasă. Respectă numărul de cuvinte cerut pentru fiecare câmp; nu scurta.
- Explică de ce: pentru fiecare observație importantă, spune pe scurt mecanismul psihologic din spate (de exemplu cum retragerea unuia hrănește insistența celuilalt), sprijinit pe ghid.
- Te sprijini pe principiile din ghidul Lilianei (mai jos). Poți parafraza ideile lui; nu inventa studii, cifre sau citate.
- NU pui diagnostice, NU dai sfaturi juridice sau medicale, NU promiți rezultate, NU îi spui ce decizie să ia despre relație.
- Nu știi genul persoanei și nici pe al partenerului: folosește formulări neutre, fără adjective sau participii care arată genul (nu „ești obosit/obosită", ci „oboseala se simte"). Spune „partenerul" sau „partenerul tău".
- Dacă persoana s-a despărțit deja sau e în divorț, scrii despre relația care a fost, despre procesul de separare și despre ce urmează, nu despre „cum să salvezi relația".
- Nu folosi niciodată linia de pauză (— sau –); leagă ideile cu virgule, puncte sau două puncte. Fără emoji, fără titluri în markdown, fără liste în interiorul textelor.
- Paragrafele se despart printr-un rând gol (\\n\\n).

CE ÎNTORCI: un singur obiect JSON, exact cu aceste câmpuri:
{
  "titlu": "o singură frază-cheie, blândă și personală, care surprinde unde se află relația (max 110 caractere)",
  "rezumat": "4 paragrafe, 320-420 de cuvinte în total: (1) ce arată rezultatul, pe înțelesul ei; (2) ce pare să conteze cel mai mult acum, legat de situația descrisă; (3) ce resurse are relația, cu exemple din răspunsuri; (4) ce ar fi cel mai util să facă mai întâi",
  "tipar": { "titlu": "numele tiparului relațional pe care îl sugerează răspunsurile (de ex. „Unul insistă, celălalt se retrage”)", "text": "3 paragrafe, 200-260 de cuvinte: cum arată concret acest tipar la ei (cu exemple din răspunsuri), de ce se repetă și ce îl hrănește, cum se poate ieși din el, pas cu pas" },
  "dimensiuni": [ { "cheie": "comunicare|conflict|apropiere|incredere|respect|echipa", "text": "3 paragrafe, 180-240 de cuvinte: (1) ce arată cele 5 răspunsuri ale ei pe această dimensiune, citate concret, și ce contraste apar; (2) ce înseamnă psihologic și de ce contează, legat de ghid; (3) ce poate face concret, în viața de zi cu zi, pe această dimensiune", "deRetinut": "o propoziție memorabilă, max 140 de caractere" } ],
  "puncteForte": ["5 puncte forte concrete, fiecare 2-3 fraze: ce e, din ce răspuns reiese și cum se poate sprijini pe el"],
  "atentie": ["5 lucruri la care să fie atentă, fiecare 2-3 fraze: ce e, de ce contează și un prim gest concret, formulate blând"],
  "copii": "DOAR dacă are copii: 3 paragrafe, 200-260 de cuvinte, despre cum trăiesc probabil copiii situația (pe vârste, dacă le știi, după ghid), ce semnale să urmărească și ce îi protejează concret. Altfel șir gol.",
  "plan": [ { "titlu": "Săptămâna 1: … (un titlu scurt, care spune ținta săptămânii)", "pasi": ["3-4 pași concreți, mici și realiști, fiecare 1-2 fraze, cu ce anume să facă și cum"] } ],
  "conversatie": ["6 întrebări deschise, blânde, legate de rezultatele ei, pe care le poate purta într-o discuție în doi (sau, dacă s-au despărțit, întrebări de reflecție pentru ea)"],
  "incheiere": "un paragraf cald, 100-140 de cuvinte, care rezumă drumul, încurajează sprijinul de specialitate când e nevoie (individual sau de cuplu) și se încheie cu o propoziție care spune că acest raport e psihoeducație și nu înlocuiește o ședință de terapie"
}
"dimensiuni" are exact 6 elemente, câte unul pentru fiecare cheie, în ordinea: comunicare, conflict, apropiere, incredere, respect, echipa. "plan" are exact 4 săptămâni. În total, raportul are în jur de 2.800-3.500 de cuvinte.

PRINCIPIILE DIN GHIDUL LILIANEI („Ghid practic despre cuplu, divorț și familie"):
${GHID_CUNOSTINTE}`;

export type RezultatAI = { ok: true; raport: RaportAI } | { ok: false; error: string };

export async function genereazaInterpretare(r: Raspunsuri): Promise<RezultatAI> {
  if (!CHEIE) return { ok: false, error: "Interpretarea AI nu e activată (lipsește cheia)." };

  const rez = calculeaza(r);
  if (!rez) return { ok: false, error: "Testul nu e complet." };

  const scoruri = rez.dimensiuni
    .map((d) => `- ${d.nume}: ${d.pct}/100 (${NIVELURI[d.nivel].nume})`)
    .join("\n");
  const semnale = rez.semnale.length
    ? rez.semnale.map((s) => `- ${s.titlu}: ${s.text}`).join("\n")
    : "- niciunul";

  const mesaj = `REZULTATUL CALCULAT
Indicele relației: ${rez.indice}/100
Profil: ${rez.profil.nume}
Scoruri pe dimensiuni (100 = foarte bine):
${scoruri}

Semnale care cer atenție:
${semnale}

Situație: ${eSeparat(r) ? "s-au despărțit sau sunt în divorț" : "sunt încă împreună"}; ${areCopii(r) ? "au copii" : "nu au copii împreună"}.

RĂSPUNSURILE EI
(Atenție: unele afirmații sunt formulate negativ, de exemplu „Evit anumite subiecte, ca să nu iasă scandal”; la ele, „Aproape mereu” înseamnă o problemă, nu o resursă.)
${raspunsuriText(r)}

Scrie raportul, ca obiect JSON.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${CHEIE}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.7,
        max_tokens: 16000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SISTEM },
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
      return { ok: false, error: `Modelul nu a întors JSON valid (${motiv}): …${continut.slice(-160)}` };
    }
    const raport = normalizeazaRaport(brut);
    if (!raport) return { ok: false, error: "Raportul primit e incomplet." };
    if (!areCopii(r)) raport.copii = "";

    // Liniile de pauză scapă uneori, deși instrucțiunile le interzic.
    // (Intervalele de tipul „3–6 ani” rămân neatinse.)
    const curata = (s: string) => s.replace(/\s+[—–]\s+/g, ", ").replace(/\s*—\s*/g, ", ");
    return { ok: true, raport: JSON.parse(JSON.stringify(raport), (_k, v) => (typeof v === "string" ? curata(v) : v)) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Eroare la apelul AI." };
  }
}
