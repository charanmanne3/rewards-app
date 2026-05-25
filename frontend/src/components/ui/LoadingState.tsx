import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/theme";

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({ message = "Loading...", fullScreen = true }: LoadingStateProps) {
  return (
    <View style={[styles.wrap, fullScreen && styles.full]}>
      <ActivityIndicator size="large" color={colors.gold} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  full: {
    flex: 1,
    backgroundColor: colors.background,
  },
  text: {
    ...typography.body,
    color: colors.textMuted,
  },
});
