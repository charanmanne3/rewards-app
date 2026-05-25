import { ScrollView, Pressable, StyleSheet, Text, View } from "react-native";

import { StoreBrandLogo } from "@/components/stores/StoreBrandLogo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { colors, radius, spacing, typography } from "@/theme";
import type { Store } from "@/types/models";
import { dedupeStores, storeRowKey } from "@/utils/listKeys";
import { hapticSelect } from "@/utils/haptics";

interface RecentStoresSectionProps {
  stores: Store[];
  onSelect: (name: string) => void;
}

export function RecentStoresSection({ stores, onSelect }: RecentStoresSectionProps) {
  const list = dedupeStores(stores);
  if (list.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader title="Recent" />
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
            <StoreBrandLogo name={store.name} size={44} />
            <Text style={styles.name} numberOfLines={1}>
              {store.name}
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
    alignItems: "center",
    width: 84,
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  pressed: { opacity: 0.88 },
  name: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "500",
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
