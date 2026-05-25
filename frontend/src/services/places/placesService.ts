import { env } from "@/config/env";

import { getPlacesCache, setPlacesCache } from "./cache";
import { canCall, markCalled } from "./rateLimiter";
import type { PlaceResult, PlacesSearchParams } from "./types";

/** Live provider stubs — wire keys in .env for production */
async function fetchGooglePlaces(_params: PlacesSearchParams): Promise<PlaceResult[]> {
  if (!env.googlePlacesApiKey) return [];
  markCalled("google");
  // Production: Google Places Nearby Search
  return [];
}

async function fetchYelpPlaces(_params: PlacesSearchParams): Promise<PlaceResult[]> {
  if (!env.yelpApiKey) return [];
  markCalled("yelp");
  return [];
}

async function fetchFoursquarePlaces(_params: PlacesSearchParams): Promise<PlaceResult[]> {
  if (!env.foursquareApiKey) return [];
  markCalled("foursquare");
  return [];
}

export async function searchNearbyPlaces(
  params: PlacesSearchParams
): Promise<PlaceResult[]> {
  const cached = getPlacesCache(params.latitude, params.longitude, params.radiusMeters);
  if (cached) return cached;

  const results: PlaceResult[] = [];

  if (canCall("google")) {
    results.push(...(await fetchGooglePlaces(params)));
  }
  if (canCall("yelp")) {
    results.push(...(await fetchYelpPlaces(params)));
  }
  if (canCall("foursquare")) {
    results.push(...(await fetchFoursquarePlaces(params)));
  }

  if (results.length) {
    setPlacesCache(params.latitude, params.longitude, params.radiusMeters, results);
  }

  return results;
}

export function isPlacesApiConfigured(): boolean {
  return Boolean(env.googlePlacesApiKey || env.yelpApiKey || env.foursquareApiKey);
}
