import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme";
import type { NearbyRadius } from "@/services/stores";
import { RADIUS_OPTIONS } from "@/services/stores";
import { hapticSelect } from "@/utils/haptics";

interface RadiusFilterProps {
  value: NearbyRadius;
  onChange: (radius: NearbyRadius) => void;
}

export function RadiusFilter({ value, onChange }: RadiusFilterProps) {
  return (
    <View style={styles.row}>
      {RADIUS_OPTIONS.map((r) => (
        <Pressable
          key={`radius-${r}`}
          style={[styles.chip, value === r && styles.chipActive]}
          onPress={() => {
            hapticSelect();
            onChange(r);
          }}
        >
          <Text style={[styles.text, value === r && styles.textActive]}>
            {r < 1000 ? `${r}m` : "1km"}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.xs, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  text: { ...typography.caption, color: colors.textMuted },
  textActive: { color: colors.primary, fontWeight: "600" },
});
