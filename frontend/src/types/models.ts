export type RewardType = "STATIC" | "ROTATING" | "PROMOTIONAL";

export interface StoreCardMatch {
  card_id: number;
  card_name: string;
  issuer: string;
  cashback_percent: number;
  reward_type: RewardType;
  annual_fee: number;
  expires_at: string | null;
  signup_bonus: string | null;
  network: string | null;
}

export interface StoreCardsResponse {
  store_name: string;
  store_category: string;
  as_of_date: string;
  cards: StoreCardMatch[];
}

export interface Store {
  id: number;
  name: string;
  category: string;
}

export interface CreditCard {
  id: number;
  card_name: string;
  issuer: string;
}

export interface CardRewardRank {
  card_id: number;
  card_name: string;
  issuer: string;
  cashback_percent: number;
  reward_type: RewardType;
  reward_id: number;
  start_date: string | null;
  end_date: string | null;
}

export interface BestCardRecommendation {
  store_name: string;
  store_category: string;
  as_of_date: string;
  best_card: CardRewardRank | null;
  all_ranked_cards: CardRewardRank[];
}

export interface PromotionalOffer {
  id: number;
  store_name: string;
  store_category: string;
  card_name: string;
  issuer: string;
  cashback_percent: number;
  start_date: string | null;
  end_date: string | null;
}

export interface CardRewardSummary {
  store_name: string;
  store_category: string;
  cashback_percent: number;
  reward_type: RewardType;
}

export interface CreditCardDetail {
  id: number;
  card_name: string;
  issuer: string;
  rewards: CardRewardSummary[];
}

export interface ApiErrorBody {
  detail: string | { msg: string; type?: string }[];
}

export type CardBadge = "BEST_VALUE" | "NO_ANNUAL_FEE" | "PREMIUM";

/** Unified recommendations API (POST /recommendations) */
export interface ProviderSource {
  provider: string;
  display_name: string;
  offer_count: number;
  last_refreshed_at: string | null;
  status: string;
  error_message: string | null;
}

export interface RecommendationMatch {
  card_id: number | null;
  card_name: string;
  issuer: string;
  cashback_percent: number;
  reward_type: RewardType;
  annual_fee: number | null;
  signup_bonus: string | null;
  network: string | null;
  expires_at: string | null;
  provider_source: string;
  is_owned: boolean;
  confidence: number;
}

export interface RecommendationMeta {
  engine_version: string;
  providers_queried: number;
  owned_cards_filter: boolean;
  ai_enabled: boolean;
  cache_hit: boolean;
}

export interface RecommendationResponse {
  store_name: string;
  store_category: string;
  as_of_date: string;
  best_card: RecommendationMatch | null;
  all_matches: RecommendationMatch[];
  provider_sources: ProviderSource[];
  meta: RecommendationMeta;
}

export interface RecommendationRequest {
  store: string;
  owned_cards?: string[];
  categories?: string[];
}

/** GET /recommend?category=... */
export interface CategoryRecommendItem {
  card_name: string;
  reward_category: string;
  reward_rate: string;
  annual_fee: number | null;
}

export interface ApiHealthResponse {
  status: "ok" | "degraded";
  version: string;
  environment: string;
  database: string;
  providers: {
    slug: string;
    display_name: string;
    enabled: boolean;
    last_sync_at: string | null;
  }[];
  jobs: {
    expiration_enabled: boolean;
    offer_refresh_enabled: boolean;
    offer_refresh_hours: number;
  };
}
