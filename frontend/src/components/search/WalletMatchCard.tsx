import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { RewardTypeBadge } from "@/components/RewardTypeBadge";
import { colors, radius, spacing, typography } from "@/theme";
import type { StoreCardMatch } from "@/types/models";
import {
  BADGE_COLORS,
  BADGE_LABELS,
  formatAnnualFee,
  formatExpiry,
  getCardBadges,
} from "@/utils/cardBadges";
import { cardMatchKey } from "@/utils/listKeys";

interface WalletMatchCardProps {
  card: StoreCardMatch;
  index: number;
  storeName: string;
}

const GRADIENTS: [string, string][] = [
  ["#2A1F4E", "#0F172A"],
  ["#1E3A5F", "#0C1220"],
  ["#1A2E1A", "#0C1220"],
  ["#3D2E0A", "#1A1508"],
];

export function WalletMatchCard({ card, index, storeName }: WalletMatchCardProps) {
  const badges = getCardBadges(card, index);
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const expiry = formatExpiry(card.expires_at);

  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.network}>{card.network ?? "Card"}</Text>
        <Text style={styles.rank}>#{index + 1}</Text>
      </View>

      <View style={styles.badgeRow}>
        {badges.map((b, badgeIdx) => (
          <View
            key={`${cardMatchKey(card)}-badge-${b}-${badgeIdx}`}
            style={[styles.badge, { backgroundColor: BADGE_COLORS[b].bg }]}
          >
            <Text style={[styles.badgeText, { color: BADGE_COLORS[b].text }]}>{BADGE_LABELS[b]}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.cardName}>{card.card_name}</Text>
      <Text style={styles.issuer}>{card.issuer}</Text>

      <View style={styles.cashbackRow}>
        <View>
          <Text style={styles.cashbackLabel}>Cashback at {storeName}</Text>
          <Text style={styles.cashback}>{card.cashback_percent}%</Text>
        </View>
        <View style={styles.chip} />
      </View>

      <View style={styles.metaRow}>
        <Meta label="Annual fee" value={formatAnnualFee(card.annual_fee)} />
        <Meta label="Type" value={<RewardTypeBadge type={card.reward_type} compact />} />
      </View>

      {card.signup_bonus ? (
        <Text style={styles.bonus}>Bonus: {card.signup_bonus}</Text>
      ) : null}

      {expiry ? (
        <Text style={styles.expiry}>Offer expires {expiry}</Text>
      ) : null}
    </LinearGradient>
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <View style={styles.meta}>
      <Text style={styles.metaLabel}>{label}</Text>
      {typeof value === "string" ? <Text style={styles.metaValue}>{value}</Text> : value}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    minHeight: 200,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  network: {
    ...typography.micro,
    color: colors.platinum,
    textTransform: "uppercase",
  },
  rank: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "700",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  cardName: {
    ...typography.title,
    color: colors.text,
    fontSize: 20,
    marginTop: spacing.xs,
  },
  issuer: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  cashbackRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: spacing.md,
  },
  cashbackLabel: {
    ...typography.micro,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  cashback: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.gold,
    letterSpacing: -1,
  },
  chip: {
    width: 44,
    height: 32,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  meta: { flex: 1 },
  metaLabel: {
    ...typography.micro,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  metaValue: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: "600",
  },
  bonus: {
    ...typography.caption,
    color: colors.accent,
    marginTop: spacing.sm,
  },
  expiry: {
    ...typography.caption,
    color: colors.gold,
    marginTop: 4,
  },
});
