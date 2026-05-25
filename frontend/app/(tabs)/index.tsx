import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Keyboard,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { FloatingAIAssistant } from "@/components/ai/FloatingAIAssistant";
import { LocationStatusBar } from "@/components/location/LocationStatusBar";
import { NearbyStoresCarousel } from "@/components/location/NearbyStoresCarousel";
import { FeaturedStores } from "@/components/premium/FeaturedStores";
import { RecentSearches } from "@/components/search/RecentSearches";
import { CompareCardsModal } from "@/components/search/CompareCardsModal";
import { RecentStoresSection } from "@/components/stores/RecentStoresSection";
import { TrendingStoresSection } from "@/components/stores/TrendingStoresSection";
import { ApiStatusBar } from "@/components/ui/ApiStatusBar";
import { Icons } from "@/components/ui/AppIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FadeInView } from "@/components/ui/FadeInView";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PremiumSearchBar } from "@/components/ui/PremiumSearchBar";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { RecommendationSkeleton } from "@/features/recommendations/RecommendationSkeleton";
import { StoreRecommendationPanel } from "@/features/recommendations/StoreRecommendationPanel";
import { SearchSuggestions } from "@/features/home/components/SearchSuggestions";
import { TopCashbackSection } from "@/features/home/components/TopCashbackSection";
import {
  resolveRecentStores,
  resolveTrendingStores,
  useHomeSearch,
} from "@/features/home/hooks/useHomeSearch";
import { useCompareCards } from "@/hooks/useCompareCards";
import { useNearbyStores } from "@/hooks/useNearbyStores";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { useWalletProfile } from "@/hooks/useWalletProfile";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ApiError } from "@/services/api";
import { useApiHealth, usePromotionalOffers, useStores } from "@/services/queries";
import { colors, spacing, typography } from "@/theme";
import { TRENDING_STORE_NAMES } from "@/utils/storeBrands";
import { hapticLight, hapticSuccess } from "@/utils/haptics";

export default function HomeScreen() {
  // Expo Router requires default export — do not remove
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const { profile } = useWalletProfile();
  const { recent, addRecent, clearRecent } = useRecentSearches();
  const { refetch: refetchStores, isRefetching } = useStores();
  const { refetch: refetchOffers } = usePromotionalOffers();
  const {
    data: health,
    isLoading: healthLoading,
    isError: healthError,
    refetch: refetchHealth,
  } = useApiHealth();

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
  } = useHomeSearch(query, profile.ownedCards);

  const {
    stores: nearbyStores,
    closest,
    permission: locPermission,
    isLoading: nearbyLoading,
    requestPermission: requestLocPermission,
    refreshLocation,
  } = useNearbyStores(500);

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

  const { data: stores = [] } = useStores();
  const recentStores = resolveRecentStores(recent, stores);
  const trendingStores = resolveTrendingStores(stores, TRENDING_STORE_NAMES);

  const selectStore = useCallback(
    (name: string) => {
      hapticLight();
      setQuery(name);
      onToggleMode(false);
      Keyboard.dismiss();
    },
    [onToggleMode]
  );

  const openAllStores = () => {
    hapticLight();
    router.push("/stores/all");
  };

  const onRefresh = () => {
    refetchHealth();
    refetchStores();
    refetchOffers();
    refetchRecommendations();
  };

  const showSuggestions =
    query.trim().length >= 1 && suggestions.length > 0 && !showResults && !showLoading;

  const resultCards = cardData?.cards ?? [];

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <FadeInView delay={0}>
            <Text style={styles.hero}>Find your best card instantly</Text>
            <Text style={styles.subhero}>
              Location-aware AI picks the best card at every store
            </Text>
          </FadeInView>
          <ApiStatusBar
            health={health}
            isLoading={healthLoading}
            isError={healthError}
            isStale={isOfflineFallback}
            onRefresh={onRefresh}
          />
        </View>

        <View style={styles.searchWrap}>
          <PremiumSearchBar
            value={query}
            onChangeText={setQuery}
            onClear={() => {
              setQuery("");
              onToggleMode(false);
            }}
            placeholder="7-Eleven, Walmart, Costco, Starbucks..."
            large
            floating
            autoFocus
          />
          {showSuggestions ? (
            <FadeInView delay={50} direction="down">
              <SearchSuggestions suggestions={suggestions} onSelect={selectStore} />
            </FadeInView>
          ) : null}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
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
              {isMock
                ? "Offline mode — showing curated card picks"
                : "Showing cached results — pull to refresh"}
            </Text>
          ) : null}

          {showResults && cardData && recommendationData ? (
            <StoreRecommendationPanel
              storeName={cardData.store_name ?? ""}
              storeCategory={cardData.store_category ?? ""}
              metadata={storeMetadata}
              bestCard={recommendationData.best_card ?? undefined}
              allMatches={recommendationData.all_matches ?? []}
              cards={resultCards ?? []}
              providerCount={recommendationData.meta?.providers_queried ?? 0}
              cacheHit={recommendationData.meta?.cache_hit ?? false}
              isMock={isMock}
              compareMode={compareMode}
              selectedIds={selectedIds}
              onToggleMode={onToggleMode}
              onCompare={openCompare}
              onToggleSelect={toggleSelect}
            />
          ) : showEmpty ? (
            <EmptyState
              icon={Icons.search}
              title="No offers found"
              message={`We couldn't find active rewards for "${query.trim()}". Try another store.`}
            />
          ) : (
            <>
              {!query.trim() ? (
                <>
                  <LocationStatusBar
                    permission={locPermission}
                    isLoading={nearbyLoading}
                    storeCount={nearbyStores.length}
                    closestName={closest?.name}
                    closestDistanceM={closest?.distanceMeters}
                    onRequestPermission={requestLocPermission}
                    onRefresh={refreshLocation}
                  />
                  {nearbyStores.length > 0 ? (
                    <View style={styles.nearbyBlock}>
                      <SectionHeader title="Near you" />
                      <NearbyStoresCarousel
                        stores={nearbyStores.slice(0, 6)}
                        onSelect={(s) => selectStore(s.name)}
                      />
                    </View>
                  ) : null}
                </>
              ) : null}
              {recent.length > 0 && !query.trim() ? (
                <RecentSearches
                  items={recent}
                  onSelect={selectStore}
                  onClear={clearRecent}
                />
              ) : (
                <RecentStoresSection stores={recentStores} onSelect={selectStore} />
              )}
              <FeaturedStores onSelect={selectStore} />
              <TrendingStoresSection stores={trendingStores} onSelect={selectStore} />
              <TopCashbackSection />
            </>
          )}
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, spacing.sm) + 72 },
          ]}
        >
          <PrimaryButton label="All Stores" onPress={openAllStores} />
        </View>
      </SafeAreaView>

      <FloatingAIAssistant
        ownedCards={profile.ownedCards}
        onStoreResolved={selectStore}
      />

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
  header: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  hero: {
    ...typography.hero,
    color: colors.text,
    fontSize: 30,
    lineHeight: 36,
  },
  subhero: {
    ...typography.subhead,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  searchWrap: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.md,
    zIndex: 10,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
  },
  nearbyBlock: { marginBottom: spacing.md },
  offlineHint: {
    ...typography.caption,
    color: colors.gold,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
  },
});
