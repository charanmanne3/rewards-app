import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RankedCardRow } from "@/components/RankedCardRow";
import { WalletCard } from "@/components/WalletCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ApiError } from "@/services/api";
import { useBestCard } from "@/services/queries";
import { colors, spacing, typography } from "@/theme";
import type { CardRewardRank } from "@/types/models";

export default function RecommendationScreen() {
  const { storeName } = useLocalSearchParams<{ storeName: string }>();
  const { data, isLoading, isError, error, refetch } = useBestCard(storeName);

  if (isLoading) {
    return <LoadingState message={`Finding best card for ${storeName}...`} />;
  }

  if (isError || !data) {
    const message =
      error instanceof ApiError ? error.message : "Failed to load recommendation";
    return <ErrorState message={message} onRetry={() => refetch()} />;
  }

  const best = data.best_card;

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.storeName}>{data.store_name}</Text>
          <Text style={styles.category}>{data.store_category}</Text>
          <Text style={styles.asOf}>Rates as of {data.as_of_date}</Text>
        </View>

        {best ? (
          <View style={styles.heroSection}>
            <Text style={styles.sectionLabel}>Best card for this store</Text>
            <WalletCard reward={best} variant="gold" />
            <View style={styles.metaGrid}>
              <MetaItem label="Issuer" value={best.issuer} />
              <MetaItem label="Cashback" value={`${best.cashback_percent}%`} highlight />
              <MetaItem label="Reward type" value={best.reward_type} />
            </View>
          </View>
        ) : (
          <View style={styles.emptyHero}>
            <Text style={styles.emptyText}>No active rewards for this store today.</Text>
          </View>
        )}

        {data.all_ranked_cards.length > 1 ? (
          <>
            <Text style={styles.sectionTitle}>All ranked cards</Text>
            {data.all_ranked_cards.map((card: CardRewardRank, index: number) => (
              <RankedCardRow
                key={`${card.reward_id}-${card.card_id}`}
                rank={card}
                position={index + 1}
                isBest={index === 0}
              />
            ))}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={[styles.metaValue, highlight && styles.metaHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.lg },
  storeName: {
    ...typography.hero,
    fontSize: 28,
    color: colors.text,
  },
  category: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  asOf: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  heroSection: { marginBottom: spacing.lg },
  sectionLabel: {
    ...typography.micro,
    color: colors.gold,
    marginBottom: spacing.md,
    textTransform: "uppercase",
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  metaItem: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  metaLabel: {
    ...typography.micro,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  metaValue: {
    ...typography.subtitle,
    color: colors.text,
    marginTop: 4,
    fontSize: 14,
  },
  metaHighlight: { color: colors.gold },
  emptyHero: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  emptyText: { color: colors.textMuted, textAlign: "center" },
  sectionTitle: {
    ...typography.micro,
    color: colors.textMuted,
    marginBottom: spacing.md,
    textTransform: "uppercase",
  },
});
