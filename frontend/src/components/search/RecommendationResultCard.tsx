import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { RewardTypeBadge } from "@/components/RewardTypeBadge";
import { colors, radius, spacing, typography } from "@/theme";
import type { BestCardRecommendation } from "@/types/models";

interface RecommendationResultCardProps {
  data: BestCardRecommendation;
}

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function RecommendationResultCard({ data }: RecommendationResultCardProps) {
  const best = data.best_card;
  if (!best) return null;

  const showExpiration =
    best.reward_type === "PROMOTIONAL" || best.reward_type === "ROTATING" || best.end_date;
  const expiration = formatDate(best.end_date);

  return (
    <LinearGradient
      colors={[colors.cardGradientGoldStart, colors.cardGradientGoldEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.storePill}>
          <Ionicons name="storefront-outline" size={14} color={colors.gold} />
          <Text style={styles.storeName}>{data.store_name}</Text>
        </View>
        <RewardTypeBadge type={best.reward_type} compact />
      </View>

      <Text style={styles.label}>Best card</Text>
      <Text style={styles.cardName}>{best.card_name}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Cashback</Text>
          <Text style={styles.statValue}>{best.cashback_percent}%</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Issuer</Text>
          <Text style={styles.statValueSm}>{best.issuer}</Text>
        </View>
      </View>

      {showExpiration && expiration ? (
        <View style={styles.expiryRow}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={styles.expiryText}>Expires {expiration}</Text>
        </View>
      ) : null}

      <Text style={styles.asOf}>Rates as of {data.as_of_date}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.25)",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  storePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  storeName: {
    ...typography.subtitle,
    color: colors.text,
    fontSize: 14,
  },
  label: {
    ...typography.micro,
    color: colors.gold,
    textTransform: "uppercase",
  },
  cardName: {
    ...typography.title,
    color: colors.text,
    fontSize: 24,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: radius.md,
    padding: spacing.md,
  },
  stat: { flex: 1 },
  statLabel: {
    ...typography.micro,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.gold,
    marginTop: 2,
  },
  statValueSm: {
    ...typography.subtitle,
    color: colors.text,
    marginTop: 4,
    fontSize: 15,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: spacing.md,
  },
  expiryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.md,
  },
  expiryText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  asOf: {
    ...typography.micro,
    color: colors.textMuted,
    marginTop: spacing.md,
    textTransform: "none",
    letterSpacing: 0,
  },
});
