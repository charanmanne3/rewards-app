import type { Recommendation, RecommendationContext, RecommendationProvider } from "./types";

/** Rule-based engine — swap for AI provider without changing UI */
export class RuleRecommendationEngine implements RecommendationProvider {
  getRecommendations(context: RecommendationContext): Recommendation[] {
    const { cards, storeName, userQuery } = context;
    if (!cards.length) return [];

    const best = cards[0];
    const store = storeName ?? "this store";

    return [
      {
        id: `rule-${best.card_id}`,
        headline: `Use ${best.card_name}`,
        body: userQuery
          ? `Best match for "${userQuery.trim()}" — ${best.cashback_percent}% back at ${store}.`
          : `${best.cashback_percent}% cashback at ${store}. ${best.annual_fee === 0 ? "No annual fee." : ""}`.trim(),
        cardId: best.card_id,
        cardName: best.card_name,
        cashbackPercent: best.cashback_percent,
        confidence: 0.92,
        source: "rule",
      },
    ];
  }
}

/** Placeholder for future LLM / AI integration */
export class AIRecommendationEngine implements RecommendationProvider {
  constructor(private fallback: RecommendationProvider) {}

  getRecommendations(context: RecommendationContext): Recommendation[] {
    // Future: call AI API with context.userQuery + context.cards
    return this.fallback.getRecommendations(context);
  }
}

export const recommendationEngine = new AIRecommendationEngine(new RuleRecommendationEngine());
