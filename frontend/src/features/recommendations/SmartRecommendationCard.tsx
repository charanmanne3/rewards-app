import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";

import { GlassCard } from "@/components/ui/GlassCard";
import { ProviderBadge } from "@/components/ui/ProviderBadge";
import { colors, radius, spacing, typography } from "@/theme";
import type { RecommendationMatch } from "@/types/models";
import { formatExpiry } from "@/utils/cardBadges";

interface SmartRecommendationCardProps {
  match: RecommendationMatch;
  index: number;
  highlight?: string;
}

function rewardDescription(match: RecommendationMatch): string {
  const pct = `${match.cashback_percent}%`;
  switch (match.reward_type) {
    case "ROTATING":
      return `${pct} rotating rewards — activate category before paying`;
    case "PROMOTIONAL":
      return `${pct} limited-time offer`;
    default:
      return `${pct} cashback on eligible purchases`;
  }
}

export function SmartRecommendationCard({
  match,
  index,
  highlight,
}: SmartRecommendationCardProps) {
  const expiry = formatExpiry(match.expires_at);

  return (
    <Animated.View entering={FadeInRight.delay(index * 60).duration(380)}>
      <GlassCard style={styles.card} intensity={42}>
        <View style={styles.row}>
          <View style={styles.rank}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>
          <View style={styles.body}>
            <View style={styles.titleRow}>
              <Text style={styles.cardName}>{match.card_name}</Text>
              <Text style={styles.pct}>{match.cashback_percent}%</Text>
            </View>
            <Text style={styles.issuer}>{match.issuer}</Text>
            <Text style={styles.desc}>{highlight ?? rewardDescription(match)}</Text>
            <View style={styles.footer}>
              <ProviderBadge provider={match.provider_source} />
              {expiry ? <Text style={styles.expiry}>{expiry}</Text> : null}
              {match.is_owned ? (
                <View style={styles.owned}>
                  <Text style={styles.ownedText}>Owned</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  row: { flexDirection: "row", gap: spacing.md },
  rank: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.glass,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  rankText: {
    ...typography.micro,
    color: colors.textMuted,
    fontWeight: "700",
  },
  body: { flex: 1 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardName: {
    ...typography.headline,
    color: colors.text,
    fontSize: 16,
    flex: 1,
  },
  pct: {
    ...typography.headline,
    color: colors.gold,
    fontSize: 18,
  },
  issuer: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  desc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  expiry: {
    ...typography.micro,
    color: colors.textMuted,
  },
  owned: {
    backgroundColor: "rgba(52, 199, 89, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  ownedText: {
    ...typography.micro,
    color: colors.accent,
  },
});
