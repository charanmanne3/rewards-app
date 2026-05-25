import type { RecommendationMatch, StoreCardMatch } from "@/types/models";
import { resolveCardId } from "@/utils/listKeys";

export function recommendationToCardMatch(match: RecommendationMatch): StoreCardMatch {
  return {
    card_id: resolveCardId(
      match.card_id,
      match.card_name,
      match.issuer,
      match.reward_type
    ),
    card_name: match.card_name,
    issuer: match.issuer,
    cashback_percent: match.cashback_percent,
    reward_type: match.reward_type,
    annual_fee: match.annual_fee ?? 0,
    expires_at: match.expires_at,
    signup_bonus: match.signup_bonus,
    network: match.network,
  };
}

export const PROVIDER_LABELS: Record<string, string> = {
  database: "Live Catalog",
  cached: "Cached",
  affiliate: "Affiliate",
  plaid: "Plaid",
  stripe_fc: "Stripe",
  ai: "AI",
};

export function providerLabel(slug: string): string {
  return PROVIDER_LABELS[slug] ?? slug;
}
