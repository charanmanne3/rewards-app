import type { StoreCardMatch, CardBadge } from "@/types/models";

const PREMIUM_FEE_THRESHOLD = 95;

export function getCardBadges(card: StoreCardMatch, index: number): CardBadge[] {
  const badges: CardBadge[] = [];
  if (index === 0) badges.push("BEST_VALUE");
  if (card.annual_fee === 0) badges.push("NO_ANNUAL_FEE");
  if (card.annual_fee >= PREMIUM_FEE_THRESHOLD) badges.push("PREMIUM");
  return badges;
}

export function formatAnnualFee(fee: number): string {
  return fee === 0 ? "$0" : `$${fee}/yr`;
}

export function formatExpiry(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export const BADGE_LABELS: Record<CardBadge, string> = {
  BEST_VALUE: "BEST VALUE",
  NO_ANNUAL_FEE: "NO ANNUAL FEE",
  PREMIUM: "PREMIUM",
};

export const BADGE_COLORS: Record<CardBadge, { bg: string; text: string }> = {
  BEST_VALUE: { bg: "rgba(212, 175, 55, 0.25)", text: "#D4AF37" },
  NO_ANNUAL_FEE: { bg: "rgba(16, 185, 129, 0.2)", text: "#10B981" },
  PREMIUM: { bg: "rgba(139, 92, 246, 0.2)", text: "#A78BFA" },
};
