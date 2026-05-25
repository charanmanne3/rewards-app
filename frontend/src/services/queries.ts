import { useQuery } from "@tanstack/react-query";

import { recommendationQueryKeys } from "@/hooks/recommendationQueryKeys";
import { useRecommendations } from "@/hooks/useRecommendations";
import { ApiError, isNetworkFailure, rewardsApi } from "@/services/api";
import { getMockRecommendations } from "@/services/mockData";
import type { StoreCardsResponse } from "@/types/models";
import { resolveCardId } from "@/utils/listKeys";

export { useRecommendations, recommendationQueryKeys };
export type { UseRecommendationsOptions } from "@/hooks/useRecommendations";

export const queryKeys = {
  health: ["health"] as const,
  stores: ["stores"] as const,
  recommendations: recommendationQueryKeys.store,
  bestCard: (storeName: string) => ["bestCard", storeName] as const,
  storeCards: (storeName: string) => ["storeCards", storeName] as const,
  cardsDetail: ["cards", "details"] as const,
  promotionalOffers: ["offers", "promotional"] as const,
};

export function useApiHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: rewardsApi.getHealth,
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  });
}

export function useStores() {
  return useQuery({
    queryKey: queryKeys.stores,
    queryFn: rewardsApi.getStores,
    staleTime: 60_000,
    retry: 2,
  });
}

export function useStoreCards(storeName: string | undefined) {
  const enabled = Boolean(storeName?.trim());
  const trimmed = storeName?.trim() ?? "";

  return useQuery({
    queryKey: queryKeys.storeCards(trimmed),
    queryFn: async () => {
      try {
        return await rewardsApi.getStoreCards(trimmed);
      } catch (error) {
        if (__DEV__ && isNetworkFailure(error)) {
          const mock = getMockRecommendations(trimmed);
          return {
            store_name: mock.store_name,
            store_category: mock.store_category,
            as_of_date: mock.as_of_date,
            cards: mock.all_matches.map((m) => ({
              card_id: resolveCardId(
                m.card_id,
                m.card_name,
                m.issuer,
                m.reward_type
              ),
              card_name: m.card_name,
              issuer: m.issuer,
              cashback_percent: m.cashback_percent,
              reward_type: m.reward_type,
              annual_fee: m.annual_fee ?? 0,
              expires_at: m.expires_at,
              signup_bonus: m.signup_bonus,
              network: m.network,
            })),
          } satisfies StoreCardsResponse;
        }
        throw error;
      }
    },
    enabled,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.isNetworkError) return false;
      if (error instanceof ApiError && error.status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useBestCard(storeName: string | undefined) {
  const enabled = Boolean(storeName?.trim());

  return useQuery({
    queryKey: queryKeys.bestCard(storeName ?? ""),
    queryFn: () => rewardsApi.getBestCardForStore(storeName!),
    enabled,
    staleTime: 30_000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useCardsWithRewards() {
  return useQuery({
    queryKey: queryKeys.cardsDetail,
    queryFn: rewardsApi.getCardsWithRewards,
    staleTime: 60_000,
  });
}

export function usePromotionalOffers() {
  return useQuery({
    queryKey: queryKeys.promotionalOffers,
    queryFn: rewardsApi.getPromotionalOffers,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}
