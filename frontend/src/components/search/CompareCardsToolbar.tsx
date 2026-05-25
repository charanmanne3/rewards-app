import { Pressable, Switch, StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/theme";
import { hapticLight } from "@/utils/haptics";

interface CompareCardsToolbarProps {
  compareMode: boolean;
  selectedCount: number;
  onToggleMode: (enabled: boolean) => void;
  onCompare: () => void;
}

export function CompareCardsToolbar({
  compareMode,
  selectedCount,
  onToggleMode,
  onCompare,
}: CompareCardsToolbarProps) {
  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        <Text style={styles.label}>Compare cards</Text>
        {compareMode && selectedCount > 0 ? (
          <Text style={styles.count}>{selectedCount} selected</Text>
        ) : null}
      </View>
      <Switch
        value={compareMode}
        onValueChange={(v) => {
          hapticLight();
          onToggleMode(v);
        }}
        trackColor={{ false: colors.glass, true: colors.accentSoft }}
        thumbColor={compareMode ? colors.accent : colors.textMuted}
      />
      {compareMode && selectedCount >= 2 ? (
        <Pressable onPress={onCompare} hitSlop={8}>
          <Text style={styles.compareBtn}>Compare</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  left: { flex: 1 },
  label: { ...typography.headline, color: colors.text, fontSize: 15 },
  count: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  compareBtn: {
    ...typography.headline,
    color: colors.gold,
    fontSize: 15,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
