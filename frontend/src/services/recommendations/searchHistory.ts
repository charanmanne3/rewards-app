/**
 * Search history helpers — backed by AsyncStorage via useRecentSearches hook.
 */

export const SEARCH_HISTORY_KEY = "@rewards/recent_searches";
export const MAX_SEARCH_HISTORY = 8;

export function normalizeHistoryEntry(name: string): string {
  return name.trim();
}

export function dedupeHistory(entries: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of entries) {
    const key = raw.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(raw);
  }
  return out;
}

/** Future GPS: rank stores by proximity when coordinates are available */
export function rankStoresForNearby<T extends { name: string; nearbyCapable?: boolean }>(
  stores: T[],
  _lat?: number,
  _lng?: number
): T[] {
  return [...stores].sort((a, b) => {
    const aNear = a.nearbyCapable ? 0 : 1;
    const bNear = b.nearbyCapable ? 0 : 1;
    if (aNear !== bNear) return aNear - bNear;
    return a.name.localeCompare(b.name);
  });
}
