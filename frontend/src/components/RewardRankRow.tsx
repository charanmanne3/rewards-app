import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import type { CardRewardRank } from "@/types/api";

interface RewardRankRowProps {
  rank: CardRewardRank;
  position: number;
  isBest?: boolean;
}

export function RewardRankRow({ rank, position, isBest }: RewardRankRowProps) {
  return (
    <View style={[styles.row, isBest && styles.rowBest]}>
      <View style={[styles.badge, isBest && styles.badgeBest]}>
        <Text style={styles.badgeText}>#{position}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.cardName}>{rank.card_name}</Text>
        <Text style={styles.issuer}>{rank.issuer}</Text>
        <Text style={styles.typeBadge}>{rank.reward_type}</Text>
      </View>
      <Text style={[styles.percent, isBest && styles.percentBest]}>
        {rank.cashback_percent}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowBest: {
    borderColor: colors.gold,
    backgroundColor: "#1E293B",
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  badgeBest: {
    backgroundColor: "#422006",
  },
  badgeText: {
    color: colors.textMuted,
    fontWeight: "700",
    fontSize: 13,
  },
  info: {
    flex: 1,
  },
  cardName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  issuer: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  typeBadge: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 4,
    textTransform: "uppercase",
  },
  percent: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  percentBest: {
    color: colors.gold,
  },
});
