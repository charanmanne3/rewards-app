import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/theme";

interface SearchEmptyStateProps {
  variant: "idle" | "no-results";
  query?: string;
}

export function SearchEmptyState({ variant, query }: SearchEmptyStateProps) {
  if (variant === "no-results") {
    return (
      <View style={styles.wrap}>
        <View style={styles.iconCircle}>
          <Ionicons name="search-outline" size={28} color={colors.textMuted} />
        </View>
        <Text style={styles.title}>No rewards for &quot;{query}&quot;</Text>
        <Text style={styles.subtitle}>
          Try a seeded store like Amazon, Walmart, or Costco. Names are case-insensitive.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Ionicons name="sparkles-outline" size={28} color={colors.gold} />
      </View>
      <Text style={styles.title}>Search any store</Text>
      <Text style={styles.subtitle}>
        Type a store name to instantly see your best card, cashback rate, and reward type.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 22,
    maxWidth: 300,
  },
});
