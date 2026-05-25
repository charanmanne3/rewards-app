import type { RecommendationResponse } from "@/types/models";
import { dedupeRecommendationMatches, resolveCardId } from "@/utils/listKeys";

import { getStoreMetadata } from "./storeMetadata";

type MockOffer = {
  card_name: string;
  issuer: string;
  cashback_percent: number;
  reward_type: "STATIC" | "ROTATING" | "PROMOTIONAL";
  note: string;
  card_id: number;
};

const MOCK_BY_STORE: Record<string, MockOffer[]> = {
  "7-Eleven": [
    {
      card_id: 2,
      card_name: "Discover IT",
      issuer: "Discover",
      cashback_percent: 5,
      reward_type: "ROTATING",
      note: "5% gas stations (activate quarterly category)",
    },
    {
      card_id: 1,
      card_name: "Chase Freedom Flex",
      issuer: "Chase",
      cashback_percent: 5,
      reward_type: "ROTATING",
      note: "Rotating 5% — check current quarter category",
    },
    {
      card_id: 7,
      card_name: "Apple Card",
      issuer: "Goldman Sachs",
      cashback_percent: 2,
      reward_type: "STATIC",
      note: "2% Daily Cash with Apple Pay",
    },
  ],
  Walmart: [
    {
      card_id: 6,
      card_name: "Amex Blue Cash Preferred",
      issuer: "American Express",
      cashback_percent: 6,
      reward_type: "PROMOTIONAL",
      note: "Limited-time 6% promotional offer",
    },
    {
      card_id: 1,
      card_name: "Chase Freedom Flex",
      issuer: "Chase",
      cashback_percent: 5,
      reward_type: "ROTATING",
      note: "5% rotating category",
    },
    {
      card_id: 3,
      card_name: "Citi Double Cash",
      issuer: "Citi",
      cashback_percent: 2,
      reward_type: "STATIC",
      note: "2% on all purchases",
    },
  ],
  Costco: [
    {
      card_id: 5,
      card_name: "Capital One Venture X",
      issuer: "Capital One",
      cashback_percent: 2,
      reward_type: "STATIC",
      note: "2x miles — strong for warehouse spend",
    },
    {
      card_id: 1,
      card_name: "Chase Freedom Flex",
      issuer: "Chase",
      cashback_percent: 3,
      reward_type: "ROTATING",
      note: "Warehouse club rotating bonus",
    },
    {
      card_id: 3,
      card_name: "Citi Double Cash",
      issuer: "Citi",
      cashback_percent: 2,
      reward_type: "STATIC",
      note: "2% everyday cashback",
    },
  ],
  Starbucks: [
    {
      card_id: 4,
      card_name: "Amex Gold",
      issuer: "American Express",
      cashback_percent: 4,
      reward_type: "PROMOTIONAL",
      note: "4x points on dining",
    },
    {
      card_id: 7,
      card_name: "Apple Card",
      issuer: "Goldman Sachs",
      cashback_percent: 2,
      reward_type: "STATIC",
      note: "2% with Apple Pay at Starbucks",
    },
    {
      card_id: 9,
      card_name: "Chase Sapphire Preferred",
      issuer: "Chase",
      cashback_percent: 3,
      reward_type: "STATIC",
      note: "3x on dining",
    },
  ],
};

const DEFAULT_OFFERS: MockOffer[] = MOCK_BY_STORE.Walmart;

function buildResponse(storeName: string, offers: MockOffer[]): RecommendationResponse {
  const meta = getStoreMetadata(storeName);
  const today = new Date().toISOString().slice(0, 10);
  const all_matches = dedupeRecommendationMatches(
    offers.map((o) => ({
      card_id: resolveCardId(o.card_id, o.card_name, o.issuer, o.reward_type),
      card_name: o.card_name,
      issuer: o.issuer,
      cashback_percent: o.cashback_percent,
      reward_type: o.reward_type,
      annual_fee: o.card_name.includes("Gold") ? 250 : 0,
      signup_bonus: null,
      network: o.issuer === "Discover" ? "Discover" : "Visa",
      expires_at: null,
      provider_source: "mock",
      is_owned: false,
      confidence: 0.88,
    }))
  );

  return {
    store_name: storeName,
    store_category: meta?.category ?? "Retail",
    as_of_date: today,
    best_card: all_matches[0] ?? null,
    all_matches,
    provider_sources: [
      {
        provider: "mock",
        display_name: "Offline Recommendations",
        offer_count: all_matches.length,
        last_refreshed_at: null,
        status: "mock",
        error_message: "API unreachable — showing curated fallback offers",
      },
    ],
    meta: {
      engine_version: "mock-2.1",
      providers_queried: 0,
      owned_cards_filter: false,
      ai_enabled: false,
      cache_hit: false,
    },
  };
}

/** Store-specific mock payloads when the API is down */
export function getStoreMockRecommendations(storeName: string): RecommendationResponse {
  const canonical =
    Object.keys(MOCK_BY_STORE).find(
      (k) => k.toLowerCase() === storeName.trim().toLowerCase()
    ) ?? storeName.trim();
  const offers = MOCK_BY_STORE[canonical] ?? DEFAULT_OFFERS;
  return buildResponse(canonical || storeName.trim() || "Amazon", offers);
}
