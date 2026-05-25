import { useQuery } from "@tanstack/react-query";

import { getRecommendationsForNearbyStore } from "@/services/recommendations/locationRecommendations";

import { useWalletProfile } from "./useWalletProfile";

export function useLocationRecommendations(storeName: string | undefined) {
  const { profile } = useWalletProfile();
  const trimmed = storeName?.trim() ?? "";

  return useQuery({
    queryKey: ["location-rec", trimmed, profile.ownedCards.join(",")],
    queryFn: () =>
      getRecommendationsForNearbyStore(trimmed, profile.ownedCards, {
        preferApplePay: true,
      }),
    enabled: Boolean(trimmed),
    staleTime: 45_000,
  });
}
