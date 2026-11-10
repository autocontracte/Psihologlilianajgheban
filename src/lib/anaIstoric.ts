import "server-only";

import { db } from "@/lib/db";

/* ============================================================================
   Conversațiile cu Ana, păstrate pentru cabinet.

   Se salvează întrebările omului și răspunsurile Anei, legate de vizita din
   care s-a scris (dacă există), ca să se vadă de unde a venit și ce a făcut pe
   site în jurul conversației.

   Conținutul poate fi sensibil: se citește doar din panoul de administrare
   (/admin/ana) și se șterge singur după un timp. Politica de confidențialitate
   explică asta la capitolul despre cookie-uri și măsurare.
   ========================================================================== */

/** După câte zile se șterg conversațiile. */
export const ANA_PASTREAZA_ZILE = 90;

/** Cât păstrăm dintr-un mesaj (un răspuns al Anei are ~320 de tokenuri). */
const MAX_TEXT = 4000;

const CHEIE_OK = /^[A-Za-z0-9_-]{8,64}$/;

/**
 * Notează întrebarea omului și întoarce id-ul conversației, cu care se
 * salvează pe urmă răspunsul Anei. Întoarce null dacă nu se poate salva —
 * chatul merge mai departe, statisticile nu merită o eroare în fața omului.
 */
export async function noteazaIntrebarea(
  cheie: string,
  vizitaId: string,
  text: string,
  intrebari: number,
): Promise<string | null> {
  if (!CHEIE_OK.test(cheie) || !text.trim()) return null;

  try {
    const acum = new Date();
    const chat = await db.anaChat.upsert({
      where: { key: cheie },
      create: {
        key: cheie,
        visitId: vizitaId || null,
        intrebari,
        lastAt: acum,
      },
      update: {
        lastAt: acum,
        intrebari,
        /* Vizita o legăm o singură dată, la prima apucare. */
        ...(vizitaId ? { visitId: vizitaId } : {}),
      },
      select: { id: true },
    });

    await db.anaMesaj.create({
      data: { chatId: chat.id, rol: "om", text: text.slice(0, MAX_TEXT), at: acum },
    });

    await curatenie();
    return chat.id;
  } catch {
    return null;
  }
}

/**
 * Trece fluxul de răspuns mai departe neatins, dar îl adună pe parcurs și îl
 * salvează la final. Dacă omul închide pagina la jumătate, se salvează cât a
 * apucat să primească — exact ce a văzut pe ecran.
 */
export function insoteste(
  flux: ReadableStream<Uint8Array>,
  chatId: string,
): ReadableStream<Uint8Array> {
  const dec = new TextDecoder();
  let raspuns = "";
  let salvat = false;

  const salveaza = async () => {
    if (salvat) return;
    salvat = true;
    const text = raspuns.trim();
    if (!text) return;
    await db.anaMesaj
      .create({ data: { chatId, rol: "ana", text: text.slice(0, MAX_TEXT) } })
      .catch(() => {});
  };

  const cititor = flux.getReader();

  return new ReadableStream<Uint8Array>({
    async pull(ctrl) {
      const { done, value } = await cititor.read();
      if (done) {
        ctrl.close();
        await salveaza();
        return;
      }
      raspuns += dec.decode(value, { stream: true });
      ctrl.enqueue(value);
    },
    /* Omul a închis pagina în timpul răspunsului: salvăm cât a apucat să vadă. */
    async cancel(motiv) {
      await cititor.cancel(motiv).catch(() => {});
      await salveaza();
    },
  });
}

/* Curățenie rară: conversațiile mai vechi de ANA_PASTREAZA_ZILE se șterg, cu
   tot cu mesaje (`onDelete: Cascade`). */
async function curatenie() {
  if (Math.random() > 0.02) return;
  const limita = new Date(Date.now() - ANA_PASTREAZA_ZILE * 86_400_000);
  await db.anaChat.deleteMany({ where: { lastAt: { lt: limita } } }).catch(() => {});
}
