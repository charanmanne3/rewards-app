export type RecommendationSource = "rule" | "ai";

export interface RecommendationContext {
  storeName?: string;
  userQuery?: string;
  cards: import("@/types/models").StoreCardMatch[];
}

export interface Recommendation {
  id: string;
  headline: string;
  body: string;
  cardId: number;
  cardName: string;
  cashbackPercent: number;
  confidence: number;
  source: RecommendationSource;
}

export interface RecommendationProvider {
  getRecommendations(context: RecommendationContext): Recommendation[];
}
