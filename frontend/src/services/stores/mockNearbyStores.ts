import type { Coordinates } from "@/services/location/types";

import type { NearbyStore } from "./types";

/** ~50–800m offsets from user position (degrees ≈ meters at mid-latitudes) */
const OFFSETS: Array<{
  name: string;
  category: string;
  dLat: number;
  dLon: number;
  rating?: number;
}> = [
  { name: "Starbucks", category: "Dining & Coffee", dLat: 0.0004, dLon: 0.0002, rating: 4.5 },
  { name: "7-Eleven", category: "Convenience & Gas", dLat: 0.0012, dLon: -0.0008, rating: 4.0 },
  { name: "Walmart", category: "Grocery & General", dLat: 0.003, dLon: 0.001, rating: 4.2 },
  { name: "Target", category: "Department Store", dLat: 0.002, dLon: -0.002, rating: 4.3 },
  { name: "Costco", category: "Warehouse Club", dLat: 0.005, dLon: 0.003, rating: 4.6 },
  { name: "Whole Foods", category: "Grocery", dLat: 0.0015, dLon: 0.0025, rating: 4.4 },
  { name: "Shell", category: "Gas Station", dLat: 0.0008, dLon: -0.0015, rating: 3.9 },
  { name: "Chevron", category: "Gas Station", dLat: 0.0022, dLon: -0.0005, rating: 4.0 },
  { name: "Best Buy", category: "Electronics", dLat: 0.004, dLon: -0.003, rating: 4.1 },
];

export function buildMockNearbyStores(origin: Coordinates): Omit<NearbyStore, "distanceMeters">[] {
  return OFFSETS.map((o, i) => ({
    id: `mock-nearby-${o.name.toLowerCase().replace(/\s+/g, "-")}-${i}`,
    name: o.name,
    category: o.category,
    coordinates: {
      latitude: origin.latitude + o.dLat,
      longitude: origin.longitude + o.dLon,
    },
    rating: o.rating,
    source: "mock" as const,
    address: "Near your location",
  }));
}
