import { fetchStoreRecommendations } from "./recommendationService";
import { getBestRankedMatch, rankRecommendationMatches } from "./rankingEngine";
import type { RankedMatch } from "./rankingEngine";

export interface LocationRecommendationBundle {
  storeName: string;
  storeCategory: string;
  ranked: RankedMatch[];
  best: RankedMatch | null;
  isMock: boolean;
  missedRewards: boolean;
}

export async function getRecommendationsForNearbyStore(
  storeName: string,
  ownedCards: string[] = [],
  options?: { preferApplePay?: boolean }
): Promise<LocationRecommendationBundle | null> {
  const result = await fetchStoreRecommendations(storeName, { ownedCards });
  const matches = result.response.all_matches ?? [];
  if (!matches.length) return null;

  const ranked = rankRecommendationMatches(matches, {
    storeName,
    ownedCards,
    preferApplePay: options?.preferApplePay ?? true,
  });

  const best = getBestRankedMatch(ranked);
  const missedRewards =
    ownedCards.length > 0 &&
    Boolean(best && !best.is_owned && ranked.some((r) => r.is_owned));

  return {
    storeName: result.storeName,
    storeCategory: result.storeCategory,
    ranked,
    best,
    isMock: result.isMock,
    missedRewards,
  };
}
