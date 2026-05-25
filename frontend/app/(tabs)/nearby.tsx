import { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { FloatingAIAssistant } from "@/components/ai/FloatingAIAssistant";
import { LocationStatusBar } from "@/components/location/LocationStatusBar";
import { MapPreviewCard } from "@/components/location/MapPreviewCard";
import { NearbyStoresCarousel } from "@/components/location/NearbyStoresCarousel";
import { RadiusFilter } from "@/components/location/RadiusFilter";
import { BestCardHero } from "@/features/recommendations/BestCardHero";
import { RecommendationSkeleton } from "@/features/recommendations/RecommendationSkeleton";
import { SmartRecommendationCard } from "@/features/recommendations/SmartRecommendationCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icons } from "@/components/ui/AppIcon";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useLocationRecommendations } from "@/hooks/useLocationRecommendations";
import { useNearbyStores } from "@/hooks/useNearbyStores";
import { useWalletProfile } from "@/hooks/useWalletProfile";
import { notifyNearStore } from "@/services/notifications";
import type { NearbyRadius, NearbyStore } from "@/services/stores";
import { mergeStoreWithMetadata, type RankedMatch } from "@/services/recommendations";
import { colors, spacing, typography } from "@/theme";
import { recommendationMatchKey } from "@/utils/listKeys";
import { hapticLight } from "@/utils/haptics";

export default function NearbyScreen() {
  const insets = useSafeAreaInsets();
  const [radius, setRadius] = useState<NearbyRadius>(500);
  const [selected, setSelected] = useState<NearbyStore | null>(null);
  const { profile } = useWalletProfile();

  const {
    stores,
    closest,
    coords,
    permission,
    isLoading,
    requestPermission,
    refreshLocation,
    refetch,
  } = useNearbyStores(radius);

  const storeName = selected?.name ?? closest?.name;
  const { data: bundle, isFetching: recLoading } = useLocationRecommendations(storeName);

  useEffect(() => {
    if (closest && !selected) setSelected(closest);
  }, [closest, selected]);

  useEffect(() => {
    if (bundle?.best && selected?.name) {
      void notifyNearStore(
        selected.name,
        bundle.best.card_name,
        bundle.best.cashback_percent
      );
    }
  }, [bundle?.best?.card_name, selected?.name]);

  const onSelectStore = useCallback((store: NearbyStore) => {
    hapticLight();
    setSelected(store);
  }, []);

  const meta = storeName ? mergeStoreWithMetadata(storeName, selected?.category ?? "") : undefined;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 140 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => {
                void refreshLocation();
                void refetch();
              }}
              tintColor={colors.primary}
            />
          }
        >
          <Text style={styles.title}>Near Me</Text>
          <Text style={styles.sub}>AI-powered picks based on your location</Text>

          <LocationStatusBar
            permission={permission}
            isLoading={isLoading}
            storeCount={stores.length}
            closestName={closest?.name}
            closestDistanceM={closest?.distanceMeters}
            onRequestPermission={requestPermission}
            onRefresh={refreshLocation}
          />

          <RadiusFilter value={radius} onChange={setRadius} />
          <MapPreviewCard coords={coords} storeName={selected?.name} />

          <SectionHeader title="Nearby stores" />
          {stores.length ? (
            <NearbyStoresCarousel
              stores={stores}
              selectedName={selected?.name}
              onSelect={onSelectStore}
            />
          ) : !isLoading ? (
            <EmptyState
              icon={Icons.storefront}
              title="No stores nearby"
              message="Increase radius or enable location to discover cashback opportunities."
            />
          ) : null}

          {recLoading ? <RecommendationSkeleton /> : null}

          {bundle?.best ? (
            <>
              <BestCardHero
                storeName={bundle.storeName}
                storeCategory={bundle.storeCategory}
                best={bundle.best}
                rewardHint={meta?.rewardHint}
              />
              {bundle.missedRewards ? (
                <Text style={styles.missed}>
                  You have a card in wallet — but a better option earns more here
                </Text>
              ) : null}
              {bundle.ranked.slice(1, 4).map((match: RankedMatch, index: number) => (
                <SmartRecommendationCard
                  key={recommendationMatchKey(match)}
                  match={match}
                  index={index}
                />
              ))}
            </>
          ) : null}
        </ScrollView>

        <FloatingAIAssistant
          ownedCards={profile.ownedCards}
          fallbackStore={storeName}
          onStoreResolved={(name) => {
            const hit = stores.find((s) => s.name === name);
            if (hit) setSelected(hit);
          }}
        />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.screen, paddingTop: spacing.sm },
  title: { ...typography.title, color: colors.text, fontSize: 28 },
  sub: { ...typography.subhead, color: colors.textMuted, marginBottom: spacing.md },
  missed: {
    ...typography.caption,
    color: colors.gold,
    marginBottom: spacing.md,
    textAlign: "center",
  },
});
