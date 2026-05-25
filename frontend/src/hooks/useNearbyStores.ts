import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  findNearbyStores,
  getClosestStore,
  type NearbyRadius,
  type NearbyStore,
} from "@/services/stores";

import { useLocation } from "./useLocation";

export const nearbyQueryKeys = {
  all: ["nearby-stores"] as const,
  list: (lat: number, lng: number, radius: NearbyRadius) =>
    [...nearbyQueryKeys.all, lat, lng, radius] as const,
};

export function useNearbyStores(radiusMeters: NearbyRadius = 1000) {
  const { coords, permission, isLoading: locLoading, requestPermission, refresh } =
    useLocation({ autoFetch: true });

  const query = useQuery({
    queryKey: coords
      ? nearbyQueryKeys.list(coords.latitude, coords.longitude, radiusMeters)
      : nearbyQueryKeys.all,
    queryFn: () =>
      findNearbyStores(
        { latitude: coords!.latitude, longitude: coords!.longitude },
        { radiusMeters, limit: 12 }
      ),
    enabled: Boolean(coords),
    staleTime: 60_000,
    refetchInterval: 90_000,
  });

  const closest = useMemo(
    () => getClosestStore(query.data ?? []),
    [query.data]
  );

  return {
    stores: (query.data ?? []) as NearbyStore[],
    closest,
    coords,
    permission,
    isLoading: locLoading || query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    refreshLocation: refresh,
    requestPermission,
  };
}
