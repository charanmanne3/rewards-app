import type { PromotionalOffer, RecommendationMatch, Store, StoreCardMatch } from "@/types/models";

/** Stable numeric id when API omits card_id (avoids duplicate key `0`). */
export function resolveCardId(
  cardId: number | null | undefined,
  cardName: string,
  issuer: string,
  extra = ""
): number {
  if (cardId != null && cardId !== 0) return cardId;
  const seed = `${cardName}|${issuer}|${extra}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h) || 1;
}

export function storeRowKey(store: Pick<Store, "id" | "name">): string {
  const idPart = store.id > 0 ? String(store.id) : "meta";
  return `store:${store.name.toLowerCase()}:${idPart}`;
}

export function recommendationMatchKey(match: RecommendationMatch): string {
  return [
    match.card_name,
    match.issuer,
    match.reward_type,
    String(match.cashback_percent),
    match.provider_source ?? "",
    match.card_id != null ? String(match.card_id) : "na",
  ].join("|");
}

export function cardMatchKey(card: StoreCardMatch): string {
  return `${card.card_name}|${card.issuer}|${card.reward_type}|${card.cashback_percent}|${card.card_id}`;
}

export function offerRowKey(offer: PromotionalOffer): string {
  return `offer:${offer.id}:${offer.store_name}:${offer.card_name}`;
}

export function dedupeByKey<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export function dedupeStores(stores: Store[]): Store[] {
  return dedupeByKey(stores, (s) => s.name.toLowerCase().trim());
}

export function dedupeRecommendationMatches(
  matches: RecommendationMatch[]
): RecommendationMatch[] {
  return dedupeByKey(matches, recommendationMatchKey);
}

export function dedupeCardMatches(cards: StoreCardMatch[]): StoreCardMatch[] {
  return dedupeByKey(cards, cardMatchKey);
}

export function dedupeOffers(offers: PromotionalOffer[]): PromotionalOffer[] {
  return dedupeByKey(offers, offerRowKey);
}

export function dedupeStrings(items: string[]): string[] {
  return dedupeByKey(items, (s) => s.toLowerCase().trim());
}
