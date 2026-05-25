import type { Store } from "@/types/models";

import { getAllStoreMetadata, getStoreMetadata } from "./storeMetadata";

/** Normalize user input for alias matching */
export function normalizeStoreQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/\s+/g, " ");
}

/** Map alias / fuzzy input → canonical store name */
export function resolveCanonicalStoreName(query: string): string | null {
  const normalized = normalizeStoreQuery(query);
  if (!normalized) return null;

  for (const meta of getAllStoreMetadata()) {
    if (meta.name.toLowerCase() === normalized) return meta.name;
    for (const alias of meta.aliases) {
      const a = normalizeStoreQuery(alias);
      if (normalized === a || normalized.includes(a) || a.includes(normalized)) {
        return meta.name;
      }
    }
  }

  if (/^7[\s-]?11$|^711$/.test(normalized.replace(/\s/g, ""))) {
    return "7-Eleven";
  }

  return null;
}

/** Resolve query against API store list + local metadata aliases */
export function resolveStoreFromQuery(query: string, apiStores: Store[]): Store | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const canonical = resolveCanonicalStoreName(trimmed);
  if (canonical) {
    const match = apiStores.find((s) => s.name.toLowerCase() === canonical.toLowerCase());
    if (match) return match;
    const meta = getStoreMetadata(canonical);
    if (meta) {
      return { id: 0, name: meta.name, category: meta.category };
    }
  }

  const normalized = normalizeStoreQuery(trimmed);
  const sorted = [...apiStores].sort((a, b) => b.name.length - a.name.length);
  for (const store of sorted) {
    if (normalized.includes(store.name.toLowerCase())) return store;
    const meta = getStoreMetadata(store.name);
    if (meta?.aliases.some((a) => normalized.includes(normalizeStoreQuery(a)))) {
      return store;
    }
  }

  const atMatch = trimmed.match(/(?:at|from|for)\s+([a-z0-9\s&'-]+)/i);
  if (atMatch?.[1]) {
    const fragment = normalizeStoreQuery(atMatch[1]);
    const fromAlias = resolveCanonicalStoreName(fragment);
    if (fromAlias) {
      return (
        apiStores.find((s) => s.name.toLowerCase() === fromAlias.toLowerCase()) ?? {
          id: 0,
          name: fromAlias,
          category: getStoreMetadata(fromAlias)?.category ?? "",
        }
      );
    }
    return sorted.find((s) => s.name.toLowerCase().startsWith(fragment)) ?? null;
  }

  return sorted.find((s) => s.name.toLowerCase().startsWith(normalized)) ?? null;
}
