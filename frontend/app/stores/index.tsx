import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CompareCardsModal } from "@/components/search/CompareCardsModal";
import { FadeSlideIn } from "@/components/search/FadeSlideIn";
import { PopularStores } from "@/components/search/PopularStores";
import { RecentSearches } from "@/components/search/RecentSearches";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import { SearchError, SearchLoading } from "@/components/search/SearchStatus";
import { WalletMatchCard } from "@/components/search/WalletMatchCard";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { ApiError } from "@/services/api";
import { useStoreCards } from "@/services/queries";
import { colors, spacing, typography } from "@/theme";
import type { StoreCardMatch } from "@/types/models";

const MIN_QUERY_LENGTH = 2;

export default function SearchScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState("");
  const [compareOpen, setCompareOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const { recent, addRecent, clearRecent } = useRecentSearches();

  useEffect(() => {
    if (typeof q === "string" && q.trim()) {
      setQuery(q.trim());
    }
  }, [q]);

  const shouldSearch = debouncedQuery.length >= MIN_QUERY_LENGTH;
  const { data, isFetching, isError, error, refetch, isSuccess } = useStoreCards(
    shouldSearch ? debouncedQuery : undefined
  );

  useEffect(() => {
    if (isSuccess && data?.cards.length && debouncedQuery) {
      addRecent(data.store_name);
    }
  }, [isSuccess, data?.store_name, data?.cards.length, debouncedQuery, addRecent]);

  const selectStore = (name: string) => {
    setQuery(name);
    Keyboard.dismiss();
  };

  const showIdle = !shouldSearch;
  const showLoading = shouldSearch && isFetching && !data;
  const showResults = shouldSearch && data && data.cards.length > 0;
  const is404 = error instanceof ApiError && error.status === 404;
  const showNotFound = shouldSearch && !isFetching && isError && is404;
  const showError = shouldSearch && !isFetching && isError && !is404;

  const errorMessage =
    error instanceof ApiError
      ? error.status === 404
        ? `No store or rewards found for "${debouncedQuery}"`
        : error.message
      : "Could not reach the API. Check your connection and EXPO_PUBLIC_API_URL.";

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Find your best card</Text>
          <Text style={styles.subtitle}>Search a store — all matching cards appear instantly</Text>

          <SearchBar value={query} onChangeText={setQuery} onClear={() => setQuery("")} />

          {showLoading ? <SearchLoading query={debouncedQuery} /> : null}

          {showNotFound ? (
            <FadeSlideIn>
              <SearchEmptyState variant="no-results" query={debouncedQuery} />
            </FadeSlideIn>
          ) : null}

          {showError ? <SearchError message={errorMessage} onRetry={() => refetch()} /> : null}

          {showResults && data ? (
            <FadeSlideIn key={data.store_name + data.as_of_date}>
              <View style={styles.resultsHeader}>
                <View>
                  <Text style={styles.storeName}>{data.store_name}</Text>
                  <Text style={styles.storeMeta}>
                    {data.store_category} · {data.cards.length} cards · as of {data.as_of_date}
                  </Text>
                </View>
              </View>

              {data.cards.map((card: StoreCardMatch, index: number) => (
                <WalletMatchCard
                  key={card.card_id}
                  card={card}
                  index={index}
                  storeName={data.store_name}
                />
              ))}

              {data.cards.length > 1 ? (
                <Pressable
                  style={({ pressed }) => [styles.compareBtn, pressed && styles.comparePressed]}
                  onPress={() => setCompareOpen(true)}
                >
                  <Text style={styles.compareText}>Compare cards</Text>
                </Pressable>
              ) : null}
            </FadeSlideIn>
          ) : null}

          {showIdle ? (
            <>
              <SearchEmptyState variant="idle" />
              <RecentSearches items={recent} onSelect={selectStore} onClear={clearRecent} />
              <PopularStores onSelect={selectStore} />
            </>
          ) : null}

          {shouldSearch && isFetching && data ? (
            <Pressable onPress={() => refetch()} style={styles.refreshHint}>
              <Text style={styles.refreshText}>Updating…</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      {data && data.cards.length > 1 ? (
        <CompareCardsModal
          visible={compareOpen}
          onClose={() => setCompareOpen(false)}
          cards={data.cards}
          storeName={data.store_name}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  resultsHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  storeName: {
    ...typography.title,
    color: colors.text,
    fontSize: 22,
  },
  storeMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  compareBtn: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gold,
    marginTop: spacing.sm,
  },
  comparePressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  compareText: {
    ...typography.subtitle,
    color: colors.gold,
  },
  refreshHint: { alignItems: "center", marginTop: spacing.sm },
  refreshText: {
    ...typography.micro,
    color: colors.textMuted,
    textTransform: "none",
  },
});
