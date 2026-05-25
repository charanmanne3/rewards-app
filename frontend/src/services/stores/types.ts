import type { Coordinates } from "@/services/location/types";

export type NearbyRadius = 100 | 500 | 1000;

export interface NearbyStore {
  id: string;
  name: string;
  category: string;
  coordinates: Coordinates;
  distanceMeters: number;
  rating?: number;
  logoUrl?: string;
  source: "mock" | "google" | "yelp" | "foursquare" | "catalog";
  address?: string;
}

export interface NearbySearchOptions {
  radiusMeters: NearbyRadius;
  limit?: number;
}
