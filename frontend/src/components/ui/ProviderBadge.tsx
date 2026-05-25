import { StyleSheet, Text, View } from "react-native";

import { colors, radius, typography } from "@/theme";
import { providerLabel } from "@/utils/recommendations";

interface ProviderBadgeProps {
  provider: string;
  compact?: boolean;
}

const PROVIDER_COLORS: Record<string, string> = {
  database: colors.primary,
  cached: colors.textMuted,
  affiliate: colors.gold,
  plaid: "#6EE7B7",
  stripe_fc: "#A78BFA",
  ai: colors.accent,
};

export function ProviderBadge({ provider, compact = false }: ProviderBadgeProps) {
  const color = PROVIDER_COLORS[provider] ?? colors.textSecondary;
  return (
    <View style={[styles.badge, compact && styles.badgeCompact, { borderColor: `${color}55` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, compact && styles.textCompact, { color }]}>
        {providerLabel(provider)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: colors.glass,
  },
  badgeCompact: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "600",
  },
  textCompact: {
    fontSize: 10,
  },
});
