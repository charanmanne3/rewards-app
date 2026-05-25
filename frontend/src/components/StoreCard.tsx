import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import type { Store } from "@/types/api";

interface StoreCardProps {
  store: Store;
  onPress: () => void;
}

export function StoreCard({ store, onPress }: StoreCardProps) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Ionicons name="storefront-outline" size={22} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{store.name}</Text>
        <Text style={styles.category}>{store.category}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "600",
  },
  category: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
});
