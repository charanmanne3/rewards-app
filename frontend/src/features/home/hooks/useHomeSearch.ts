import { useMemo } from "react";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useRecommendations } from "@/hooks/useRecommendations";
import {
  buildRecommendations,
  filterStoresByQuery,
  mergeStoreWithMetadata,
  resolveSearchTarget,
} from "@/services/recommendations";
import { useStores } from "@/services/queries";
import type { ProviderSource, Store, StoreCardMatch } from "@/types/models";
import {
  hasRecommendationResults,
  normalizeRecommendationResponse,
} from "@/utils/recommendationGuards";
import {
  dedupeCardMatches,
  dedupeRecommendationMatches,
  dedupeStores,
} from "@/utils/listKeys";
import { recommendationToCardMatch } from "@/utils/recommendations";

const MIN_QUERY = 2;

export function useHomeSearch(query: string, ownedCards: string[] = []) {
  const debouncedQuery = useDebouncedValue(query.trim(), 280);
  const { data: stores = [], isLoading: storesLoading } = useStores();

  const searchTarget = useMemo(
    () => (debouncedQuery.length >= MIN_QUERY ? resolveSearchTarget(debouncedQuery, stores) : ""),
    [debouncedQuery, stores]
  );

  const shouldFetch = searchTarget.length >= MIN_QUERY;

  const {
    data: rawRecommendationData,
    isFetching: recFetching,
    isSuccess: recSuccess,
    isError: recError,
    error: recErrorObj,
    refetch: refetchRecommendations,
    isPlaceholderData,
  } = useRecommendations(shouldFetch ? searchTarget : undefined, {
    ownedCards,
  });

  const recommendationData = useMemo(
    () => normalizeRecommendationResponse(rawRecommendationData),
    [rawRecommendationData]
  );

  const storeMetadata = useMemo(() => {
    if (!recommendationData?.store_name) return undefined;
    return mergeStoreWithMetadata(
      recommendationData.store_name,
      recommendationData.store_category
    );
  }, [recommendationData]);

  const suggestions = useMemo(() => {
    if (debouncedQuery.length < 1) return [];
    return filterStoresByQuery(stores, debouncedQuery);
  }, [debouncedQuery, stores]);

  const cardData = useMemo(() => {
    if (!recommendationData) return undefined;
    const matches = dedupeRecommendationMatches(recommendationData.all_matches ?? []);
    const cards: StoreCardMatch[] = dedupeCardMatches(
      matches.map(recommendationToCardMatch)
    );
    return {
      store_name: recommendationData.store_name,
      store_category: recommendationData.store_category,
      as_of_date: recommendationData.as_of_date,
      cards,
    };
  }, [recommendationData]);

  const recommendations = useMemo(
    () => (recommendationData ? buildRecommendations(recommendationData) : []),
    [recommendationData]
  );

  const isMock =
    recommendationData?.provider_sources?.some(
      (p: ProviderSource) => p.status === "mock"
    ) ?? false;

  const hasResults = shouldFetch && hasRecommendationResults(recommendationData);
  const showResults = hasResults && Boolean(cardData?.cards?.length);
  const showLoading = shouldFetch && recFetching && !recommendationData;
  const showEmpty =
    shouldFetch && !recFetching && !recError && !showResults && debouncedQuery.length >= MIN_QUERY;

  return {
    debouncedQuery,
    searchTarget,
    stores,
    storesLoading,
    suggestions,
    storeMetadata,
    cardData,
    recommendationData,
    cardsFetching: recFetching,
    cardsSuccess: recSuccess && showResults,
    cardsError: recError,
    cardsErrorObj: recErrorObj,
    refetchRecommendations,
    isOfflineFallback: (isPlaceholderData && recError) || isMock,
    recommendations,
    showResults,
    showLoading,
    showEmpty,
    shouldFetchCards: shouldFetch,
    isMock,
  };
}

export function resolveRecentStores(recent: string[], stores: Store[]): Store[] {
  if (!recent.length) return [];
  const byName = new Map(stores.map((s) => [s.name.toLowerCase(), s]));
  const out: Store[] = [];
  for (const name of recent) {
    const hit = byName.get(name.toLowerCase());
    if (hit) out.push(hit);
    else {
      const meta = mergeStoreWithMetadata(name, "");
      out.push({ id: 0, name: meta.name, category: meta.category });
    }
  }
  return dedupeStores(out);
}

export function resolveTrendingStores(stores: Store[], names: readonly string[]): Store[] {
  if (!stores.length && !names.length) return [];
  const byName = new Map(stores.map((s) => [s.name, s]));
  const merged = names.map(
    (name) =>
      byName.get(name) ?? {
        id: 0,
        name,
        category: mergeStoreWithMetadata(name, "").category,
      }
  );
  return dedupeStores(merged.filter((s): s is Store => Boolean(s?.name)));
}
