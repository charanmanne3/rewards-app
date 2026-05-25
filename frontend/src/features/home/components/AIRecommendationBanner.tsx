import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon, Icons } from "@/components/ui/AppIcon";
import { GlassCard } from "@/components/ui/GlassCard";
import { colors, radius, spacing, typography } from "@/theme";
import type { Recommendation } from "@/services/recommendations/types";
import { hapticLight } from "@/utils/haptics";

interface AIRecommendationBannerProps {
  recommendation: Recommendation;
  onPress?: () => void;
}

export function AIRecommendationBanner({ recommendation, onPress }: AIRecommendationBannerProps) {
  if (!recommendation?.cardName) return null;

  return (
    <Pressable
      onPress={() => {
        hapticLight();
        onPress?.();
      }}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <GlassCard style={styles.card} intensity={50}>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <AppIcon name={Icons.sparkles} size={18} color={colors.gold} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.headline}>{recommendation.headline}</Text>
            <Text style={styles.body} numberOfLines={2}>
              {recommendation.body}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{recommendation.cashbackPercent}%</Text>
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md },
  pressed: { opacity: 0.92 },
  content: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.goldSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: { flex: 1 },
  headline: {
    ...typography.headline,
    color: colors.text,
    fontSize: 15,
  },
  body: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 17,
  },
  badge: {
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  badgeText: {
    ...typography.headline,
    color: colors.gold,
    fontSize: 14,
  },
});
