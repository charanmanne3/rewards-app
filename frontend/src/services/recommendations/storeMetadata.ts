/**
 * Client-side store catalog — logos, categories, popular cards, and aliases.
 * Merged with API store list when available.
 */

export interface StoreMetadata {
  /** Canonical display name (matches API when seeded) */
  name: string;
  category: string;
  aliases: string[];
  popularCards: string[];
  /** Short reward context for empty/offline states */
  rewardHint: string;
  /** Future: GPS / nearby store matching */
  nearbyCapable: boolean;
}

export const STORE_METADATA: StoreMetadata[] = [
  {
    name: "7-Eleven",
    category: "Convenience & Gas",
    aliases: ["7 eleven", "7eleven", "711", "seven eleven", "seven-eleven"],
    popularCards: ["Discover IT", "Chase Freedom Flex", "Apple Card"],
    rewardHint: "Gas stations & convenience — rotating 5% categories shine here",
    nearbyCapable: true,
  },
  {
    name: "Walmart",
    category: "Grocery & General",
    aliases: ["wal-mart", "wal mart"],
    popularCards: ["Amex Blue Cash Preferred", "Chase Freedom Flex", "Citi Double Cash"],
    rewardHint: "Grocery & general merchandise cashback",
    nearbyCapable: true,
  },
  {
    name: "Costco",
    category: "Warehouse Club",
    aliases: ["costco wholesale"],
    popularCards: ["Capital One Venture X", "Chase Freedom Flex", "Citi Double Cash"],
    rewardHint: "Warehouse clubs — pair with a strong everyday card",
    nearbyCapable: true,
  },
  {
    name: "Starbucks",
    category: "Dining & Coffee",
    aliases: ["star bucks", "sbux"],
    popularCards: ["Amex Gold", "Apple Card", "Chase Sapphire Preferred"],
    rewardHint: "Dining & coffee — Apple Pay and Amex dining credits",
    nearbyCapable: true,
  },
  {
    name: "Amazon",
    category: "Online Retail",
    aliases: ["amazon.com", "amzn"],
    popularCards: ["Chase Freedom Flex", "Amazon Prime Visa", "Citi Double Cash"],
    rewardHint: "Online retail — rotating 5% and Prime card bonuses",
    nearbyCapable: false,
  },
  {
    name: "Target",
    category: "Department Store",
    aliases: ["target store"],
    popularCards: ["Chase Freedom Flex", "Target RedCard", "Apple Card"],
    rewardHint: "Department stores & home — quarterly 5% categories",
    nearbyCapable: true,
  },
  {
    name: "Best Buy",
    category: "Electronics",
    aliases: ["bestbuy", "best-buy"],
    popularCards: ["Chase Freedom Flex", "Citi Double Cash", "Discover IT"],
    rewardHint: "Electronics — activate rotating categories before big purchases",
    nearbyCapable: true,
  },
  {
    name: "Kroger",
    category: "Grocery",
    aliases: ["kroger's", "ralphs", "fred meyer"],
    popularCards: ["Amex Blue Cash Preferred", "Chase Freedom Flex", "Discover IT"],
    rewardHint: "US grocery — 6% on supermarkets with Blue Cash Preferred",
    nearbyCapable: true,
  },
  {
    name: "CVS",
    category: "Pharmacy",
    aliases: ["cvs pharmacy"],
    popularCards: ["Amex Blue Cash Preferred", "Chase Freedom Flex", "Discover IT"],
    rewardHint: "Pharmacy & drugstores",
    nearbyCapable: true,
  },
  {
    name: "Walgreens",
    category: "Pharmacy",
    aliases: ["walgreen", "walgreens pharmacy"],
    popularCards: ["Amex Blue Cash Preferred", "Chase Freedom Flex", "Discover IT"],
    rewardHint: "Pharmacy rewards & wellness purchases",
    nearbyCapable: true,
  },
  {
    name: "Home Depot",
    category: "Home Improvement",
    aliases: ["homedepot", "home depot"],
    popularCards: ["Chase Freedom Flex", "Chase Sapphire Preferred", "Discover IT"],
    rewardHint: "Home improvement — rotating home/furnishing categories",
    nearbyCapable: true,
  },
  {
    name: "Whole Foods",
    category: "Grocery",
    aliases: ["whole foods market", "wholefoods", "wf"],
    popularCards: ["Amex Blue Cash Preferred", "Chase Freedom Flex", "Apple Card"],
    rewardHint: "Organic grocery — 6% supermarkets on Blue Cash Preferred",
    nearbyCapable: true,
  },
  {
    name: "Shell",
    category: "Gas Station",
    aliases: ["shell gas", "shell station"],
    popularCards: ["Discover IT", "Chase Freedom Flex", "Citi Double Cash"],
    rewardHint: "Fuel — activate gas station rotating categories",
    nearbyCapable: true,
  },
  {
    name: "Chevron",
    category: "Gas Station",
    aliases: ["chevron gas", "chevron station"],
    popularCards: ["Discover IT", "Chase Freedom Flex", "Wells Fargo Active Cash"],
    rewardHint: "Gas stations — maximize with 5% rotating cards",
    nearbyCapable: true,
  },
];

const BY_NAME = new Map(STORE_METADATA.map((s) => [s.name.toLowerCase(), s]));

export function getStoreMetadata(name: string): StoreMetadata | undefined {
  return BY_NAME.get(name.trim().toLowerCase());
}

export function getAllStoreMetadata(): StoreMetadata[] {
  return STORE_METADATA;
}

export function mergeStoreWithMetadata(
  apiName: string,
  apiCategory: string
): StoreMetadata {
  const meta = getStoreMetadata(apiName);
  if (meta) return { ...meta, category: apiCategory || meta.category };
  return {
    name: apiName,
    category: apiCategory,
    aliases: [],
    popularCards: [],
    rewardHint: "Compare cards to maximize cashback at checkout",
    nearbyCapable: false,
  };
}
