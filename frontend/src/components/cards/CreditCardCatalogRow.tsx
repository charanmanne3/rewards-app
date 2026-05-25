import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { RewardTypeBadge } from "@/components/RewardTypeBadge";
import { colors, radius, spacing, typography } from "@/theme";
import type { CardRewardSummary, CreditCardDetail } from "@/types/models";

interface CreditCardCatalogRowProps {
  card: CreditCardDetail;
  onStorePress?: (storeName: string) => void;
}

export function CreditCardCatalogRow({ card, onStorePress }: CreditCardCatalogRowProps) {
  const topRewards = card.rewards.slice(0, 4);
  const moreCount = card.rewards.length - topRewards.length;

  return (
    <LinearGradient
      colors={[colors.surface, colors.backgroundElevated]}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.name}>{card.card_name}</Text>
          <Text style={styles.issuer}>{card.issuer}</Text>
        </View>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{card.rewards.length} offers</Text>
        </View>
      </View>

      {topRewards.length === 0 ? (
        <Text style={styles.empty}>No active reward mappings</Text>
      ) : (
        topRewards.map((reward, idx) => (
          <RewardCategoryRow
            key={`${card.id}-${reward.store_name}-${reward.reward_type}-${reward.cashback_percent}`}
            reward={reward}
            onPress={onStorePress ? () => onStorePress(reward.store_name) : undefined}
          />
        ))
      )}

      {moreCount > 0 ? (
        <Text style={styles.more}>+{moreCount} more categories</Text>
      ) : null}
    </LinearGradient>
  );
}

function RewardCategoryRow({
  reward,
  onPress,
}: {
  reward: CardRewardSummary;
  onPress?: () => void;
}) {
  const content = (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.store}>{reward.store_name}</Text>
        <Text style={styles.category}>{reward.store_category}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.pct}>{reward.cashback_percent}%</Text>
        <RewardTypeBadge type={reward.reward_type} compact />
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable style={({ pressed }) => [styles.rowWrap, pressed && styles.rowPressed]} onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.rowWrap}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  headerText: { flex: 1 },
  name: {
    ...typography.subtitle,
    color: colors.text,
    fontSize: 17,
  },
  issuer: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  countPill: {
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  countText: {
    ...typography.micro,
    color: colors.gold,
    textTransform: "none",
    letterSpacing: 0,
  },
  rowWrap: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  rowPressed: { opacity: 0.85 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLeft: { flex: 1, marginRight: spacing.sm },
  store: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  category: {
    ...typography.micro,
    color: colors.textMuted,
    textTransform: "none",
    letterSpacing: 0,
    marginTop: 2,
  },
  rowRight: { alignItems: "flex-end", gap: 4 },
  pct: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.accent,
  },
  more: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  empty: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: "italic",
  },
});
