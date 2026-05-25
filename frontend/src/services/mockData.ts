import { getStoreMockRecommendations } from "@/services/recommendations/mockRecommendations";
import type { ApiHealthResponse, RecommendationResponse } from "@/types/models";

/** Temporary fallback when the API is unreachable (dev / offline). */
export function getMockHealth(): ApiHealthResponse {
  return {
    status: "ok",
    version: "mock",
    environment: "mock",
    database: "mock",
    providers: [
      { slug: "database", display_name: "Rewards Catalog", enabled: true, last_sync_at: null },
    ],
    jobs: {
      expiration_enabled: true,
      offer_refresh_enabled: true,
      offer_refresh_hours: 6,
    },
  };
}

export function getMockRecommendations(storeName: string): RecommendationResponse {
  return getStoreMockRecommendations(storeName);
}
