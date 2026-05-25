import { Pressable, StyleSheet, Text, View } from "react-native";

import { StoreBrandLogo } from "@/components/stores/StoreBrandLogo";
import { AppIcon, Icons } from "@/components/ui/AppIcon";
import { colors, radius, spacing, typography } from "@/theme";
import type { Store } from "@/types/models";
import { hapticSelect } from "@/utils/haptics";

interface StoreListRowProps {
  store: Store;
  onPress: () => void;
  compact?: boolean;
}

export function StoreListRow({ store, onPress, compact = false }: StoreListRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        compact && styles.rowCompact,
        pressed && styles.pressed,
      ]}
      onPress={() => {
        hapticSelect();
        onPress();
      }}
    >
      <StoreBrandLogo name={store.name} size={compact ? 42 : 48} />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {store.name}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {store.category}
        </Text>
      </View>
      <View style={styles.chevronWrap}>
        <AppIcon name={Icons.chevronForward} size={16} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  rowCompact: {
    paddingVertical: spacing.sm + 2,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },
  content: { flex: 1, minWidth: 0 },
  name: {
    ...typography.headline,
    color: colors.text,
    fontSize: 16,
  },
  category: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});
