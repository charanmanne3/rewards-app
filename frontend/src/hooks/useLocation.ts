import { useCallback, useEffect, useState } from "react";

import {
  getCachedLocation,
  getCurrentCoordinates,
  getPermissionStatus,
  requestForegroundPermission,
  type CachedLocation,
  type LocationPermissionStatus,
} from "@/services/location";

export function useLocation(options?: { autoFetch?: boolean }) {
  const autoFetch = options?.autoFetch ?? true;
  const [coords, setCoords] = useState<CachedLocation | null>(null);
  const [permission, setPermission] = useState<LocationPermissionStatus>("undetermined");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const status = await getPermissionStatus();
      setPermission(status);
      if (status === "denied") {
        setError("Location permission denied");
        return null;
      }
      const loc = await getCurrentCoordinates({ useCache: false, highAccuracy: true });
      setCoords(loc);
      if (!loc) setError("Unable to detect location");
      return loc;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Location error";
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    const status = await requestForegroundPermission();
    setPermission(status);
    if (status === "granted") return refresh();
    setError("Enable location in Settings to find nearby stores");
    return null;
  }, [refresh]);

  useEffect(() => {
    void getPermissionStatus().then(setPermission);
    void getCachedLocation().then((c) => {
      if (c) setCoords(c);
    });
    if (autoFetch) void refresh();
  }, [autoFetch, refresh]);

  return {
    coords,
    permission,
    isLoading,
    error,
    refresh,
    requestPermission,
    hasLocation: Boolean(coords),
  };
}
