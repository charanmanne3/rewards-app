import type { RecommendationMatch } from "@/types/models";

import { getStoreMetadata } from "./storeMetadata";

export interface RankingContext {
  storeName: string;
  ownedCards: string[];
  preferApplePay?: boolean;
  categoryBoost?: number;
}

export interface RankedMatch extends RecommendationMatch {
  score: number;
  reasons: string[];
}

const CATEGORY_WEIGHTS: Record<string, number> = {
  PROMOTIONAL: 1.15,
  ROTATING: 1.08,
  STATIC: 1.0,
};

function isOwned(cardName: string, issuer: string, owned: string[]): boolean {
  const needle = `${cardName} ${issuer}`.toLowerCase();
  return owned.some(
    (o) =>
      o.toLowerCase().includes(cardName.toLowerCase()) ||
      needle.includes(o.toLowerCase())
  );
}

function applePayBonus(cardName: string, network: string | null): number {
  if (cardName.toLowerCase().includes("apple")) return 0.12;
  if (network?.toLowerCase().includes("mastercard")) return 0.04;
  return 0;
}

/**
 * Weighted scoring: cashback %, offer type, ownership, Apple Pay, category fit.
 */
export function rankRecommendationMatches(
  matches: RecommendationMatch[],
  context: RankingContext
): RankedMatch[] {
  const meta = getStoreMetadata(context.storeName);
  const categoryHint = meta?.category.toLowerCase() ?? "";

  return [...matches]
    .map((m) => {
      const reasons: string[] = [];
      let score = m.cashback_percent;

      score *= CATEGORY_WEIGHTS[m.reward_type] ?? 1;
      if (m.reward_type === "PROMOTIONAL") reasons.push("Active limited-time offer");
      if (m.reward_type === "ROTATING") reasons.push("Rotating category bonus");

      const owned = isOwned(m.card_name, m.issuer, context.ownedCards);
      if (owned) {
        score += 0.75;
        reasons.push("Card in your wallet");
      } else if (context.ownedCards.length) {
        reasons.push("Better card available — not in wallet");
      }

      if (context.preferApplePay) {
        score += applePayBonus(m.card_name, m.network) * 10;
        if (m.card_name.toLowerCase().includes("apple")) {
          reasons.push("2% Apple Pay Daily Cash");
        }
      }

      if (categoryHint.includes("dining") && m.card_name.toLowerCase().includes("gold")) {
        score += 0.5;
        reasons.push("4x dining multiplier");
      }
      if (categoryHint.includes("gas") && m.issuer.toLowerCase().includes("discover")) {
        score += 0.4;
        reasons.push("5% gas station category");
      }

      score += (m.confidence ?? 0.9) * 0.25;

      return { ...m, score, reasons, is_owned: owned || m.is_owned };
    })
    .sort((a, b) => b.score - a.score);
}

export function getBestRankedMatch(ranked: RankedMatch[]): RankedMatch | null {
  return ranked[0] ?? null;
}
