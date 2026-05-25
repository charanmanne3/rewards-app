/** React Query keys for recommendations — isolated to avoid import cycles. */
export const recommendationQueryKeys = {
  all: ["recommendations"] as const,
  store: (store: string, owned: string) =>
    [...recommendationQueryKeys.all, store, owned] as const,
};
