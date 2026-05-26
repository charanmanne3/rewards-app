import type { CategoryRecommendItem } from "@/types/models";

/**
 * Central place for navigation actions related to recommendations.
 *
 * Keeps screens slimmer and avoids duplicating route params formatting.
 */
export function navigateToCardDetails(router: any, item: CategoryRecommendItem) {
  router.push({
    pathname: "/card-details/[cardName]",
    params: {
      cardName: encodeURIComponent(item.card_name),
      rewardCategory: item.reward_category,
      rewardRate: item.reward_rate,
      annualFee: item.annual_fee === null ? "null" : String(item.annual_fee),
    },
  });
}

