import * as Location from "expo-location";

import { getCachedLocation, setCachedLocation } from "./locationCache";
import type { CachedLocation, Coordinates, LocationPermissionStatus } from "./types";

export async function getPermissionStatus(): Promise<LocationPermissionStatus> {
  const { status } = await Location.getForegroundPermissionsAsync();
  if (status === Location.PermissionStatus.GRANTED) return "granted";
  if (status === Location.PermissionStatus.DENIED) return "denied";
  return "undetermined";
}

export async function requestForegroundPermission(): Promise<LocationPermissionStatus> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status === Location.PermissionStatus.GRANTED) return "granted";
  if (status === Location.PermissionStatus.DENIED) return "denied";
  return "undetermined";
}

/**
 * Foreground GPS fix. Background tracking can plug in here later.
 */
export async function getCurrentCoordinates(options?: {
  useCache?: boolean;
  highAccuracy?: boolean;
}): Promise<CachedLocation | null> {
  const useCache = options?.useCache ?? true;
  if (useCache) {
    const cached = await getCachedLocation();
    if (cached) return cached;
  }

  const permission = await getPermissionStatus();
  if (permission !== "granted") {
    const requested = await requestForegroundPermission();
    if (requested !== "granted") return null;
  }

  const enabled = await Location.hasServicesEnabledAsync();
  if (!enabled) return null;

  const position = await Location.getCurrentPositionAsync({
    accuracy: options?.highAccuracy
      ? Location.Accuracy.High
      : Location.Accuracy.Balanced,
  });

  const result: CachedLocation = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    timestamp: position.timestamp,
  };

  await setCachedLocation(result);
  return result;
}

export function openAppSettings(): void {
  void Location.enableNetworkProviderAsync().catch(() => {});
}

/** Haversine distance in meters */
export function distanceMeters(a: Coordinates, b: Coordinates): number {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
