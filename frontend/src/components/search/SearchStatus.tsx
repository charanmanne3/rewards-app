import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/theme";

interface SearchLoadingProps {
  query: string;
}

export function SearchLoading({ query }: SearchLoadingProps) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="small" color={colors.gold} />
      <Text style={styles.text}>Finding cards for {query}…</Text>
    </View>
  );
}

interface SearchErrorProps {
  message: string;
  onRetry?: () => void;
}

export function SearchError({ message, onRetry }: SearchErrorProps) {
  return (
    <View style={styles.errorWrap}>
      <Ionicons name="cloud-offline-outline" size={24} color={colors.error} />
      <Text style={styles.errorText}>{message}</Text>
      {onRetry ? (
        <Text style={styles.retry} onPress={onRetry}>
          Tap to retry
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  text: {
    ...typography.body,
    color: colors.textMuted,
    flex: 1,
  },
  errorWrap: {
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.errorBg,
    borderRadius: 14,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: "center",
  },
  retry: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 4,
  },
});
