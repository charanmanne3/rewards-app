import type { PlaceResult } from "./types";

const cache = new Map<string, { data: PlaceResult[]; expires: number }>();
const TTL_MS = 5 * 60 * 1000;

function cacheKey(lat: number, lng: number, radius: number): string {
  return `${lat.toFixed(3)}:${lng.toFixed(3)}:${radius}`;
}

export function getPlacesCache(
  lat: number,
  lng: number,
  radius: number
): PlaceResult[] | null {
  const hit = cache.get(cacheKey(lat, lng, radius));
  if (!hit || Date.now() > hit.expires) return null;
  return hit.data;
}

export function setPlacesCache(
  lat: number,
  lng: number,
  radius: number,
  data: PlaceResult[]
): void {
  cache.set(cacheKey(lat, lng, radius), { data, expires: Date.now() + TTL_MS });
}
