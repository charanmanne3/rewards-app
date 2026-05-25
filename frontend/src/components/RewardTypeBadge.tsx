import { StyleSheet, Text, View } from "react-native";

import { colors, radius, typography } from "@/theme";
import type { RewardType } from "@/types/models";

const STYLES: Record<RewardType, { bg: string; text: string; label: string }> = {
  STATIC: { bg: "rgba(59, 130, 246, 0.2)", text: colors.primary, label: "Static" },
  ROTATING: { bg: colors.goldSoft, text: colors.gold, label: "Rotating" },
  PROMOTIONAL: { bg: colors.accentSoft, text: colors.accent, label: "Promo" },
};

interface RewardTypeBadgeProps {
  type: RewardType;
  compact?: boolean;
}

export function RewardTypeBadge({ type, compact }: RewardTypeBadgeProps) {
  const s = STYLES[type];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }, compact && styles.compact]}>
      <Text style={[styles.text, { color: s.text }, compact && styles.textCompact]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  compact: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    ...typography.micro,
    textTransform: "uppercase",
  },
  textCompact: {
    fontSize: 10,
  },
});
