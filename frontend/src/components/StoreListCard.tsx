import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme";
import type { Store } from "@/types/models";

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  "Grocery & General": "cart-outline",
  "Department Store": "bag-outline",
  "Online Retail": "globe-outline",
  "Warehouse Club": "business-outline",
  Electronics: "hardware-chip-outline",
  Grocery: "nutrition-outline",
  Pharmacy: "medical-outline",
  "Home Improvement": "hammer-outline",
  "Dining & Coffee": "cafe-outline",
};

interface StoreListCardProps {
  store: Store;
  onPress: () => void;
}

export function StoreListCard({ store, onPress }: StoreListCardProps) {
  const icon = CATEGORY_ICONS[store.category] ?? "storefront-outline";

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={22} color={colors.gold} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{store.name}</Text>
        <Text style={styles.category}>{store.category}</Text>
      </View>
      <View style={styles.chevronWrap}>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundElevated,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  content: { flex: 1 },
  name: {
    ...typography.subtitle,
    color: colors.text,
  },
  category: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundElevated,
    alignItems: "center",
    justifyContent: "center",
  },
});
