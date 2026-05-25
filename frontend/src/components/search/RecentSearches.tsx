import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme";
import { dedupeStrings } from "@/utils/listKeys";

interface RecentSearchesProps {
  items: string[];
  onSelect: (name: string) => void;
  onClear: () => void;
}

export function RecentSearches({ items, onSelect, onClear }: RecentSearchesProps) {
  const list = dedupeStrings(items);
  if (list.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent searches</Text>
        <Pressable onPress={onClear} hitSlop={8}>
          <Text style={styles.clear}>Clear</Text>
        </Pressable>
      </View>
      {list.map((name) => (
        <Pressable
          key={`recent:${name.toLowerCase()}`}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => onSelect(name)}
        >
          <Ionicons name="time-outline" size={18} color={colors.textMuted} />
          <Text style={styles.name}>{name}</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.micro,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  clear: {
    ...typography.caption,
    color: colors.primary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  rowPressed: { opacity: 0.88 },
  name: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
});
