import { ScrollView, Pressable, StyleSheet, Text, View } from "react-native";

import { StoreBrandLogo } from "@/components/stores/StoreBrandLogo";
import { AppIcon, Icons } from "@/components/ui/AppIcon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { colors, radius, spacing, typography } from "@/theme";
import type { Store } from "@/types/models";
import { dedupeStores, storeRowKey } from "@/utils/listKeys";
import { hapticSelect } from "@/utils/haptics";

interface TrendingStoresSectionProps {
  stores: Store[];
  onSelect: (name: string) => void;
}

export function TrendingStoresSection({ stores, onSelect }: TrendingStoresSectionProps) {
  const list = dedupeStores(stores);
  if (list.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader
        title="Trending"
        icon={<AppIcon name={Icons.trending} size={14} color={colors.gold} />}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {list.map((store) => (
          <Pressable
            key={storeRowKey(store)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            onPress={() => {
              hapticSelect();
              onSelect(store.name);
            }}
          >
            <StoreBrandLogo name={store.name} size={48} />
            <Text style={styles.name} numberOfLines={1}>
              {store.name}
            </Text>
            <Text style={styles.category} numberOfLines={1}>
              {store.category}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.lg },
  scroll: { gap: spacing.sm },
  card: {
    width: 108,
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  name: {
    ...typography.caption,
    color: colors.text,
    fontWeight: "600",
    marginTop: spacing.sm,
    textAlign: "center",
  },
  category: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    textAlign: "center",
  },
});
