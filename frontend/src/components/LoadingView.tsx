import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";

interface LoadingViewProps {
  message?: string;
}

export function LoadingView({ message = "Loading..." }: LoadingViewProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    gap: 16,
  },
  text: {
    color: colors.textMuted,
    fontSize: 16,
  },
});
