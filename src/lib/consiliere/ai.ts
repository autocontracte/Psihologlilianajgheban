import "server-only";

import { GHID_CUNOSTINTE } from "@/content/ghid-cunostinte";
import { raspunsuriText, type Raspunsuri } from "./intrebari";

/* ----------------------------------------------------------------------------
   Interpretarea AI.

   Trimite răspunsurile omului, împreună cu principiile din ghid, la un model
   mic (implicit gpt-4o-mini) și primește o reflecție caldă, personală. Modelul
   NU pune diagnostice și nu dă sfaturi juridice — instrucțiunile de mai jos îl
   țin în limitele unei psihoeducații responsabile.

   Cheia stă doar în .env, pe server. Fără ea, `interpretareaActiva` e false și
   fluxul o spune deschis, în loc să se prefacă.
   -------------------------------------------------------------------------- */

const CHEIE = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export const interpretareaActiva = Boolean(CHEIE);

const SISTEM = `Ești asistentul cabinetului de psihologie al Lilianei Jgheban. Scrii o reflecție caldă, personală și atentă pentru o persoană care trece printr-o criză de cuplu sau un divorț, pornind de la răspunsurile ei la un chestionar și de la principiile din „Ghidul practic despre divorț" (mai jos).

Reguli:
- Scrii în limba română, la persoana a doua („tu"), cu empatie și fără judecată.
- NU pui diagnostice, NU dai sfaturi juridice sau medicale, NU promiți rezultate.
- Te sprijini pe principiile din ghid; nu inventa informații și nu cita paragrafe.
- Structură fluidă, nu ca o listă: (1) recunoaște cu blândețe situația ei; (2) leagă 2–4 idei din ghid, relevante pentru răspunsurile ei, explicate simplu; (3) propune câțiva pași blânzi și concreți; (4) încurajeaz-o să apeleze la sprijin specializat când simte nevoia.
- Ton uman și cald, nu robotic. Evită clișeele. Aproximativ 350–500 de cuvinte.
- Nu folosi numele ei (nu îl cunoști). Nu inventa detalii pe care nu le-a spus.
- Închei cu o singură propoziție care spune că această reflecție nu înlocuiește o ședință de terapie.

Principiile din ghid, pe care te sprijini:
${GHID_CUNOSTINTE}`;

export type RezultatAI =
  | { ok: true; text: string }
  | { ok: false; error: string };

export async function genereazaInterpretare(raspunsuri: Raspunsuri): Promise<RezultatAI> {
  if (!CHEIE) {
    return { ok: false, error: "Interpretarea AI nu e activată (lipsește cheia)." };
  }

  const continut = raspunsuriText(raspunsuri);
  if (!continut.trim()) {
    return { ok: false, error: "Nu există răspunsuri de interpretat." };
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CHEIE}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.75,
        max_tokens: 1000,
        messages: [
          { role: "system", content: SISTEM },
          {
            role: "user",
            content: `Răspunsurile persoanei la chestionar:\n\n${continut}\n\nScrie reflecția pentru ea.`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const detaliu = await res.text().catch(() => "");
      return { ok: false, error: `OpenAI a răspuns ${res.status}. ${detaliu.slice(0, 200)}` };
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) return { ok: false, error: "Răspuns gol de la model." };

    return { ok: true, text };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Eroare la apelul AI.",
    };
  }
}
