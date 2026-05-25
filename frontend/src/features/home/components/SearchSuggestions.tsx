import { Pressable, StyleSheet, Text, View } from "react-native";

import { StoreBrandLogo } from "@/components/stores/StoreBrandLogo";
import { colors, radius, spacing, typography } from "@/theme";
import type { Store } from "@/types/models";
import { storeRowKey } from "@/utils/listKeys";
import { hapticSelect } from "@/utils/haptics";

interface SearchSuggestionsProps {
  suggestions: Store[];
  onSelect: (name: string) => void;
}

export function SearchSuggestions({ suggestions, onSelect }: SearchSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {suggestions.map((store) => (
        <Pressable
          key={storeRowKey(store)}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          onPress={() => {
            hapticSelect();
            onSelect(store.name);
          }}
        >
          <StoreBrandLogo name={store.name} size={40} />
          <View style={styles.info}>
            <Text style={styles.name}>{store.name}</Text>
            <Text style={styles.category}>{store.category}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glassBorder,
  },
  pressed: { backgroundColor: colors.surfaceHover },
  info: { flex: 1 },
  name: { ...typography.headline, color: colors.text, fontSize: 15 },
  category: { ...typography.caption, color: colors.textMuted, marginTop: 1 },
});
