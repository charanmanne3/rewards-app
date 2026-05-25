import { resolveCanonicalStoreName } from "@/services/recommendations/aliases";
import { getRecommendationsForNearbyStore } from "@/services/recommendations/locationRecommendations";
import type { LocationRecommendationBundle } from "@/services/recommendations/locationRecommendations";

export interface AIQueryResult {
  intent: "nearby" | "store" | "category" | "general";
  storeName?: string;
  category?: string;
  summary: string;
  bundle: LocationRecommendationBundle | null;
}

const CATEGORY_PATTERNS: Array<{ re: RegExp; category: string }> = [
  { re: /\bgas\b|\bfuel\b|\bstation\b/i, category: "gas" },
  { re: /\bdining\b|\brestaurant\b|\bcoffee\b/i, category: "dining" },
  { re: /\bgrocery\b|\bsupermarket\b/i, category: "grocery" },
  { re: /\btravel\b|\bflight\b|\bhotel\b/i, category: "travel" },
];

export function parseNaturalLanguageQuery(query: string): {
  intent: AIQueryResult["intent"];
  storeName?: string;
  category?: string;
} {
  const q = query.trim();
  if (!q) return { intent: "general" };

  if (/\bnear me\b|\baround me\b|\bnearby\b/i.test(q)) {
    for (const { re, category } of CATEGORY_PATTERNS) {
      if (re.test(q)) return { intent: "category", category };
    }
    return { intent: "nearby" };
  }

  for (const { re, category } of CATEGORY_PATTERNS) {
    if (re.test(q)) return { intent: "category", category };
  }

  const store = resolveCanonicalStoreName(q);
  if (store) return { intent: "store", storeName: store };

  const atMatch = q.match(/(?:at|for)\s+([a-z0-9\s&'-]+)/i);
  if (atMatch?.[1]) {
    const resolved = resolveCanonicalStoreName(atMatch[1]);
    if (resolved) return { intent: "store", storeName: resolved };
  }

  return { intent: "general" };
}

export async function runAIAssistantQuery(
  query: string,
  options: {
    ownedCards?: string[];
    fallbackStore?: string;
  } = {}
): Promise<AIQueryResult> {
  const parsed = parseNaturalLanguageQuery(query);
  const owned = options.ownedCards ?? [];

  let storeName = parsed.storeName ?? options.fallbackStore;

  if (parsed.intent === "category" && !storeName) {
    const defaults: Record<string, string> = {
      gas: "Shell",
      dining: "Starbucks",
      grocery: "Whole Foods",
      travel: "Costco",
    };
    storeName = parsed.category ? defaults[parsed.category] : undefined;
  }

  if (!storeName) {
    return {
      intent: parsed.intent,
      category: parsed.category,
      summary: "Try asking: “Best card near me for gas” or search a store name.",
      bundle: null,
    };
  }

  const bundle = await getRecommendationsForNearbyStore(storeName, owned, {
    preferApplePay: true,
  });

  if (!bundle?.best) {
    return {
      intent: parsed.intent,
      storeName,
      category: parsed.category,
      summary: `No live offers found for ${storeName}. Check back soon.`,
      bundle: null,
    };
  }

  const best = bundle.best;
  const summary = `Use ${best.card_name} at ${storeName} for ${best.cashback_percent}% back.${
    best.reasons[0] ? ` ${best.reasons[0]}.` : ""
  }`;

  return {
    intent: parsed.intent,
    storeName,
    category: parsed.category,
    summary,
    bundle,
  };
}
