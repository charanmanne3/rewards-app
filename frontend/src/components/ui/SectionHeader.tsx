import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/theme";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, icon }: SectionHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {icon}
        <Text style={styles.title}>{title}</Text>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  title: {
    ...typography.micro,
    color: colors.textMuted,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
