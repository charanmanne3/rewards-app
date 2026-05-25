export {
  recommendationEngine,
  RuleRecommendationEngine,
  AIRecommendationEngine,
} from "./engine";
export {
  resolveCanonicalStoreName,
  resolveStoreFromQuery,
  normalizeStoreQuery,
} from "./aliases";
export { parseStoreFromQuery, filterStoresByQuery } from "./queryParser";
export {
  getStoreMetadata,
  getAllStoreMetadata,
  mergeStoreWithMetadata,
  STORE_METADATA,
  type StoreMetadata,
} from "./storeMetadata";
export { getStoreMockRecommendations } from "./mockRecommendations";
export {
  fetchStoreRecommendations,
  resolveSearchTarget,
  buildRecommendations,
  filterStoresWithMetadata,
  type FetchRecommendationsOptions,
  type StoreRecommendationResult,
} from "./recommendationService";
export {
  rankRecommendationMatches,
  getBestRankedMatch,
  type RankedMatch,
  type RankingContext,
} from "./rankingEngine";
export {
  getRecommendationsForNearbyStore,
  type LocationRecommendationBundle,
} from "./locationRecommendations";
export {
  SEARCH_HISTORY_KEY,
  MAX_SEARCH_HISTORY,
  normalizeHistoryEntry,
  dedupeHistory,
  rankStoresForNearby,
} from "./searchHistory";
export type {
  Recommendation,
  RecommendationContext,
  RecommendationProvider,
  RecommendationSource,
} from "./types";
