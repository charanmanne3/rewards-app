import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CompareCardsModal } from "@/components/search/CompareCardsModal";
import { RecentSearches } from "@/components/search/RecentSearches";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icons } from "@/components/ui/AppIcon";
import { ErrorState } from "@/components/ui/ErrorState";
import { PremiumSearchBar } from "@/components/ui/PremiumSearchBar";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { SearchSuggestions } from "@/features/home/components/SearchSuggestions";
import { useHomeSearch } from "@/features/home/hooks/useHomeSearch";
import { RecommendationSkeleton } from "@/features/recommendations/RecommendationSkeleton";
import { StoreRecommendationPanel } from "@/features/recommendations/StoreRecommendationPanel";
import { useCompareCards } from "@/hooks/useCompareCards";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { ApiError } from "@/services/api";
import { colors, spacing, typography } from "@/theme";
import { hapticLight, hapticSuccess } from "@/utils/haptics";

export default function SearchScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState("");
  const { recent, addRecent, clearRecent } = useRecentSearches();

  useEffect(() => {
    if (typeof q === "string" && q.trim()) setQuery(q.trim());
  }, [q]);

  const {
    suggestions,
    cardData,
    recommendationData,
    storeMetadata,
    showResults,
    showLoading,
    showEmpty,
    cardsSuccess,
    cardsError,
    cardsErrorObj,
    refetchRecommendations,
    isOfflineFallback,
    isMock,
  } = useHomeSearch(query);

  const {
    compareMode,
    selectedIds,
    compareOpen,
    selectedCards,
    toggleSelect,
    onToggleMode,
    openCompare,
    closeCompare,
  } = useCompareCards(cardData?.cards ?? []);

  useEffect(() => {
    if (cardsSuccess && cardData?.store_name) {
      addRecent(cardData.store_name);
      hapticSuccess();
    }
  }, [cardsSuccess, cardData?.store_name, addRecent]);

  useEffect(() => {
    onToggleMode(false);
  }, [cardData?.store_name, onToggleMode]);

  const selectStore = useCallback((name: string) => {
    hapticLight();
    setQuery(name);
    Keyboard.dismiss();
  }, []);

  const showSuggestions =
    query.trim().length >= 1 && suggestions.length > 0 && !showResults && !showLoading;
  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Store rewards</Text>
            <PremiumSearchBar
              value={query}
              onChangeText={setQuery}
              onClear={() => setQuery("")}
              placeholder="7-Eleven, Walmart, Costco..."
              autoFocus={Boolean(q)}
            />
            {showSuggestions ? (
              <SearchSuggestions suggestions={suggestions} onSelect={selectStore} />
            ) : null}
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={showLoading}
                onRefresh={() => refetchRecommendations()}
                tintColor={colors.primary}
              />
            }
          >
            {showLoading ? <RecommendationSkeleton /> : null}

            {cardsError && !cardData ? (
              <ErrorState
                message={
                  cardsErrorObj instanceof ApiError
                    ? cardsErrorObj.message
                    : "Unable to load recommendations."
                }
                onRetry={() => refetchRecommendations()}
              />
            ) : null}

            {isOfflineFallback ? (
              <Text style={styles.offlineHint}>
                {isMock ? "Offline curated picks" : "Cached results"}
              </Text>
            ) : null}

            {showResults && cardData && recommendationData ? (
              <StoreRecommendationPanel
                storeName={cardData.store_name ?? ""}
                storeCategory={cardData.store_category ?? ""}
                metadata={storeMetadata}
                bestCard={recommendationData.best_card ?? undefined}
                allMatches={recommendationData.all_matches ?? []}
                cards={cardData.cards ?? []}
                providerCount={recommendationData.meta?.providers_queried ?? 0}
                cacheHit={recommendationData.meta?.cache_hit ?? false}
                isMock={isMock}
                compareMode={compareMode}
                selectedIds={selectedIds}
                onToggleMode={onToggleMode}
                onCompare={openCompare}
                onToggleSelect={toggleSelect}
              />
            ) : null}

            {showEmpty ? (
              <EmptyState
                icon={Icons.search}
                title="No offers yet"
                message={`Try "7-Eleven", "Walmart", or "Starbucks" — we'll find your best card.`}
              />
            ) : null}

            {!query.trim() ? (
              <>
                <RecentSearches
                  items={recent}
                  onSelect={selectStore}
                  onClear={clearRecent}
                />
                <EmptyState
                  icon={Icons.search}
                  title="Search a store"
                  message="Type a store name — recommendations update as you type."
                />
              </>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {selectedCards.length >= 2 ? (
        <CompareCardsModal
          visible={compareOpen}
          onClose={closeCompare}
          cards={selectedCards}
          storeName={cardData?.store_name ?? ""}
        />
      ) : null}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.md,
    gap: spacing.md,
    zIndex: 10,
  },
  title: { ...typography.title, color: colors.text },
  scroll: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 120,
  },
  offlineHint: {
    ...typography.caption,
    color: colors.gold,
    textAlign: "center",
    marginBottom: spacing.md,
  },
});
