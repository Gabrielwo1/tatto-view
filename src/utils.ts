/** Convert an artist name to a URL-friendly slug.
 *  e.g. "Braian Otovicz" → "braian-otovicz"
 */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')     // non-alphanumeric → dash
    .replace(/^-+|-+$/g, '');        // trim leading/trailing dashes
}
