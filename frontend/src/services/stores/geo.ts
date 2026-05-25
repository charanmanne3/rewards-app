import { distanceMeters } from "@/services/location";

import type { Coordinates } from "@/services/location/types";
import type { NearbyStore } from "./types";

export function attachDistance(
  origin: Coordinates,
  stores: Omit<NearbyStore, "distanceMeters">[]
): NearbyStore[] {
  return stores
    .map((s) => ({
      ...s,
      distanceMeters: distanceMeters(origin, s.coordinates),
    }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

export function filterByRadius(stores: NearbyStore[], radiusMeters: number): NearbyStore[] {
  return stores.filter((s) => s.distanceMeters <= radiusMeters);
}
