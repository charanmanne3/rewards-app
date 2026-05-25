export type LocationPermissionStatus =
  | "undetermined"
  | "granted"
  | "denied"
  | "restricted";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface CachedLocation extends Coordinates {
  accuracy: number | null;
  timestamp: number;
}

export interface LocationState {
  coords: Coordinates | null;
  accuracy: number | null;
  permission: LocationPermissionStatus;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}
