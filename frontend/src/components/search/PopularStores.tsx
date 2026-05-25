import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme";

const POPULAR = ["Amazon", "Walmart", "Costco", "Starbucks", "Target", "Best Buy"];

interface PopularStoresProps {
  onSelect: (name: string) => void;
}

export function PopularStores({ onSelect }: PopularStoresProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Popular stores</Text>
      <View style={styles.chips}>
        {POPULAR.map((name) => (
          <Pressable
            key={`popular:${name}`}
            style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
            onPress={() => onSelect(name)}
          >
            <Text style={styles.chipText}>{name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg },
  title: {
    ...typography.micro,
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  chipPressed: { opacity: 0.85, borderColor: colors.gold },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
