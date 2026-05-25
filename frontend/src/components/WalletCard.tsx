import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { RewardTypeBadge } from "@/components/RewardTypeBadge";
import { colors, radius, spacing, typography } from "@/theme";
import type { CardRewardRank } from "@/types/models";

interface WalletCardProps {
  reward: CardRewardRank;
  variant?: "gold" | "blue";
}

export function WalletCard({ reward, variant = "gold" }: WalletCardProps) {
  const gradient =
    variant === "gold"
      ? ([colors.cardGradientGoldStart, colors.cardGradientGoldEnd] as const)
      : ([colors.cardGradientStart, colors.cardGradientEnd] as const);

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <Text style={styles.issuer}>{reward.issuer}</Text>
        <RewardTypeBadge type={reward.reward_type} compact />
      </View>
      <Text style={styles.cardName} numberOfLines={2}>
        {reward.card_name}
      </Text>
      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.cashbackLabel}>Cashback</Text>
          <Text style={styles.cashback}>{reward.cashback_percent}%</Text>
        </View>
        <View style={styles.chip} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    minHeight: 180,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  issuer: {
    ...typography.micro,
    color: colors.platinum,
    textTransform: "uppercase",
  },
  cardName: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.lg,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: spacing.md,
  },
  cashbackLabel: {
    ...typography.micro,
    color: colors.textMuted,
  },
  cashback: {
    ...typography.cashback,
    color: colors.gold,
    fontSize: 40,
    lineHeight: 44,
  },
  chip: {
    width: 40,
    height: 28,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
});
