import { ScrollView, Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon, Icons } from "@/components/ui/AppIcon";
import { colors, radius, spacing, typography } from "@/theme";
import { hapticSelect } from "@/utils/haptics";

interface RecentChipsProps {
  items: string[];
  onSelect: (name: string) => void;
}

export function RecentChips({ items, onSelect }: RecentChipsProps) {
  if (items.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {items.map((name) => (
        <Pressable
          key={`chip:${name.toLowerCase()}`}
          style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
          onPress={() => {
            hapticSelect();
            onSelect(name);
          }}
        >
          <AppIcon name={Icons.time} size={16} color={colors.primary} />
          <Text style={styles.text}>{name}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.sm },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(91, 141, 239, 0.25)",
  },
  pressed: { opacity: 0.8 },
  text: { ...typography.subhead, color: colors.primary, fontWeight: "500" },
});
