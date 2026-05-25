import type { Store } from "@/types/models";

import { dedupeStores } from "@/utils/listKeys";

import { resolveStoreFromQuery } from "./aliases";
import { getAllStoreMetadata } from "./storeMetadata";

/** @deprecated Use resolveStoreFromQuery from aliases.ts */
export function parseStoreFromQuery(query: string, stores: Store[]): Store | null {
  return resolveStoreFromQuery(query, stores);
}

export function filterStoresByQuery(stores: Store[], query: string, limit = 6): Store[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const resolved = resolveStoreFromQuery(query, stores);
  if (resolved) return [resolved];

  const apiMatches = stores
    .filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    )
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return a.name.localeCompare(b.name);
    });

  const apiNames = new Set(apiMatches.map((s) => s.name.toLowerCase()));
  const metaMatches = getAllStoreMetadata()
    .filter(
      (m) =>
        !apiNames.has(m.name.toLowerCase()) &&
        (m.name.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.aliases.some((a) => a.includes(q)))
    )
    .map((m) => ({ id: 0, name: m.name, category: m.category }));

  return dedupeStores([...apiMatches, ...metaMatches]).slice(0, limit);
}
