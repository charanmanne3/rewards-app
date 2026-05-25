import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { StoreBrandLogo } from "@/components/stores/StoreBrandLogo";
import { AppIcon, Icons } from "@/components/ui/AppIcon";
import { colors, radius, shadow, spacing, typography } from "@/theme";
import type { RecommendationMatch } from "@/types/models";
import { formatExpiry } from "@/utils/cardBadges";

interface BestCardHeroProps {
  storeName: string;
  storeCategory: string;
  best: RecommendationMatch;
  rewardHint?: string;
}

export function BestCardHero({
  storeName,
  storeCategory,
  best,
  rewardHint,
}: BestCardHeroProps) {
  const expiry = formatExpiry(best.expires_at);
  const typeLabel =
    best.reward_type === "ROTATING"
      ? "Rotating"
      : best.reward_type === "PROMOTIONAL"
        ? "Active offer"
        : "Cashback";

  return (
    <Animated.View entering={FadeInDown.duration(420).springify()} style={styles.wrap}>
      <LinearGradient
        colors={["rgba(212, 175, 55, 0.22)", "rgba(91, 141, 239, 0.12)", "rgba(12, 14, 22, 0.95)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.glow} />
        <View style={styles.topRow}>
          <StoreBrandLogo name={storeName} size={52} />
          <View style={styles.storeText}>
            <Text style={styles.eyebrow}>Best card to use</Text>
            <Text style={styles.storeName}>{storeName}</Text>
            <Text style={styles.category}>{storeCategory}</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{best.card_name}</Text>
            <Text style={styles.issuer}>{best.issuer}</Text>
            <View style={styles.tags}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{typeLabel}</Text>
              </View>
              {expiry ? (
                <View style={[styles.tag, styles.tagMuted]}>
                  <Text style={styles.tagTextMuted}>{expiry}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.percentBlock}>
            <Text style={styles.percent}>{best.cashback_percent}%</Text>
            <Text style={styles.percentLabel}>back</Text>
          </View>
        </View>

        {rewardHint ? (
          <View style={styles.hintRow}>
            <AppIcon name={Icons.sparkles} size={14} color={colors.gold} />
            <Text style={styles.hint}>{rewardHint}</Text>
          </View>
        ) : null}

        {best.is_owned ? (
          <View style={styles.ownedBadge}>
            <AppIcon name={Icons.checkmark} size={14} color={colors.accent} />
            <Text style={styles.ownedText}>In your wallet</Text>
          </View>
        ) : null}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.xl,
    overflow: "hidden",
    marginBottom: spacing.md,
    ...shadow.card,
  },
  gradient: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
  },
  glow: {
    position: "absolute",
    top: -40,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  storeText: { flex: 1 },
  eyebrow: {
    ...typography.micro,
    color: colors.gold,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  storeName: {
    ...typography.title,
    color: colors.text,
    fontSize: 22,
    marginTop: 2,
  },
  category: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  cardInfo: { flex: 1, paddingRight: spacing.md },
  cardName: {
    ...typography.headline,
    color: colors.text,
    fontSize: 20,
  },
  issuer: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  tagMuted: { backgroundColor: colors.glass },
  tagText: {
    ...typography.micro,
    color: colors.gold,
  },
  tagTextMuted: {
    ...typography.micro,
    color: colors.textMuted,
  },
  percentBlock: { alignItems: "flex-end" },
  percent: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.gold,
    letterSpacing: -1,
  },
  percentLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: -4,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.glassBorder,
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  ownedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.sm,
  },
  ownedText: {
    ...typography.caption,
    color: colors.accent,
  },
});
