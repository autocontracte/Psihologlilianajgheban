/**
 * Adresa IP reală a vizitatorului.
 *
 * Se folosește pentru limitarea numărului de cereri, deci contează să nu poată
 * fi falsificată. Lanțul prin care trece o cerere este:
 *
 *   vizitator → (Cloudflare) → Apache → aplicație
 *
 * `X-Forwarded-For` **nu** poate fi luat de la început: oricine poate trimite
 * antetul cu o valoare inventată, iar Apache doar adaugă la coadă. Primul
 * element ar fi deci exact valoarea aleasă de atacator, care s-ar putea plimba
 * prin oricâte IP-uri false ca să ocolească limitarea.
 *
 * Ultimul element este cel adăugat de Apache — adresa reală de la care a venit
 * conexiunea. Iar dacă site-ul stă în spatele Cloudflare, `CF-Connecting-IP`
 * este pus de Cloudflare și nu poate fi influențat de client.
 */
export function clientIp(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }

  return request.headers.get("x-real-ip")?.trim() ?? "unknown";
}
