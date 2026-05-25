import { ScrollView, Pressable, StyleSheet, Text, View } from "react-native";

import { StoreBrandLogo } from "@/components/stores/StoreBrandLogo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { colors, radius, spacing, typography } from "@/theme";
import { FEATURED_STORE_NAMES } from "@/utils/storeBrands";
import { hapticSelect } from "@/utils/haptics";

interface FeaturedStoresProps {
  onSelect: (name: string) => void;
}

export function FeaturedStores({ onSelect }: FeaturedStoresProps) {
  return (
    <View style={styles.section}>
      <SectionHeader title="Featured" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {FEATURED_STORE_NAMES.map((name) => (
          <Pressable
            key={`featured:${name}`}
            style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
            onPress={() => {
              hapticSelect();
              onSelect(name);
            }}
          >
            <StoreBrandLogo name={name} size={52} />
            <Text style={styles.label}>{name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.lg },
  scroll: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    alignItems: "center",
    width: 96,
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  chipPressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "500",
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
