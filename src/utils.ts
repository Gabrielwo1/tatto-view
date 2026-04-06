import type { Tattoo } from './types';

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

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Distributes tattoos evenly across the grid using round-robin so that
 * no single artist dominates. Each artist's group is shuffled internally,
 * and the group order is also shuffled, so the layout feels random.
 *
 * Old "sort by size" approach: A,B,A,B,A,B... (40 items of just the 2 big artists)
 * Round-robin: A,B,C,D, A,B,C,D, A,B,C, A,B, A,B, A  (everyone mixed in from start)
 */
export function interleaveByArtist(tattoos: Tattoo[]): Tattoo[] {
  const groupMap = new Map<string, Tattoo[]>();
  for (const t of tattoos) {
    const key = t.artistId ?? '__studio__';
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(t);
  }

  // Shuffle each artist's tattoos and shuffle the artist order
  const groups = shuffle(Array.from(groupMap.values()).map((g) => shuffle([...g])));

  // Round-robin: take one from each group per cycle
  const result: Tattoo[] = [];
  while (groups.some((g) => g.length > 0)) {
    for (const group of groups) {
      if (group.length > 0) result.push(group.shift()!);
    }
  }
  return result;
}

