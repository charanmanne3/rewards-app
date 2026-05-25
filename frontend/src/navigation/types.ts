/**
 * Route params for Expo Router (built on React Navigation).
 *
 * File-based routes in app/:
 *   /                    → Home
 *   /stores              → Store list
 *   /best-rewards/[storeName] → Recommendation detail
 */
export type RootStackParamList = {
  index: undefined;
  stores: { q?: string };
  "cards/index": undefined;
  "offers/index": undefined;
  "best-rewards/[storeName]": { storeName: string };
};
