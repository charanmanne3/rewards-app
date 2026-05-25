import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";

import { StoreBrandLogo } from "@/components/stores/StoreBrandLogo";
import { formatDistance } from "@/services/location";
import type { NearbyStore } from "@/services/stores";
import { colors, radius, spacing, typography } from "@/theme";
import { hapticSelect } from "@/utils/haptics";

interface NearbyStoresCarouselProps {
  stores: NearbyStore[];
  selectedName?: string;
  onSelect: (store: NearbyStore) => void;
}

export function NearbyStoresCarousel({
  stores,
  selectedName,
  onSelect,
}: NearbyStoresCarouselProps) {
  if (!stores.length) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {stores.map((store, index) => {
        const selected = store.name === selectedName;
        return (
          <Animated.View
            key={store.id}
            entering={FadeInRight.delay(index * 50).duration(300)}
          >
            <Pressable
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => {
                hapticSelect();
                onSelect(store);
              }}
            >
              <StoreBrandLogo name={store.name} size={44} />
              <Text style={styles.name} numberOfLines={1}>
                {store.name}
              </Text>
              <Text style={styles.dist}>{formatDistance(store.distanceMeters)}</Text>
              {store.rating != null ? (
                <View style={styles.rating}>
                  <Text style={styles.ratingText}>★ {store.rating.toFixed(1)}</Text>
                </View>
              ) : null}
            </Pressable>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    width: 100,
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  chipSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.goldSoft,
  },
  name: {
    ...typography.caption,
    color: colors.text,
    fontWeight: "600",
    marginTop: spacing.xs,
    textAlign: "center",
  },
  dist: {
    ...typography.micro,
    color: colors.textMuted,
    marginTop: 2,
  },
  rating: { marginTop: 4 },
  ratingText: { ...typography.micro, color: colors.gold },
});
