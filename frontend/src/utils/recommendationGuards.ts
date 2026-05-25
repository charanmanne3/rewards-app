import type { RecommendationResponse } from "@/types/models";
import { dedupeRecommendationMatches } from "@/utils/listKeys";

const EMPTY_META: RecommendationResponse["meta"] = {
  engine_version: "0",
  providers_queried: 0,
  owned_cards_filter: false,
  ai_enabled: false,
  cache_hit: false,
};

/** Normalize API payload so UI never reads undefined nested fields. */
export function normalizeRecommendationResponse(
  data: RecommendationResponse | undefined | null
): RecommendationResponse | null {
  if (!data) return null;

  return {
    store_name: data.store_name ?? "",
    store_category: data.store_category ?? "",
    as_of_date: data.as_of_date ?? new Date().toISOString().slice(0, 10),
    best_card: data.best_card ?? null,
    all_matches: Array.isArray(data.all_matches)
      ? dedupeRecommendationMatches(data.all_matches)
      : [],
    provider_sources: Array.isArray(data.provider_sources) ? data.provider_sources : [],
    meta: data.meta ?? EMPTY_META,
  };
}

export function hasRecommendationResults(
  data: RecommendationResponse | undefined | null
): boolean {
  const normalized = normalizeRecommendationResponse(data);
  return Boolean(normalized && normalized.all_matches.length > 0);
}
