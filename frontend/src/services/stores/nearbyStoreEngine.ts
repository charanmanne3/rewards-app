import { resolveCanonicalStoreName } from "@/services/recommendations/aliases";
import { getStoreMetadata } from "@/services/recommendations/storeMetadata";
import type { Coordinates } from "@/services/location/types";
import { isPlacesApiConfigured, searchNearbyPlaces } from "@/services/places";

import { attachDistance, filterByRadius } from "./geo";
import { buildMockNearbyStores } from "./mockNearbyStores";
import type { NearbyRadius, NearbySearchOptions, NearbyStore } from "./types";

const SUPPORTED_STORES = new Set([
  "Walmart",
  "Costco",
  "Starbucks",
  "7-Eleven",
  "Target",
  "Best Buy",
  "Whole Foods",
  "Shell",
  "Chevron",
]);

function normalizePlaceName(name: string): string | null {
  const canonical = resolveCanonicalStoreName(name);
  if (canonical && SUPPORTED_STORES.has(canonical)) return canonical;
  for (const supported of SUPPORTED_STORES) {
    if (name.toLowerCase().includes(supported.toLowerCase())) return supported;
  }
  const meta = getStoreMetadata(name);
  if (meta && SUPPORTED_STORES.has(meta.name)) return meta.name;
  return null;
}

function dedupeByName(stores: NearbyStore[]): NearbyStore[] {
  const seen = new Set<string>();
  return stores.filter((s) => {
    const k = s.name.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/**
 * Detect nearby supported retailers — mock fallback + live Places APIs.
 */
export async function findNearbyStores(
  origin: Coordinates,
  options: NearbySearchOptions
): Promise<NearbyStore[]> {
  const limit = options.limit ?? 12;
  let candidates: Omit<NearbyStore, "distanceMeters">[] = buildMockNearbyStores(origin);

  if (isPlacesApiConfigured()) {
    const places = await searchNearbyPlaces({
      latitude: origin.latitude,
      longitude: origin.longitude,
      radiusMeters: options.radiusMeters,
    });

    for (const place of places) {
      const canonical = normalizePlaceName(place.name);
      if (!canonical) continue;
      candidates.push({
        id: place.id,
        name: canonical,
        category: place.category,
        coordinates: place.coordinates,
        rating: place.rating,
        logoUrl: place.logoUrl,
        source: place.provider,
        address: place.address,
      });
    }
  }

  const withDistance = attachDistance(origin, candidates);
  const filtered = filterByRadius(withDistance, options.radiusMeters);
  return dedupeByName(filtered).slice(0, limit);
}

export function getClosestStore(stores: NearbyStore[]): NearbyStore | null {
  return stores[0] ?? null;
}

export const RADIUS_OPTIONS: NearbyRadius[] = [100, 500, 1000];
