import { ApiError, isNetworkFailure, rewardsApi } from "@/services/api";
import type {
  RecommendationRequest,
  RecommendationResponse,
  Store,
  StoreCardMatch,
} from "@/types/models";
import { normalizeRecommendationResponse } from "@/utils/recommendationGuards";
import { dedupeStores } from "@/utils/listKeys";
import { recommendationToCardMatch } from "@/utils/recommendations";

import { resolveStoreFromQuery } from "./aliases";
import { getStoreMockRecommendations } from "./mockRecommendations";
import {
  getAllStoreMetadata,
  mergeStoreWithMetadata,
  type StoreMetadata,
} from "./storeMetadata";
import type { Recommendation } from "./types";

export interface FetchRecommendationsOptions {
  ownedCards?: string[];
  categories?: string[];
  /** Use mock data on network failure (default: __DEV__) */
  useMockOnFailure?: boolean;
}

export interface StoreRecommendationResult {
  storeName: string;
  storeCategory: string;
  metadata: StoreMetadata;
  response: RecommendationResponse;
  cards: StoreCardMatch[];
  recommendations: Recommendation[];
  isMock: boolean;
}

export function resolveSearchTarget(query: string, apiStores: Store[]): string {
  const resolved = resolveStoreFromQuery(query, apiStores);
  return resolved?.name ?? query.trim();
}

export async function fetchStoreRecommendations(
  storeName: string,
  options: FetchRecommendationsOptions = {}
): Promise<StoreRecommendationResult> {
  const {
    ownedCards = [],
    categories = [],
    useMockOnFailure = __DEV__,
  } = options;

  const trimmed = storeName.trim();
  const body: RecommendationRequest = {
    store: trimmed,
    owned_cards: ownedCards,
    categories,
  };

  let response: RecommendationResponse;
  let isMock = false;

  try {
    response = await rewardsApi.getRecommendations(body);
  } catch (error) {
    const useMock =
      useMockOnFailure &&
      (isNetworkFailure(error) ||
        (error instanceof ApiError &&
          (error.status >= 500 || error.status === 404)));
    if (useMock) {
      response = getStoreMockRecommendations(trimmed);
      isMock = true;
    } else {
      throw error;
    }
  }

  if (!(response.all_matches?.length ?? 0) && useMockOnFailure) {
    response = getStoreMockRecommendations(trimmed);
    isMock = true;
  }

  const normalized = normalizeRecommendationResponse(response)!;
  const matches = normalized.all_matches;
  const cards = matches.map(recommendationToCardMatch);
  const metadata = mergeStoreWithMetadata(
    normalized.store_name,
    normalized.store_category
  );

  return {
    storeName: normalized.store_name,
    storeCategory: normalized.store_category,
    metadata,
    response: normalized,
    cards,
    recommendations: buildRecommendations(normalized),
    isMock,
  };
}

export function buildRecommendations(
  data: RecommendationResponse
): Recommendation[] {
  if (!data.best_card) return [];
  const best = data.best_card;
  const typeLabel =
    best.reward_type === "ROTATING"
      ? "rotating rewards"
      : best.reward_type === "PROMOTIONAL"
        ? "active offer"
        : "cashback";
  return [
    {
      id: `rec-${best.card_id ?? best.card_name}`,
      headline: "Best Card to Use",
      body: `${best.card_name} → ${best.cashback_percent}% ${typeLabel} at ${data.store_name}${best.is_owned ? " · You own this card" : ""}`,
      cardId: best.card_id ?? 0,
      cardName: best.card_name,
      cashbackPercent: best.cashback_percent,
      confidence: best.confidence,
      source: data.meta.ai_enabled ? "ai" : "rule",
    },
  ];
}

export function filterStoresWithMetadata(
  apiStores: Store[],
  query: string,
  limit = 8
): Array<Store & { metadata?: StoreMetadata }> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const canonical = resolveStoreFromQuery(query, apiStores);
  if (canonical) {
    const meta = mergeStoreWithMetadata(canonical.name, canonical.category);
    return [{ ...canonical, metadata: meta }];
  }

  const fromApi = apiStores
    .filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    )
    .map((s) => ({
      ...s,
      metadata: mergeStoreWithMetadata(s.name, s.category),
    }));

  const apiNames = new Set(fromApi.map((s) => s.name.toLowerCase()));
  const extra = getAllStoreMetadata()
    .filter(
      (m) =>
        !apiNames.has(m.name.toLowerCase()) &&
        (m.name.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.aliases.some((a) => a.includes(q)))
    )
    .slice(0, limit)
    .map((m) => ({
      id: 0,
      name: m.name,
      category: m.category,
      metadata: m,
    }));

  return dedupeStores([...fromApi, ...extra])
    .sort((a, b) => {
      const aStart = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bStart = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      if (aStart !== bStart) return aStart - bStart;
      return a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}
