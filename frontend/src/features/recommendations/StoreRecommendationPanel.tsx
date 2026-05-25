import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { PremiumWalletCard } from "@/components/premium/PremiumWalletCard";
import { CompareCardsToolbar } from "@/components/search/CompareCardsToolbar";
import { BestCardHero } from "@/features/recommendations/BestCardHero";
import { SmartRecommendationCard } from "@/features/recommendations/SmartRecommendationCard";
import { colors, spacing, typography } from "@/theme";
import type { RecommendationMatch, StoreCardMatch } from "@/types/models";
import type { StoreMetadata } from "@/services/recommendations";
import {
  cardMatchKey,
  dedupeCardMatches,
  dedupeRecommendationMatches,
  recommendationMatchKey,
} from "@/utils/listKeys";

interface StoreRecommendationPanelProps {
  storeName: string;
  storeCategory: string;
  metadata?: StoreMetadata;
  bestCard: RecommendationMatch | null | undefined;
  allMatches: RecommendationMatch[];
  cards: StoreCardMatch[];
  providerCount: number;
  cacheHit?: boolean;
  isMock?: boolean;
  compareMode: boolean;
  selectedIds: Set<number>;
  onToggleMode: (v: boolean) => void;
  onCompare: () => void;
  onToggleSelect: (id: number) => void;
}

export function StoreRecommendationPanel({
  storeName,
  storeCategory,
  metadata,
  bestCard,
  allMatches = [],
  cards = [],
  providerCount = 0,
  cacheHit = false,
  isMock = false,
  compareMode,
  selectedIds,
  onToggleMode,
  onCompare,
  onToggleSelect,
}: StoreRecommendationPanelProps) {
  const safeMatches = dedupeRecommendationMatches(allMatches ?? []);
  const safeCards = dedupeCardMatches(cards ?? []);

  if (!safeCards.length && !bestCard) {
    return null;
  }

  const secondaryMatches = bestCard
    ? safeMatches.filter(
        (m) => m.card_id !== bestCard.card_id || m.card_name !== bestCard.card_name
      )
    : safeMatches.slice(1);

  const matchByCardId = new Map(
    safeMatches
      .filter((m): m is RecommendationMatch & { card_id: number } => m.card_id != null)
      .map((m) => [m.card_id, m])
  );

  return (
    <Animated.View entering={FadeIn.duration(320)} style={styles.wrap}>
      {bestCard ? (
        <BestCardHero
          storeName={storeName}
          storeCategory={storeCategory}
          best={bestCard}
          rewardHint={metadata?.rewardHint}
        />
      ) : null}

      {secondaryMatches.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active offers & alternatives</Text>
          {secondaryMatches.map((match, index) => (
            <SmartRecommendationCard
              key={recommendationMatchKey(match)}
              match={match}
              index={index}
            />
          ))}
        </View>
      ) : null}

      {metadata?.popularCards?.length ? (
        <View style={styles.popular}>
          <Text style={styles.sectionTitle}>Popular at {storeName}</Text>
          <Text style={styles.popularText}>{metadata.popularCards.join(" · ")}</Text>
        </View>
      ) : null}

      <View style={styles.walletSection}>
        <Text style={styles.sectionTitle}>All ranked cards</Text>
        <Text style={styles.meta}>
          {safeCards.length} cards · {providerCount} providers
          {cacheHit ? " · cached" : " · live"}
          {isMock ? " · offline data" : ""}
        </Text>

        <CompareCardsToolbar
          compareMode={compareMode}
          selectedCount={selectedIds.size}
          onToggleMode={onToggleMode}
          onCompare={onCompare}
        />

        {safeCards.map((card, index) => {
          const match = matchByCardId.get(card.card_id);
          return (
            <PremiumWalletCard
              key={cardMatchKey(card)}
              card={card}
              index={index}
              isBestMatch={index === 0 && !compareMode}
              compareMode={compareMode}
              selected={selectedIds.has(card.card_id)}
              onToggleSelect={() => onToggleSelect(card.card_id)}
              providerSource={match?.provider_source}
              isOwned={match?.is_owned}
            />
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  section: { marginBottom: spacing.md },
  sectionTitle: {
    ...typography.micro,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  popular: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.glass,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  popularText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  walletSection: { marginTop: spacing.sm },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
});
