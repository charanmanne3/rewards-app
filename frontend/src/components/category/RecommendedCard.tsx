import { Pressable, StyleSheet, Text, View } from "react-native";

import type { CategoryRecommendItem } from "@/types/models";
import { GlassCard } from "@/components/ui/GlassCard";
import { colors, radius, spacing, typography } from "@/theme";

interface RecommendedCardProps {
  item: CategoryRecommendItem;
  onPress: () => void;
}

/**
 * Card UI for a single recommendation row.
 *
 * Tapping navigates to card details.
 */
export function RecommendedCard({ item, onPress }: RecommendedCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && { opacity: 0.95 }]}
      className="mb-3"
    >
      <GlassCard style={styles.card} intensity={45} blur>
        <View style={styles.header} className="flex-row items-start justify-between">
          <View style={{ flex: 1 }} className="flex-1">
            <Text style={styles.cardName} numberOfLines={1}>
              {item.card_name}
            </Text>
            <Text style={styles.cardMeta} numberOfLines={2}>
              {item.reward_category}
            </Text>
          </View>

          <View style={styles.rateBox} className="items-end pl-2">
            <Text style={styles.rateLabel}>Reward rate</Text>
            <Text style={styles.rateValue}>{item.reward_rate}</Text>
          </View>
        </View>

        <View style={styles.footerRow} className="mt-4 flex-row items-center justify-between rounded-xl bg-white/5 px-3 py-2">
          <Text style={styles.footerLabel}>Annual fee</Text>
          <Text style={styles.footerValue}>
            {item.annual_fee === null ? "N/A" : `$${item.annual_fee}`}
          </Text>
        </View>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.sm,
  },
  card: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  cardName: {
    ...typography.title,
    color: colors.text,
    fontSize: 18,
  },
  cardMeta: {
    ...typography.caption,
    marginTop: 6,
    color: colors.textMuted,
    maxWidth: 220,
  },
  rateBox: {
    alignItems: "flex-end",
    paddingLeft: 8,
  },
  rateLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  rateValue: {
    ...typography.headline,
    color: colors.primary,
    fontSize: 26,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  footerLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  footerValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
  },
});

