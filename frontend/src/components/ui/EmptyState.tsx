import { StyleSheet, Text, View } from "react-native";

import { AppIcon, Icons, type IconName } from "@/components/ui/AppIcon";
import { colors, spacing, typography } from "@/theme";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <AppIcon name={icon} size={32} color={colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.glass,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  title: {
    ...typography.title,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.subhead,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
});
