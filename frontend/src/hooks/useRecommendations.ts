import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/services/api";
import { fetchStoreRecommendations } from "@/services/recommendations";
import type { RecommendationResponse } from "@/types/models";
import { normalizeRecommendationResponse } from "@/utils/recommendationGuards";

import { recommendationQueryKeys } from "./recommendationQueryKeys";

export { recommendationQueryKeys };

export interface UseRecommendationsOptions {
  ownedCards?: string[];
  categories?: string[];
  enabled?: boolean;
}

/**
 * Fetches unified recommendations from POST /recommendations with mock fallback.
 * Store name should already be resolved (aliases) by the caller.
 */
export function useRecommendations(
  storeName: string | undefined,
  options: UseRecommendationsOptions = {}
) {
  const { ownedCards = [], categories = [], enabled: enabledOverride } = options;
  const trimmed = storeName?.trim() ?? "";
  const enabled = enabledOverride ?? Boolean(trimmed);

  return useQuery<RecommendationResponse | null, ApiError>({
    queryKey: recommendationQueryKeys.store(trimmed, ownedCards.join(",")),
    queryFn: async () => {
      const result = await fetchStoreRecommendations(trimmed, {
        ownedCards,
        categories,
      });
      return normalizeRecommendationResponse(result.response);
    },
    enabled,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.isNetworkError) return false;
      if (error instanceof ApiError && error.status === 404) return false;
      return failureCount < 2;
    },
  });
}
