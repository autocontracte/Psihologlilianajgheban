/**
 * Titlu cu un cuvânt-cheie în verde. În texte, cuvântul se marchează cu
 * steluțe: „Cui mă *adresez*". Înlocuiește liniile decorative de sub titluri —
 * culoarea stă pe cuvântul care contează, nu pe o linie.
 */
export function Accent({ text, className = "text-periwinkle" }: { text: string; className?: string }) {
  const bucati = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {bucati.map((b, i) =>
        b.startsWith("*") && b.endsWith("*") ? (
          <em key={i} className={`not-italic ${className}`}>
            {b.slice(1, -1)}
          </em>
        ) : (
          b
        ),
      )}
    </>
  );
}

/** Textul fără steluțe — pentru locurile în care nu se afișează ca titlu. */
export const faraAccent = (text: string) => text.replace(/\*/g, "");
