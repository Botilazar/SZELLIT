// src/utils/imageHelpers.ts

const API_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Egyetlen kép URL normalizálása.
 * - Ha teljes HTTP/HTTPS URL: visszaadjuk változtatás nélkül.
 * - Ha relatív ("/uploads/valami.jpg"): elé tesszük az API_URL-t.
 * - Ha nincs, undefined.
 */
export function resolveImgUrl(url?: string | null): string | undefined {
  if (!url) return undefined;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_URL}${url}`;
}

/**
 * Tömbből az első elérhető kép visszaadása, normalizálva.
 */
export function resolveFirstFromArray(
  urls?: string[] | null
): string | undefined {
  if (!urls || urls.length === 0) return undefined;
  return resolveImgUrl(urls[0]);
}
