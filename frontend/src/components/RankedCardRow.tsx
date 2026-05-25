import { StyleSheet, Text, View } from "react-native";

import { RewardTypeBadge } from "@/components/RewardTypeBadge";
import { colors, radius, spacing, typography } from "@/theme";
import type { CardRewardRank } from "@/types/models";

interface RankedCardRowProps {
  rank: CardRewardRank;
  position: number;
  isBest?: boolean;
}

export function RankedCardRow({ rank, position, isBest }: RankedCardRowProps) {
  return (
    <View style={[styles.row, isBest && styles.rowBest]}>
      <View style={[styles.rankBadge, isBest && styles.rankBest]}>
        <Text style={[styles.rankText, isBest && styles.rankTextBest]}>#{position}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.cardName}>{rank.card_name}</Text>
        <Text style={styles.issuer}>{rank.issuer}</Text>
        <RewardTypeBadge type={rank.reward_type} compact />
      </View>
      <Text style={[styles.percent, isBest && styles.percentBest]}>{rank.cashback_percent}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  rowBest: {
    borderColor: colors.gold,
    backgroundColor: colors.backgroundElevated,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  rankBest: { backgroundColor: colors.goldSoft },
  rankText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "700",
  },
  rankTextBest: { color: colors.gold },
  info: { flex: 1, gap: 4 },
  cardName: {
    ...typography.subtitle,
    color: colors.text,
    fontSize: 15,
  },
  issuer: {
    ...typography.caption,
    color: colors.textMuted,
  },
  percent: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary,
  },
  percentBest: { color: colors.gold },
});
