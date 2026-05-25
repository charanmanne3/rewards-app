import type { Coordinates } from "@/services/location/types";

export interface PlaceResult {
  id: string;
  name: string;
  category: string;
  coordinates: Coordinates;
  rating?: number;
  logoUrl?: string;
  address?: string;
  provider: "google" | "yelp" | "foursquare";
}

export interface PlacesSearchParams {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  query?: string;
}
